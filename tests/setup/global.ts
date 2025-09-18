import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { execSync } from "child_process";
import * as path from "path";

let postgresContainer: StartedPostgreSqlContainer;

export async function setup() {
  console.log("Setting up test database container...");

  postgresContainer = await new PostgreSqlContainer("postgres:15-alpine")
    .withDatabase("test_db")
    .withUsername("test_user")
    .withPassword("test_password")
    .start();

  // Set environment variables for tests
  process.env["DB_HOST"] = postgresContainer.getHost();
  process.env["DB_PORT"] = postgresContainer.getPort().toString();
  process.env["DB_USER"] = "test_user";
  process.env["DB_PASSWORD"] = "test_password";
  process.env["DB_NAME"] = "test_db";
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

  console.log("Test database setup complete");
}

export async function teardown() {
  if (postgresContainer) {
    console.log("Stopping test database container...");
    await postgresContainer.stop();
  }
}

