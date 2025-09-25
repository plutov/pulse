import * as Hapi from "@hapi/hapi";
import { chartsRoutes } from "../routes/charts";

const chartsPlugin: Hapi.Plugin<null> = {
  name: "charts",
  version: "1.0.0",
  register: async function (server: Hapi.Server) {
    server.route(chartsRoutes);
  },
};

export default chartsPlugin;
