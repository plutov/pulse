import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import * as Hapi from "@hapi/hapi";
import { createTestServer } from "../setup/server";
import { closeTestDb, getTestDb } from "../setup/database";
import { ErrorResponse, Monitor } from "../../src/apigen";
import { createTestUser, getAuthHeaders } from "../utils/auth";
import { randomUUID } from "crypto";

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
    await db.table("users").where({ id: userId }).del();
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
      // Create a monitor first
      await server.inject({
        method: "POST",
        url: "/monitors",
        payload: { name: "test-monitor" },
        headers: getAuthHeaders(userId),
      });

      const response = await server.inject({
        method: "GET",
        url: "/monitors",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const monitors: Monitor[] = JSON.parse(response.payload) as Monitor[];
      expect(monitors).toHaveLength(1);
      expect(monitors[0]).toMatchObject({
        id: expect.any(String) as string,
        name: "test-monitor",
      });
    });
  });

  describe("POST /monitors", () => {
    it("should create a new monitor", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/monitors",
        payload: { name: "new-monitor" },
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(201);
      const monitor: Monitor = JSON.parse(response.payload) as Monitor;
      expect(monitor).toMatchObject({
        id: expect.any(String) as string,
        name: "new-monitor",
      });
    });

    it("should return 409 when monitor name already exists", async () => {
      // Create first monitor
      await server.inject({
        method: "POST",
        url: "/monitors",
        payload: { name: "duplicate-monitor" },
        headers: getAuthHeaders(userId),
      });

      // Try to create monitor with same name
      const response = await server.inject({
        method: "POST",
        url: "/monitors",
        payload: { name: "duplicate-monitor" },
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(409);
      const error: ErrorResponse = JSON.parse(
        response.payload,
      ) as ErrorResponse;
      expect(error.message).toContain("already exists");
    });
  });

  describe("GET /monitors/{id}", () => {
    it("should return monitor by id", async () => {
      // Create a monitor first
      const createResponse = await server.inject({
        method: "POST",
        url: "/monitors",
        payload: { name: "test-monitor" },
        headers: getAuthHeaders(userId),
      });
      const createdMonitor: Monitor = JSON.parse(
        createResponse.payload,
      ) as Monitor;

      const response = await server.inject({
        method: "GET",
        url: `/monitors/${createdMonitor.id}`,
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
      const monitor: Monitor = JSON.parse(response.payload) as Monitor;
      expect(monitor).toEqual(createdMonitor);
    });

    it("should return 404 when monitor does not exist", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/monitors/550e8400-e29b-41d4-a716-446655440000",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(404);
      const error: ErrorResponse = JSON.parse(
        response.payload,
      ) as ErrorResponse;
      expect(error.message).toContain("not found");
    });

    it("should return 400 for invalid id", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/monitors/invalid",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(400);
      const error: ErrorResponse = JSON.parse(
        response.payload,
      ) as ErrorResponse;
      expect(error.message).toContain("Invalid monitor ID format");
    });
  });

  describe("DELETE /monitors/{id}", () => {
    it("should delete monitor by id", async () => {
      // Create a monitor first
      const createResponse = await server.inject({
        method: "POST",
        url: "/monitors",
        payload: { name: "to-delete-monitor" },
        headers: getAuthHeaders(userId),
      });
      const createdMonitor: Monitor = JSON.parse(
        createResponse.payload,
      ) as Monitor;

      const response = await server.inject({
        method: "DELETE",
        url: `/monitors/${createdMonitor.id}`,
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(204);
      expect(response.payload).toBe("");

      // Verify monitor is deleted
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
      const error: ErrorResponse = JSON.parse(
        response.payload,
      ) as ErrorResponse;
      expect(error.message).toContain("not found");
    });

    it("should return 400 for invalid id", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: "/monitors/invalid",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(400);
      const error: ErrorResponse = JSON.parse(
        response.payload,
      ) as ErrorResponse;
      expect(error.message).toContain("Invalid monitor ID format");
    });
  });
});
