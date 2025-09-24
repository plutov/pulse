import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import * as Hapi from "@hapi/hapi";
import { createTestServer } from "../setup/server";
import { closeTestDb, getTestDb } from "../setup/database";
import { ErrorResponse, Monitor } from "@pulse/shared";
import { createTestUser, getAuthHeaders } from "../utils/auth";
import { randomUUID } from "crypto";
import { ApiErrorsEnum } from "../../src/api/errors";
import { createTestMonitor, createTestMonitorOrFail } from "../utils/monitors";
import { UserRepository } from "../../src/models/repositories/users";
import { MonitorRepository } from "../../src/models/repositories/monitors";

describe("Monitors API", () => {
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

  describe("GET /monitors", () => {
    it("should return monitors", async () => {
      const monitor = await createTestMonitor(server, userId, {});

      const response = await server.inject({
        method: "GET",
        url: "/monitors",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const monitors: Monitor[] = JSON.parse(response.payload);
      expect(monitors.length).toBeGreaterThanOrEqual(1);
      expect(monitors).toEqual(
        expect.arrayContaining([expect.objectContaining(monitor)]),
      );
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

    it("should return 400 for invalid fields", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/monitors",
        payload: {
          name: "",
          monitorType: "invalid",
          schedule: "invalid",
          status: "invalid",
          config: { url: "invalid", method: "invalid" },
        },
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(400);
      const error: ErrorResponse = JSON.parse(response.payload);
      expect(error.message).toBe(ApiErrorsEnum.ValidationFailed);
      expect(error.validationMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: "Name cannot be empty",
          }),
          expect.objectContaining({
            message: "Monitor type must be one of [http]",
          }),
          expect.objectContaining({
            message: "Schedule must be a valid cron expression",
          }),
          expect.objectContaining({
            message: "Status must be one of [active, paused]",
          }),
          expect.objectContaining({
            message: "URL must be a valid URI",
          }),
          expect.objectContaining({
            message:
              "Method must be one of [GET, POST, PUT, DELETE, HEAD, OPTIONS, PATCH]",
          }),
        ]),
      );
    });

    it("should create a new monitor", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/monitors",
        payload: {
          name: "test-monitor",
          monitorType: "http",
          schedule: "*/5 * * * *",
          status: "active",
          config: {
            url: "https://example.com",
            method: "GET",
          },
        },
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(201);
      const monitor: Monitor = JSON.parse(response.payload);
      expect(monitor).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: "test-monitor",
          monitorType: "http",
          schedule: "*/5 * * * *",
          status: "active",
          config: {
            url: "https://example.com",
            method: "GET",
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it("should return 409 for a duplicate name", async () => {
      await createTestMonitor(server, userId, {
        name: "duplicate-monitor",
      });

      const err = (await createTestMonitorOrFail(server, userId, {
        name: "duplicate-monitor",
      })) as ErrorResponse;
      expect(err.message).toBe("Monitor with this name already exists");
      expect(err.statusCode).toBe(409);
    });
  });

  describe("GET /monitors/{id}", () => {
    it("should return monitor by id", async () => {
      const createdMonitor = await createTestMonitor(server, userId, {});

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
        url: `/monitors/${randomUUID()}`,
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
      const createdMonitor = await createTestMonitor(server, userId, {});

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
        url: `/monitors/${randomUUID()}`,
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
