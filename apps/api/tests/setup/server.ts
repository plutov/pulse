import * as Hapi from "@hapi/hapi";
import { createServer } from "../../src/server";

export async function createTestServer(): Promise<Hapi.Server> {
  return createServer({
    port: 0, // Use random available port for testing
    silent: true, // Disable logging for tests
  });
}
