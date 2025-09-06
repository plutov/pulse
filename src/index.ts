import Hapi from "@hapi/hapi";

const server: Hapi.Server = Hapi.server({
  port: process.env["PORT"] || 3000,
  host: process.env["HOST"] || "localhost",
});

async function start(): Promise<Hapi.Server> {
  await server.start();
  return server;
}

process.on("unhandledRejection", async (err) => {
  console.log(err);
  process.exit(1);
});

start()
  .then((server) => {
    console.log(`server started at: ${server.info.uri}`);
  })
  .catch((err) => {
    console.log(err);
  });
