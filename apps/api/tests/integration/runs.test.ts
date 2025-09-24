import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import * as Hapi from "@hapi/hapi";
import { createTestServer } from "../setup/server";
import { closeTestDb, getTestDb } from "../setup/database";
import { ErrorResponse, MonitorRunsList } from "@pulse/shared";
import { createTestUser, getAuthHeaders } from "../utils/auth";
import { randomUUID } from "crypto";
import { createTestMonitor } from "../utils/monitors";
import { createTestRun } from "../utils/runs";
import { UserRepository } from "../../src/models/repositories/users";
import { MonitorRepository } from "../../src/models/repositories/monitors";

describe("Runs API", () => {
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

  describe("GET /runs", () => {
    it("should return all runs with default pagination", async () => {
      const monitor = await createTestMonitor(server, userId, {});
      const run1 = await createTestRun({ monitorId: monitor.id });
      const run2 = await createTestRun({ monitorId: monitor.id });
      const run3 = await createTestRun({ monitorId: monitor.id });

      const response = await server.inject({
        method: "GET",
        url: "/runs",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload) as MonitorRunsList;
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.rows.length).toBeGreaterThanOrEqual(3);

      const runIds = result.rows!.map((run) => run.id);
      expect(runIds).toEqual(
        expect.arrayContaining([run1.id, run2.id, run3.id]),
      );
    });

    it("should filter runs by monitorId", async () => {
      const monitor1 = await createTestMonitor(server, userId, {});
      const monitor2 = await createTestMonitor(server, userId, {});
      const run1 = await createTestRun({ monitorId: monitor1.id });
      const run2 = await createTestRun({ monitorId: monitor1.id });
      const run3 = await createTestRun({ monitorId: monitor2.id });

      const response = await server.inject({
        method: "GET",
        url: `/runs?monitorId=${monitor1.id}`,
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload) as MonitorRunsList;
      expect(result.total).toBe(2);
      expect(result.rows).toHaveLength(2);
      const runIds = result.rows!.map((run) => run.id);
      expect(runIds).toEqual(expect.arrayContaining([run1.id, run2.id]));
      expect(runIds).not.toContain(run3.id);
    });

    it("should respect size parameter for pagination", async () => {
      const monitor = await createTestMonitor(server, userId, {});
      for (let i = 0; i < 5; i++) {
        await createTestRun({ monitorId: monitor.id });
      }

      const response = await server.inject({
        method: "GET",
        url: "/runs?size=3",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload) as MonitorRunsList;
      expect(result.total).toBeGreaterThanOrEqual(5);
      expect(result.rows).toHaveLength(3);
    });

    it("should respect offset parameter for pagination", async () => {
      const monitor = await createTestMonitor(server, userId, {});
      for (let i = 0; i < 5; i++) {
        await createTestRun({ monitorId: monitor.id });
      }

      const firstPageResponse = await server.inject({
        method: "GET",
        url: "/runs?size=5&offset=2",
        headers: getAuthHeaders(userId),
      });

      expect(firstPageResponse.statusCode).toBe(200);
      const firstPage = JSON.parse(
        firstPageResponse.payload,
      ) as MonitorRunsList;
      expect(firstPage.total).toBeGreaterThanOrEqual(5);
      expect(firstPage.rows.length).toBeGreaterThanOrEqual(3);
      expect(firstPage.rows.length).toBeLessThanOrEqual(5);
    });

    it("validate request", async () => {
      const tooSmallResponse = await server.inject({
        method: "GET",
        url: "/runs?size=0",
        headers: getAuthHeaders(userId),
      });

      expect(tooSmallResponse.statusCode).toBe(400);
      const errorResponse = JSON.parse(
        tooSmallResponse.payload,
      ) as ErrorResponse;
      expect(errorResponse.validationMessages).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("Size must be at least 1"),
          path: ["size"],
        }),
      );

      // Test size too large
      const tooLargeResponse = await server.inject({
        method: "GET",
        url: "/runs?size=1001",
        headers: getAuthHeaders(userId),
      });

      expect(tooLargeResponse.statusCode).toBe(400);
      const errorResponse2 = JSON.parse(
        tooLargeResponse.payload,
      ) as ErrorResponse;
      expect(errorResponse2.validationMessages).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("Size cannot exceed 1000"),
          path: ["size"],
        }),
      );
    });

    it("should validate offset parameter", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/runs?offset=-1",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(400);
      const errorResponse = JSON.parse(response.payload) as ErrorResponse;
      expect(errorResponse.validationMessages).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("Offset cannot be negative"),
          path: ["offset"],
        }),
      );
    });

    it("should validate monitorId parameter", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/runs?monitorId=invalid-uuid",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(400);
      const errorResponse = JSON.parse(response.payload) as ErrorResponse;
      expect(errorResponse.validationMessages).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("Monitor ID must be a valid UUIDv4"),
          path: ["monitorId"],
        }),
      );
    });

    it("should require authentication", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/runs",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return runs with correct data structure", async () => {
      const monitor = await createTestMonitor(server, userId, {});
      const runDb = await createTestRun({
        monitorId: monitor.id,
      });

      const response = await server.inject({
        method: "GET",
        url: "/runs?monitorId=" + monitor.id,
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload) as MonitorRunsList;
      expect(result.rows).toHaveLength(1);

      const run = result.rows![0];
      expect(run).toMatchObject({
        id: runDb.id,
        status: runDb.status,
        durationMs: runDb.duration_ms,
        createdAt: runDb.created_at.toISOString(),
        monitor: {
          id: monitor.id,
          name: monitor.name,
        },
        details: {
          statusCode: expect.any(Number),
        },
      });
    });
  });
});
