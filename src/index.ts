import * as Hapi from "@hapi/hapi";
import { Engine as CatboxRedis } from "@hapi/catbox-redis";
import HapiPino from "hapi-pino";
import authPlugin from "./plugins/auth";
import reposPlugin from "./plugins/repos";

const init = async (): Promise<Hapi.Server> => {
  const server = Hapi.server({
    port: process.env["PORT"] || 3000,
    host: "localhost",
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

  // Register logging first
  await server.register({
    plugin: HapiPino,
    options: {
      redact: ["req.headers.authorization"],
      logRequestComplete: true,
      logRequestStart: false,
    },
  });

  await server.register([authPlugin, reposPlugin]);

  await server.start();
  server.log(
    "info",
    `server is running at http://localhost:${server.info.port}`,
  );
  return server;
};

process.on("unhandledRejection", (err) => {
  console.error("unhandled rejection:", err);
  process.exit(1);
});

init().catch((err) => {
  console.error("failed to start server:", err);
  process.exit(1);
});
