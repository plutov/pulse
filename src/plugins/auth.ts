import * as Hapi from "@hapi/hapi";
import * as jwt from "hapi-auth-jwt2";
import { JwtPayload } from "jsonwebtoken";

const validate = function (decoded: JwtPayload) {
  return { isValid: true, credentials: { user: decoded } };
};

const authPlugin: Hapi.Plugin<null> = {
  name: "app/auth",
  register: async function (server: Hapi.Server) {
    await server.register(jwt);

    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is required");
    }

    server.auth.strategy("jwt", "jwt", {
      key: jwtSecret,
      validate,
    });

    // Set JWT as the default authentication strategy
    server.auth.default("jwt");
  },
};

export default authPlugin;

