import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 60000,
    hookTimeout: 60000,
    teardownTimeout: 60000,
    globalSetup: "./tests/setup/global.ts",
  },
});
