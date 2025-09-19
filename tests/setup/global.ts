import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { RedisContainer, StartedRedisContainer } from "@testcontainers/redis";
import { execSync } from "child_process";
import * as path from "path";

let postgresContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;

export async function setup() {
  console.log("Setting up test containers...");

  // Start PostgreSQL container
  postgresContainer = await new PostgreSqlContainer("postgres:15-alpine")
    .withDatabase("test_db")
    .withUsername("test_user")
    .withPassword("test_password")
    .start();

  // Start Redis container
  redisContainer = await new RedisContainer("redis:7-alpine").start();

  // Set environment variables for tests
  process.env["DB_HOST"] = postgresContainer.getHost();
  process.env["DB_PORT"] = postgresContainer.getPort().toString();
  process.env["DB_USER"] = "test_user";
  process.env["DB_PASSWORD"] = "test_password";
  process.env["DB_NAME"] = "test_db";
  process.env["REDIS_HOST"] = redisContainer.getHost();
  process.env["REDIS_PORT"] = redisContainer.getPort().toString();
  process.env["REDIS_DB"] = "0";
  process.env["JWT_SECRET"] = "test-jwt-secret-for-testing-purposes-only";

  console.log("Running migrations...");
  try {
    execSync("npx knex migrate:latest --knexfile knexfile.ts", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, "../.."),
      env: { ...process.env },
    });
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }

  console.log("Running seeds...");
  try {
    execSync("npx knex seed:run --knexfile knexfile.ts", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, "../.."),
      env: { ...process.env },
    });
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }

  console.log("Test setup complete");
}

export async function teardown() {
  console.log("Stopping test containers...");

  if (postgresContainer) {
    await postgresContainer.stop();
  }

  if (redisContainer) {
    await redisContainer.stop();
  }
}
