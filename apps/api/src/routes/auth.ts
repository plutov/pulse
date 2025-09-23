import * as Hapi from "@hapi/hapi";
import { loginHandler } from "../controllers/auth";
import { loginSchema } from "../api/schemas";
import { validationFailAction } from "../api/errors";

export const authRoutes: Hapi.ServerRoute[] = [
  {
    method: "POST",
    path: "/auth/login",
    options: {
      auth: false,
      validate: {
        payload: loginSchema,
        failAction: validationFailAction,
      },
    },
    handler: loginHandler,
  },
];