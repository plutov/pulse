import * as Hapi from "@hapi/hapi";
import { monitorRoutes } from "../routes/monitors";

const monitorsPlugin: Hapi.Plugin<null> = {
  name: "app/monitors",
  register: function (server: Hapi.Server) {
    server.route(monitorRoutes);
  },
};

export default monitorsPlugin;