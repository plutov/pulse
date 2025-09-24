import * as Hapi from "@hapi/hapi";

const healthzPlugin: Hapi.Plugin<null> = {
  name: "app/healthz",
  register: async function (server: Hapi.Server) {
    server.route({
      method: "GET",
      path: "/healthz",
      options: {
        auth: false,
      },
      handler: async (_rrequest, h) => {
        return h.response({ status: "ok" }).code(200);
      },
    });
  },
};

export default healthzPlugin;
