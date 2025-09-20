import { describe, it, afterAll, expect, beforeAll } from "vitest";
import * as Hapi from "@hapi/hapi";
import { createTestServer } from "../setup/server";
import { closeTestDb, getTestDb } from "../setup/database";
import {
  createTestUser,
  getAuthHeaders,
  TEST_USER_PASSWORD,
} from "../utils/auth";
import { LoginResponse } from "../../src/apigen";
import { randomUUID } from "crypto";
import { UserRepository } from "../../src/database/repositories/user-repository";

describe("Auth", () => {
  let server: Hapi.Server;
  const userId = randomUUID();
  const userName = `user-${userId}`;

  beforeAll(async () => {
    server = await createTestServer();
    await createTestUser(userId, userName);
  });

  afterAll(async () => {
    const db = getTestDb();
    const userRepository = new UserRepository(db);
    await userRepository.delete(userId);
    await server.stop();
    await closeTestDb();
  });

  describe("Login", () => {
    it("should reject invalid username", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          username: "nonexistent",
          password: TEST_USER_PASSWORD,
        },
      });

      expect(response.statusCode).toBe(401);
      const result = JSON.parse(response.payload);
      expect(result.message).toBe("Invalid username or password");
    });

    it("should reject invalid password", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          username: userName,
          password: "wrongpassword",
        },
      });

      expect(response.statusCode).toBe(401);
      const result = JSON.parse(response.payload);
      expect(result.message).toBe("Invalid username or password");
    });

    it("should reject missing username", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          password: TEST_USER_PASSWORD,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject missing password", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          username: userName,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return a valid JWT token that can be used for authenticated requests", async () => {
      const loginResponse = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          username: userName,
          password: TEST_USER_PASSWORD,
        },
      });

      expect(loginResponse.statusCode).toBe(200);
      const loginResult: LoginResponse = JSON.parse(loginResponse.payload);
      const token = loginResult.token;
      expect(token).toBeDefined();

      const protectedResponse = await server.inject({
        method: "GET",
        url: "/monitors",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(protectedResponse.statusCode).toBe(200);
    });
  });

  describe("JWT Auth", () => {
    it("should return 401 for empty JWT", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/monitors",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 401 for invalid JWT", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/monitors",
        headers: {
          authorization: "Bearer invalid-token",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 200 for valid JWT", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/monitors",
        headers: getAuthHeaders(userId),
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
