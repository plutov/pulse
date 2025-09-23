import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import * as Hapi from "@hapi/hapi";
import { createTestServer } from "../setup/server";
import { closeTestDb, getTestDb } from "../setup/database";
import { ErrorResponse, Monitor, MonitorRunsList } from "@pulse/shared";
import { createTestUser, getAuthHeaders } from "../utils/auth";
import { randomUUID } from "crypto";
import { ApiErrorsEnum } from "../../src/api/errors";
import { createTestMonitor } from "../utils/monitors";
import { createTestRun } from "../utils/runs";
import { UserRepository } from "../../src/models/repositories/users";

describe("Monitors API", () => {
  let server: Hapi.Server;
  const userId = randomUUID();
  const userName = `user-${userId}`;

  beforeAll(async () => {
    server = await createTestServer();
    await createTestUser(userId, userName);
  });

  beforeEach(async () => {
    server = await createTestServer();
    const db = getTestDb();
    await db.raw("TRUNCATE TABLE monitors RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    const db = getTestDb();
    await db.raw("TRUNCATE TABLE monitors RESTART IDENTITY CASCADE");
    const userRepository = new UserRepository(db);
    await userRepository.delete(userId);
    await server.stop();
    await closeTestDb();
  });

  describe("GET /monitors", () => {
    it("should return empty array when no monitors exist", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/monitors",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual([]);
    });

    it("should return monitors when they exist", async () => {
      await createTestMonitor(server, userId, {});

      const response = await server.inject({
        method: "GET",
        url: "/monitors",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const monitors: Monitor[] = JSON.parse(response.payload);
      expect(monitors).toHaveLength(1);
      expect(monitors[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        monitorType: expect.any(String),
        status: expect.any(String),
        schedule: expect.any(String),
        config: {
          url: expect.any(String),
          method: expect.any(String),
        },
        author: { id: userId, username: userName },
      });
    });
  });

  describe("POST /monitors", () => {
    it("should return 400 for missing fields", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/monitors",
        payload: {},
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(400);
      const error: ErrorResponse = JSON.parse(response.payload);
      expect(error.message).toBe(ApiErrorsEnum.ValidationFailed);
      expect(error.validationMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: "Name is required",
          }),
          expect.objectContaining({
            message: "Monitor type is required",
          }),
          expect.objectContaining({
            message: "Schedule is required",
          }),
          expect.objectContaining({
            message: "Status is required",
          }),
          expect.objectContaining({
            message: "Config is required",
          }),
        ]),
      );
    });

    it("should create a new monitor", async () => {
      const monitor = (await createTestMonitor(server, userId, {
        name: "new-monitor",
        status: "active",
        schedule: "*/10 * * * *",
        monitorType: "http",
        config: {
          url: "https://example.com",
          method: "GET",
        },
      })) as Monitor;
      expect(monitor).toMatchObject({
        id: expect.any(String),
        name: "new-monitor",
        monitorType: "http",
        status: "active",
        schedule: "*/10 * * * *",
        config: {
          url: "https://example.com",
          method: "GET",
        },
        author: { id: userId, username: userName },
      });
    });

    it("should return 409 for a duplicate name", async () => {
      await createTestMonitor(server, userId, {});

      const err = (await createTestMonitor(
        server,
        userId,
        {},
      )) as ErrorResponse;
      expect(err.message).toBe("Monitor with this name already exists");
      expect(err.statusCode).toBe(409);
    });
  });

  describe("GET /monitors/{id}", () => {
    it("should return monitor by id", async () => {
      const createdMonitor = (await createTestMonitor(server, userId, {
        name: "test-monitor",
      })) as Monitor;

      const response = await server.inject({
        method: "GET",
        url: `/monitors/${createdMonitor.id}`,
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const monitor: Monitor = JSON.parse(response.payload);
      expect(monitor).toEqual(createdMonitor);
    });

    it("should return 404 when monitor does not exist", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/monitors/550e8400-e29b-41d4-a716-446655440000",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(404);
      const error: ErrorResponse = JSON.parse(response.payload);
      expect(error.message).toContain("not found");
    });

    it("should return 400 for invalid id", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/monitors/invalid",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(400);
      const error: ErrorResponse = JSON.parse(response.payload);
      expect(error.message).toContain(ApiErrorsEnum.ValidationFailed);
    });
  });

  describe("DELETE /monitors/{id}", () => {
    it("should delete monitor by id", async () => {
      const createdMonitor = (await createTestMonitor(
        server,
        userId,
        {},
      )) as Monitor;

      const response = await server.inject({
        method: "DELETE",
        url: `/monitors/${createdMonitor.id}`,
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(204);
      expect(response.payload).toBe("");

      const getResponse = await server.inject({
        method: "GET",
        url: `/monitors/${createdMonitor.id}`,
        headers: getAuthHeaders(userId),
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it("should return 404 when trying to delete non-existent monitor", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: "/monitors/550e8400-e29b-41d4-a716-446655440000",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(404);
      const error: ErrorResponse = JSON.parse(response.payload);
      expect(error.message).toContain("not found");
    });

    it("should return 400 for invalid id", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: "/monitors/invalid",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(400);
      const error: ErrorResponse = JSON.parse(response.payload);
      expect(error.message).toContain(ApiErrorsEnum.ValidationFailed);
    });
  });

  describe("GET /runs", () => {
    it("should return empty list when no runs exist", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/runs",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload) as MonitorRunsList;
      expect(result.rows).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return all runs with default pagination", async () => {
      const db = getTestDb();
      const monitor = (await createTestMonitor(server, userId, {})) as Monitor;
      const run1 = await createTestRun(db, { monitorId: monitor.id });
      const run2 = await createTestRun(db, { monitorId: monitor.id });
      const run3 = await createTestRun(db, { monitorId: monitor.id });

      const response = await server.inject({
        method: "GET",
        url: "/runs",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload) as MonitorRunsList;
      expect(result.total).toBe(3);
      expect(result.rows).toHaveLength(3);

      const runIds = result.rows!.map((run) => run.id);
      expect(runIds).toEqual(
        expect.arrayContaining([run1.id, run2.id, run3.id]),
      );
    });

    it("should filter runs by monitorId", async () => {
      const db = getTestDb();
      const monitor1 = (await createTestMonitor(server, userId, {})) as Monitor;
      const monitor2 = (await createTestMonitor(server, userId, {
        name: "second-monitor",
      })) as Monitor;
      const run1 = await createTestRun(db, { monitorId: monitor1.id });
      const run2 = await createTestRun(db, { monitorId: monitor1.id });
      const run3 = await createTestRun(db, { monitorId: monitor2.id });

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
      const db = getTestDb();
      const monitor = (await createTestMonitor(server, userId, {})) as Monitor;
      for (let i = 0; i < 5; i++) {
        await createTestRun(db, { monitorId: monitor.id });
      }

      const response = await server.inject({
        method: "GET",
        url: "/runs?size=3",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload) as MonitorRunsList;
      expect(result.total).toBe(5);
      expect(result.rows).toHaveLength(3);
    });

    it("should respect offset parameter for pagination", async () => {
      const db = getTestDb();
      const monitor = (await createTestMonitor(server, userId, {})) as Monitor;
      for (let i = 0; i < 5; i++) {
        await createTestRun(db, { monitorId: monitor.id });
      }

      // Get first page
      const firstPageResponse = await server.inject({
        method: "GET",
        url: "/runs?size=5&offset=2",
        headers: getAuthHeaders(userId),
      });

      expect(firstPageResponse.statusCode).toBe(200);
      const firstPage = JSON.parse(
        firstPageResponse.payload,
      ) as MonitorRunsList;
      expect(firstPage.total).toBe(5);
      expect(firstPage.rows).toHaveLength(3);
    });

    it("validate request", async () => {
      // Test size too small
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
      const db = getTestDb();
      const monitor = (await createTestMonitor(server, userId, {})) as Monitor;
      const runDb = await createTestRun(db, {
        monitorId: monitor.id,
      });

      const response = await server.inject({
        method: "GET",
        url: "/runs",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload) as MonitorRunsList;
      expect(result.rows).toHaveLength(1);

      const run = result.rows![0];
      expect(run).toMatchObject({
        id: runDb.id,
        status: expect.any(String),
        durationMs: expect.any(Number),
        createdAt: expect.any(String),
        monitor: {
          id: monitor.id,
          name: expect.any(String),
        },
        details: {
          statusCode: expect.any(Number),
        },
      });
    });
  });
});
