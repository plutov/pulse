import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { execSync } from "child_process";
import * as path from "path";
import { resetDb } from "../../src/models/connection";
import { logger } from "../../src/logging";

let postgresContainer: StartedPostgreSqlContainer;

export async function setup() {
  logger.info("setting up testcontainers...");

  postgresContainer = await new PostgreSqlContainer("postgres:15-alpine")
    .withDatabase("test_db")
    .withUsername("test_user")
    .withPassword("test_password")
    .start();

  process.env["DB_HOST"] = postgresContainer.getHost();
  process.env["DB_PORT"] = postgresContainer.getPort().toString();
  process.env["DB_USER"] = "test_user";
  process.env["DB_PASSWORD"] = "test_password";
  process.env["DB_NAME"] = "test_db";
  process.env["JWT_SECRET"] = "test-jwt-secret-for-testing-purposes-only";

  resetDb();

  logger.info("running migrations...");
  try {
    execSync("npx knex migrate:latest --knexfile knexfile.ts", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, "../.."),
      env: { ...process.env },
    });
  } catch (error) {
    logger.error(error, "migrations failed");
    throw error;
  }

  logger.info("migrations completed");
}

export async function teardown() {
  logger.info("stopping testcontainers...");

  resetDb();

  if (postgresContainer) {
    await postgresContainer.stop();
  }
}
