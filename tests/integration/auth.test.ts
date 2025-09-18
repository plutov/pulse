import { describe, it, beforeEach, afterAll, expect } from "vitest";
import * as Hapi from "@hapi/hapi";
import { createTestServer } from "../setup/server";
import { cleanupTestDb, closeTestDb } from "../setup/database";
import { getAuthHeaders } from "../utils/auth";

describe("Auth", () => {
  let server: Hapi.Server;

  beforeEach(async () => {
    server = await createTestServer();
    await cleanupTestDb();
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
    await closeTestDb();
  });

  describe("JWT Auth", () => {
    it("should return 401 for empty JWT", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/repos",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 401 for invalid JWT", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/repos",
        headers: {
          authorization: "Bearer invalid-token",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 200 for valid JWT", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/repos",
        headers: getAuthHeaders(),
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
