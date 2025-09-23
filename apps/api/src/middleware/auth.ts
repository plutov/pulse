import * as Hapi from "@hapi/hapi";
import * as jwt from "hapi-auth-jwt2";
import { JwtPayload } from "jsonwebtoken";
import { UserRepository } from "../models/repositories/user-repository";

const userRepository = new UserRepository();

const validate = async function (decoded: JwtPayload) {
  const user = await userRepository.findById(decoded["id"]);
  if (!user) {
    return { isValid: false };
  }

  return { isValid: true };
};

export const authStrategy: Hapi.Plugin<null> = {
  name: "auth-strategy",
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
    server.auth.default("jwt");
  },
};