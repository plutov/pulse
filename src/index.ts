import * as Hapi from "@hapi/hapi";
import { createServer } from "./server";

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
  console.error("unhandled rejection:", err);
  process.exit(1);
});

init().catch((err) => {
  console.error("failed to start server:", err);
  process.exit(1);
});
