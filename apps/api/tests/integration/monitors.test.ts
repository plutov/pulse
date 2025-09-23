import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import * as Hapi from "@hapi/hapi";
import { createTestServer } from "../setup/server";
import { closeTestDb, getTestDb } from "../setup/database";
import {
  ErrorResponse,
  Monitor,
  CreateMonitorPayload,
  HttpConfig,
  MonitorType,
  WithStatusStatusEnum,
} from "@pulse/shared";
import { createTestUser, getAuthHeaders } from "../utils/auth";
import { randomUUID } from "crypto";
import { UserRepository } from "../../src/database/repositories/user-repository";
import { ApiErrorsEnum } from "../../src/api/errors";

interface TestMonitorData {
  name: string;
  monitorType?: MonitorType;
  schedule?: string;
  status?: WithStatusStatusEnum;
  config?: HttpConfig;
}

describe("Monitors API", () => {
  let server: Hapi.Server;
  const userId = randomUUID();
  const userName = `user-${userId}`;

  const createMonitor = async (
    monitorData: TestMonitorData,
  ): Promise<Monitor | ErrorResponse> => {
    const payload: CreateMonitorPayload = {
      name: monitorData.name,
      monitorType: monitorData.monitorType || MonitorType.http,
      schedule: monitorData.schedule || "*/5 * * * *",
      status: monitorData.status || WithStatusStatusEnum.active,
      config: monitorData.config || {
        url: "https://example.com",
        method: "GET",
      },
    };
    const response = await server.inject({
      method: "POST",
      url: "/monitors",
      payload,
      headers: getAuthHeaders(userId),
    });

    if (response.statusCode === 201) {
      const monitor: Monitor = JSON.parse(response.payload);
      return monitor;
    }

    const error: ErrorResponse = JSON.parse(response.payload);
    return error;
  };

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
      await createMonitor({
        name: "test-monitor",
        monitorType: MonitorType.http,
      });

      const response = await server.inject({
        method: "GET",
        url: "/monitors",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const monitors: Monitor[] = JSON.parse(response.payload);
      expect(monitors).toHaveLength(1);
      expect(monitors[0]).toMatchObject({
        id: expect.any(String) as string,
        name: "test-monitor",
        monitorType: "http",
        status: "active",
        schedule: "*/5 * * * *",
        config: {
          url: "https://example.com",
          method: "GET",
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
      const monitor = (await createMonitor({
        name: "new-monitor",
        monitorType: MonitorType.http,
        schedule: "*/5 * * * *",
        status: WithStatusStatusEnum.active,
      })) as Monitor;
      expect(monitor).toMatchObject({
        id: expect.any(String) as string,
        name: "new-monitor",
        monitorType: "http",
        status: "active",
        schedule: "*/5 * * * *",
        config: {
          url: "https://example.com",
          method: "GET",
        },
        author: { id: userId, username: userName },
      });
    });

    it("should return 409 for a duplicate name", async () => {
      await createMonitor({
        name: "duplicate-monitor",
      });

      const err = (await createMonitor({
        name: "duplicate-monitor",
      })) as ErrorResponse;
      expect(err.message).toBe("Monitor with this name already exists");
      expect(err.statusCode).toBe(409);
    });
  });

  describe("GET /monitors/{id}", () => {
    it("should return monitor by id", async () => {
      const createdMonitor = (await createMonitor({
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
      const createdMonitor = (await createMonitor({
        name: "to-delete-monitor",
      })) as Monitor;

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
});
