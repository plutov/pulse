import { describe, it, expect, beforeEach, afterAll } from "vitest";
import * as Hapi from "@hapi/hapi";
import { createTestServer } from "../setup/server";
import { cleanupTestDb, closeTestDb } from "../setup/database";
import { ErrorResponse, Repo } from "../../src/apigen";

describe("Repos API", () => {
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

  describe("GET /repos", () => {
    it("should return empty array when no repos exist", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/repos",
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual([]);
    });

    it("should return repos when they exist", async () => {
      // Create a repo first
      await server.inject({
        method: "POST",
        url: "/repos",
        payload: { name: "test-repo" },
      });

      const response = await server.inject({
        method: "GET",
        url: "/repos",
      });

      expect(response.statusCode).toBe(200);
      const repos: Repo[] = JSON.parse(response.payload) as Repo[];
      expect(repos).toHaveLength(1);
      expect(repos[0]).toMatchObject({
        id: expect.any(String) as string,
        name: "test-repo",
      });
    });
  });

  describe("POST /repos", () => {
    it("should create a new repo", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/repos",
        payload: { name: "new-repo" },
      });

      expect(response.statusCode).toBe(201);
      const repo: Repo = JSON.parse(response.payload) as Repo;
      expect(repo).toMatchObject({
        id: expect.any(String) as string,
        name: "new-repo",
      });
    });

    it("should return 409 when repo name already exists", async () => {
      // Create first repo
      await server.inject({
        method: "POST",
        url: "/repos",
        payload: { name: "duplicate-repo" },
      });

      // Try to create repo with same name
      const response = await server.inject({
        method: "POST",
        url: "/repos",
        payload: { name: "duplicate-repo" },
      });

      expect(response.statusCode).toBe(409);
      const error: ErrorResponse = JSON.parse(
        response.payload,
      ) as ErrorResponse;
      expect(error.message).toContain("already exists");
    });
  });

  describe("GET /repos/{id}", () => {
    it("should return repo by id", async () => {
      // Create a repo first
      const createResponse = await server.inject({
        method: "POST",
        url: "/repos",
        payload: { name: "test-repo" },
      });
      const createdRepo: Repo = JSON.parse(createResponse.payload) as Repo;

      const response = await server.inject({
        method: "GET",
        url: `/repos/${createdRepo.id}`,
      });

      expect(response.statusCode).toBe(200);
      const repo: Repo = JSON.parse(response.payload) as Repo;
      expect(repo).toEqual(createdRepo);
    });

    it("should return 404 when repo does not exist", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/repos/550e8400-e29b-41d4-a716-446655440000",
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
        url: "/repos/invalid",
      });

      expect(response.statusCode).toBe(400);
      const error: ErrorResponse = JSON.parse(
        response.payload,
      ) as ErrorResponse;
      expect(error.message).toContain("Invalid repository ID format");
    });
  });

  describe("DELETE /repos/{id}", () => {
    it("should delete repo by id", async () => {
      // Create a repo first
      const createResponse = await server.inject({
        method: "POST",
        url: "/repos",
        payload: { name: "to-delete-repo" },
      });
      const createdRepo: Repo = JSON.parse(createResponse.payload) as Repo;

      const response = await server.inject({
        method: "DELETE",
        url: `/repos/${createdRepo.id}`,
      });

      expect(response.statusCode).toBe(204);
      expect(response.payload).toBe("");

      // Verify repo is deleted
      const getResponse = await server.inject({
        method: "GET",
        url: `/repos/${createdRepo.id}`,
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it("should return 404 when trying to delete non-existent repo", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: "/repos/550e8400-e29b-41d4-a716-446655440000",
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
        url: "/repos/invalid",
      });

      expect(response.statusCode).toBe(400);
      const error: ErrorResponse = JSON.parse(
        response.payload,
      ) as ErrorResponse;
      expect(error.message).toContain("Invalid repository ID format");
    });
  });
});

