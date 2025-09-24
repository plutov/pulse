import Hapi from "@hapi/hapi";
import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { MonitorScheduler } from "../../src/services/scheduler";
import { closeTestDb, getTestDb } from "../setup/database";
import { createTestUser } from "../utils/auth";
import { HttpRunDetails, Monitor, WithStatusStatusEnum } from "@pulse/shared";
import { MonitorRepository } from "../../src/models/repositories/monitors";
import { RunRepository } from "../../src/models/repositories/runs";
import { UserRepository } from "../../src/models/repositories/users";
import { randomUUID } from "crypto";
import { createTestServer } from "../setup/server";
import { createTestMonitor } from "../utils/monitors";

describe("Monitor Scheduler", () => {
  let server: Hapi.Server;
  const db = getTestDb();
  const userRepository = new UserRepository(db);
  const monitorRepository = new MonitorRepository(db);
  const runRepository = new RunRepository(db);
  const userId = randomUUID();
  const userName = `user-${userId}`;
  const scheduler = new MonitorScheduler(db);

  beforeAll(async () => {
    server = await createTestServer();
    await createTestUser(userId, userName);
  });

  beforeEach(async () => {
    await monitorRepository.deleteByAuthor(userId);
  });

  afterAll(async () => {
    await userRepository.delete(userId);
    await monitorRepository.deleteByAuthor(userId);
    await server.stop();
    await closeTestDb();
  });

  describe("Monitor Scheduling", () => {
    it("should schedule active monitors on startup", async () => {
      const monitor = (await createTestMonitor(server, userId, {})) as Monitor;

      await scheduler.start();

      expect(scheduler.isMonitorScheduled(monitor.id)).toBe(true);
      expect(scheduler.getActiveJobs()).toContain(monitor.id);
    });

    it("should not schedule inactive monitors on startup", async () => {
      const monitor = (await createTestMonitor(server, userId, {
        status: WithStatusStatusEnum.paused,
      })) as Monitor;

      await scheduler.start();

      expect(scheduler.isMonitorScheduled(monitor.id)).toBe(false);
      expect(scheduler.getActiveJobs()).not.toContain(monitor.id);
    });
  });

  describe("Monitor Execution", () => {
    it("should handle HTTP failure responses", async () => {
      const monitor = (await createTestMonitor(server, userId, {
        name: "failure-test",
        config: {
          url: server.info.uri + "/invalid-uri",
          method: "GET",
        },
      })) as Monitor;

      await scheduler.executeMonitor(monitor);

      const runs = await runRepository.list({ monitorId: monitor.id });
      expect(runs[0].status).toBe("failure");
      expect((runs[0].result_details as HttpRunDetails).statusCode).toBe(0);
    }, 15000);
  });

  describe("Monitor Management", () => {
    it("should reschedule monitor when configuration changes", async () => {
      const monitor = (await createTestMonitor(server, userId, {
        name: "reschedule-test",
        status: WithStatusStatusEnum.active,
        schedule: "*/5 * * * *",
      })) as Monitor;

      scheduler.scheduleMonitor(monitor);
      expect(scheduler.isMonitorScheduled(monitor.id)).toBe(true);

      const updatedMonitor = { ...monitor, schedule: "*/10 * * * *" };
      scheduler.rescheduleMonitor(updatedMonitor);

      expect(scheduler.isMonitorScheduled(monitor.id)).toBe(true);
      expect(scheduler.getActiveJobs()).toContain(monitor.id);
    });

    it("should unschedule monitor when status changes to inactive", async () => {
      const monitor = (await createTestMonitor(server, userId, {
        name: "inactive-test",
        status: WithStatusStatusEnum.active,
        schedule: "*/5 * * * *",
      })) as Monitor;

      scheduler.scheduleMonitor(monitor);
      expect(scheduler.isMonitorScheduled(monitor.id)).toBe(true);

      const inactiveMonitor = {
        ...monitor,
        status: WithStatusStatusEnum.paused,
      };
      scheduler.rescheduleMonitor(inactiveMonitor);

      expect(scheduler.isMonitorScheduled(monitor.id)).toBe(false);
    });

    it("should unschedule specific monitor", async () => {
      const monitor1 = (await createTestMonitor(server, userId, {
        schedule: "*/5 * * * *",
      })) as Monitor;

      const monitor2 = (await createTestMonitor(server, userId, {
        schedule: "*/10 * * * *",
      })) as Monitor;

      scheduler.scheduleMonitor(monitor1);
      scheduler.scheduleMonitor(monitor2);

      scheduler.unscheduleMonitor(monitor1.id);

      expect(scheduler.isMonitorScheduled(monitor1.id)).toBe(false);
      expect(scheduler.isMonitorScheduled(monitor2.id)).toBe(true);
    });
  });
});
