import * as Hapi from "@hapi/hapi";
import * as jwt from "hapi-auth-jwt2";
import * as Joi from "joi";
import { JwtPayload } from "jsonwebtoken";
import { sign } from "jsonwebtoken";
import { UserRepository } from "../database/repositories/user-repository";
import * as Boom from "@hapi/boom";

const validate = async function (decoded: JwtPayload) {
  const userRepository = new UserRepository();
  const user = await userRepository.findById(decoded["id"]);
  if (!user) {
    return { isValid: false };
  }

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

    server.auth.default("jwt");

    server.route({
      method: "POST",
      path: "/auth/login",
      options: {
        auth: false,
        validate: {
          payload: Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required(),
          }),
        },
      },
      handler: loginHandler,
    });
  },
};

async function loginHandler(request: Hapi.Request) {
  const { username, password } = request.payload as {
    username: string;
    password: string;
  };

  const userRepository = new UserRepository();
  const jwtSecret = process.env["JWT_SECRET"];

  try {
    const user = await userRepository.verifyPassword(username, password);

    if (!user) {
      throw Boom.unauthorized("Invalid username or password");
    }

    const token = sign(
      {
        id: user.id,
        username: user.username,
      },
      jwtSecret!,
      { expiresIn: "24h" },
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }

    throw Boom.internal("Authentication failed");
  }
}

export default authPlugin;
