import { describe, it, beforeEach, afterAll, expect } from "vitest";
import * as Hapi from "@hapi/hapi";
import { createTestServer } from "../setup/server";
import { resetTestDb, closeTestDb } from "../setup/database";
import {
  getAuthHeaders,
  TEST_USER_PASSWORD,
  TEST_USER_USERNAME,
} from "../utils/auth";
import { LoginResponse } from "../../src/apigen";

describe("Auth", () => {
  let server: Hapi.Server;

  beforeEach(async () => {
    server = await createTestServer();
    await resetTestDb();
  });

  afterAll(async () => {
    await server.stop();
    await closeTestDb();
  });

  describe("Login", () => {
    it("should login with valid credentials", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          username: TEST_USER_USERNAME,
          password: TEST_USER_PASSWORD,
        },
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
      expect(result.user).toHaveProperty("id");
      expect(result.user).toHaveProperty("username", TEST_USER_USERNAME);
      expect(result.user).not.toHaveProperty("password_hash");
    });

    it("should reject invalid username", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          username: "nonexistent",
          password: "admin123",
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
          username: TEST_USER_USERNAME,
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
          password: "admin123",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject missing password", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          username: "admin",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return a valid JWT token that can be used for authenticated requests", async () => {
      const loginResponse = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          username: TEST_USER_USERNAME,
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
        headers: getAuthHeaders(token),
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
        headers: getAuthHeaders(),
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
