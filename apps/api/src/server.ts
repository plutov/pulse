import * as Hapi from "@hapi/hapi";
import { Engine as CatboxRedis } from "@hapi/catbox-redis";
import HapiPino from "hapi-pino";
import authPlugin from "./plugins/auth";
import monitorsPlugin from "./plugins/monitors";
import { Boom } from "@hapi/boom";
import { ErrorResponse } from "@pulse/shared";

interface ServerOptions {
  port?: number | string;
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
    },
  });

  await server.register([authPlugin, monitorsPlugin]);

  return server;
}
