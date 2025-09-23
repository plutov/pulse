import Joi from "joi";

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
    "string.empty": "Username cannot be empty",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
  }),
}).options({ abortEarly: false });

export const createMonitorSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 1 character long",
    "string.max": "Name cannot exceed 255 characters",
  }),
  monitorType: Joi.string().valid("http").required().messages({
    "string.only": "Monitor type must be one of [http]",
    "any.required": "Monitor type is required",
  }),
  schedule: Joi.string().required().messages({
    "string.empty": "Schedule cannot be empty",
    "any.required": "Schedule is required",
  }),
  status: Joi.string().valid("active", "paused").required().messages({
    "string.only": "Status must be one of [active, paused]",
    "any.required": "Status is required",
  }),
  config: Joi.alternatives()
    .try(
      Joi.object({
        url: Joi.string().uri().required().messages({
          "string.uri": "URL must be a valid URI",
          "any.required": "URL is required",
        }),
        method: Joi.string()
          .required()
          .valid("GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH")
          .default("GET")
          .messages({
            "any.required": "Method is required",
            "string.only":
              "Method must be one of [GET, POST, PUT, DELETE, HEAD, OPTIONS, PATCH]",
          }),
      }),
      // TODO: support other config types
    )
    .required()
    .messages({
      "any.required": "Config is required",
      "alternatives.match": "Config must match one of the allowed types",
    }),
}).options({ abortEarly: false });

export const monitorIdParamSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "ID must be a valid UUIDv4",
    "any.required": "ID is required",
  }),
});

export const listMonitorRunsParamsSchema = Joi.object({
  monitorId: Joi.string().guid({ version: "uuidv4" }).messages({
    "string.guid": "Monitor ID must be a valid UUIDv4",
  }),
  size: Joi.number().integer().min(1).max(1000).default(50).messages({
    "number.base": "Size must be a number",
    "number.integer": "Size must be an integer",
    "number.min": "Size must be at least 1",
    "number.max": "Size cannot exceed 1000",
  }),
  offset: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Offset must be a number",
    "number.integer": "Offset must be an integer",
    "number.min": "Offset cannot be negative",
  }),
}).options({ abortEarly: false });
