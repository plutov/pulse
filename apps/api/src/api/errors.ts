import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import Joi from "joi";

export const ApiErrorsEnum = {
  ValidationFailed: "Validation failed",
} as const;

export const validationFailAction: Hapi.Lifecycle.FailAction = (
  _request,
  _h,
  err,
) => {
  const customErr = Boom.badRequest(ApiErrorsEnum.ValidationFailed);
  if (err && err instanceof Joi.ValidationError) {
    customErr.output.payload.details = err?.details;
  }
  return customErr;
};
