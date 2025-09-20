import * as Hapi from "@hapi/hapi";
import { Engine as CatboxRedis } from "@hapi/catbox-redis";
import HapiPino from "hapi-pino";
import authPlugin from "./plugins/auth";
import monitorsPlugin from "./plugins/monitors";
import { Boom } from "@hapi/boom";

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
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow Vite dev server
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
        credentials: true
      }
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
      const errorResponse = {
        message: error.message,
      };
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
