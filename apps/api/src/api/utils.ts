import * as Boom from "@hapi/boom";
import Joi from "joi";

export const validationFailAction = (_request: any, _h: any, err: any) => {
  const customErr = Boom.badRequest("Validation failed");
  if (err && err instanceof Joi.ValidationError) {
    customErr.output.payload.details = err?.details;
  }
  return customErr;
};

