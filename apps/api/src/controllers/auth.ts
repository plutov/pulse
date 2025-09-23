import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { sign } from "jsonwebtoken";
import { UserRepository } from "../models/repositories/users";
import { LoginResponse } from "@pulse/shared";

const userRepository = new UserRepository();

export async function loginHandler(request: Hapi.Request) {
  const { username, password } = request.payload as {
    username: string;
    password: string;
  };

  const jwtSecret = process.env["JWT_SECRET"];
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

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
      jwtSecret,
      { expiresIn: "24h" },
    );

    const res: LoginResponse = {
      token,
      user: { id: user.id, username: user.username },
    };
    return res;
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }

    throw Boom.internal("Authentication failed");
  }
}
