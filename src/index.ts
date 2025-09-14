import * as Hapi from "@hapi/hapi";
import reposPlugin from "./plugins/repos";

const init = async (): Promise<Hapi.Server> => {
  const server = Hapi.server({
    port: process.env["PORT"] || 3000,
    host: "localhost",
  });

  await server.register([reposPlugin]);

  await server.start();
  console.log(`server is running at http://localhost:${server.info.port}`);
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
