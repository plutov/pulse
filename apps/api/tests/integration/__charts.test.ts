import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import * as Hapi from "@hapi/hapi";
import { createTestServer } from "../setup/server";
import { closeTestDb, getTestDb } from "../setup/database";
import { ErrorResponse, TimeSeriesChartData, Monitor } from "@pulse/shared";
import RunStatus from "../../src/models/types/public/RunStatus";
import { createTestUser, getAuthHeaders } from "../utils/auth";
import { randomUUID } from "crypto";
import { createTestMonitorOrFail } from "../utils/monitors";
import { createTestRun } from "../utils/runs";
import { UserRepository } from "../../src/models/repositories/users";
import { MonitorRepository } from "../../src/models/repositories/monitors";
import { ApiErrorsEnum } from "../../src/api/errors";

describe("Charts API", () => {
  let server: Hapi.Server;
  const db = getTestDb();
  const userRepository = new UserRepository(db);
  const monitorRepository = new MonitorRepository(db);
  const userId = randomUUID();
  const userName = `user-${userId}`;

  beforeAll(async () => {
    server = await createTestServer();
    await createTestUser(userId, userName);
  });

  beforeEach(async () => {});

  afterAll(async () => {
    await userRepository.delete(userId);
    await monitorRepository.deleteByAuthor(userId);
    await server.stop();
    await closeTestDb();
  });

  describe("POST /charts/timeSeries", () => {
    it("should return time series chart data for valid monitor IDs", async () => {
      const monitorResponse = await createTestMonitorOrFail(server, userId, {});

      expect(monitorResponse).toHaveProperty("id");
      const monitor = monitorResponse as Monitor;

      // Create test runs for the monitor
      await createTestRun({
        monitorId: monitor.id,
        status: RunStatus.success,
        durationMs: 120,
      });
      await createTestRun({
        monitorId: monitor.id,
        status: RunStatus.success,
        durationMs: 150,
      });
      await createTestRun({
        monitorId: monitor.id,
        status: RunStatus.failure,
        durationMs: 5000,
      });

      const response = await server.inject({
        method: "POST",
        url: "/charts/timeSeries",
        headers: getAuthHeaders(userId),
        payload: {
          monitorIds: [monitor.id],
          timeRange: "1d",
          interval: "1h",
        },
      });

      expect(response.statusCode).toBe(200);
      const chartData: TimeSeriesChartData = JSON.parse(response.payload);

      expect(chartData.data).toHaveLength(1);
      expect(chartData.data[0].monitor.id).toBe(monitor.id);
      expect(chartData.data[0].monitor.name).toBe(monitor.name);
      expect(chartData.data[0].dataPoints.length).toBeGreaterThan(0);

      chartData.data[0].dataPoints.forEach((point) => {
        expect(point).toHaveProperty("createdAt");
        expect(point).toHaveProperty("durationMs");
        expect(point).toHaveProperty("status");
        expect(typeof point.durationMs).toBe("number");
        expect(["success", "failure", "timeout"]).toContain(point.status);
      });
    });

    it("should return empty data for non-existent monitor IDs", async () => {
      const nonExistentId = randomUUID();

      const response = await server.inject({
        method: "POST",
        url: "/charts/timeSeries",
        headers: getAuthHeaders(userId),
        payload: {
          monitorIds: [nonExistentId],
          timeRange: "1d",
          interval: "1h",
        },
      });

      expect(response.statusCode).toBe(200);
      const chartData: TimeSeriesChartData = JSON.parse(response.payload);
      expect(chartData.data).toHaveLength(0);
    });

    it("should return 400 for invalid payload", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/charts/timeSeries",
        headers: getAuthHeaders(userId),
        payload: {
          monitorIds: [],
          timeRange: "1d",
          interval: "1h",
        },
      });

      expect(response.statusCode).toBe(400);
      const error: ErrorResponse = JSON.parse(response.payload);
      expect(error.message).toBe(ApiErrorsEnum.ValidationFailed);
      expect(error.validationMessages.length).toBeGreaterThan(0);
    });

    it("should return 400 for invalid time range", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/charts/timeSeries",
        headers: getAuthHeaders(userId),
        payload: {
          monitorIds: [randomUUID()],
          timeRange: "invalid",
          interval: "1h",
        },
      });

      expect(response.statusCode).toBe(400);
      const error: ErrorResponse = JSON.parse(response.payload);
      expect(error.message).toBe(ApiErrorsEnum.ValidationFailed);
      expect(error.validationMessages).toHaveLength(1);
      expect(error.validationMessages[0].message).toContain(
        "Time range must be one of",
      );
    });

    it("should return 401 for unauthenticated requests", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/charts/timeSeries",
        payload: {
          monitorIds: [randomUUID()],
          timeRange: "1d",
          interval: "1h",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
