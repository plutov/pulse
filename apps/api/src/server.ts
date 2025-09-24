import * as Hapi from "@hapi/hapi";
import { Engine as CatboxRedis } from "@hapi/catbox-redis";
import HapiPino from "hapi-pino";
import { authStrategy } from "./middleware/auth";
import authPlugin from "./plugins/auth";
import monitorsPlugin from "./plugins/monitors";
import { Boom } from "@hapi/boom";
import { ErrorResponse } from "@pulse/shared";
import { MonitorScheduler } from "./services/scheduler";
import { getDb } from "./models/connection";
import { Knex } from "knex";
import { setSchedulerInstance } from "./controllers/monitors";

interface ServerOptions {
  port?: number | string;
  silent?: boolean;
  startScheduler?: boolean;
  db?: Knex;
}

export async function createServer(
  options: ServerOptions = {},
): Promise<Hapi.Server> {
  const server = Hapi.server({
    port: options.port ?? 3000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["http://localhost:9000", "http://127.0.0.1:9000"],
        headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"],
        credentials: true,
      },
    },
    cache: [
      {
        name: "redis_cache",
        provider: {
          constructor: CatboxRedis,
          options: {
            host: process.env["REDIS_HOST"] || "localhost",
            port: Number(process.env["REDIS_PORT"]) || 6379,
            database: Number(process.env["REDIS_DB"]) || 0,
          },
        },
      },
    ],
  });

  // Global error handler
  server.ext("onPreResponse", (request, h) => {
    const response = request.response;
    if (response instanceof Boom && response.isBoom) {
      const error = response as Boom;
      const errorResponse: ErrorResponse = {
        message: error.message,
        statusCode: error.output.statusCode,
        validationMessages: [],
      };
      if (
        error.output.payload.details &&
        Array.isArray(error.output.payload.details)
      ) {
        errorResponse.validationMessages = error.output.payload.details.map(
          (detail) => {
            return {
              message: detail.message,
              type: detail.type,
              path: detail.path,
            };
          },
        );
      }
      return h.response(errorResponse).code(error.output.statusCode);
    }
    return h.continue;
  });

  // Register logging
  await server.register({
    plugin: HapiPino,
    options: {
      redact: ["req.headers.authorization"],
      logRequestComplete: true,
      logRequestStart: false,
      level: options.silent ? "silent" : "info",
    },
  });

  await server.register([authStrategy, authPlugin, monitorsPlugin]);

  // Initialize scheduler if enabled
  if (options.startScheduler !== false) {
    const db = options.db || getDb();
    const scheduler = new MonitorScheduler(db);

    // Pass scheduler instance to controllers
    setSchedulerInstance(scheduler);

    server.ext("onPostStart", async () => {
      await scheduler.start();
    });

    server.ext("onPreStop", async () => {
      scheduler.stop();
    });
  }

  return server;
}
