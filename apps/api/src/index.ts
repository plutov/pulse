import * as Hapi from "@hapi/hapi";
import { createServer } from "./server";
import { logger } from "./logging";

const init = async (): Promise<Hapi.Server> => {
  const server = await createServer({
    port: process.env["PORT"] || 3000,
  });

  await server.start();
  server.log(
    "info",
    `server is running at http://localhost:${server.info.port}`,
  );
  return server;
};

process.on("unhandledRejection", (err) => {
  logger.error(err, "unhandled rejection");
  process.exit(1);
});

init().catch((err) => {
  logger.error(err, "failed to start server");
  process.exit(1);
});
