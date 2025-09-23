import * as Hapi from "@hapi/hapi";
import { authRoutes } from "../routes/auth";

const authPlugin: Hapi.Plugin<null> = {
  name: "app/auth",
  register: async function (server: Hapi.Server) {
    server.route(authRoutes);
  },
};

export default authPlugin;