import Joi from "joi";

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.required": "Username is required",
    "string.empty": "Username cannot be empty",
  }),
  password: Joi.string().required().messages({
    "string.required": "Password is required",
    "string.empty": "Password cannot be empty",
  }),
}).options({ abortEarly: false });

export const createMonitorSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 1 character long",
    "string.max": "Name cannot exceed 255 characters",
  }),
  monitorType: Joi.string().valid("http").required().messages({
    "string.only": "Monitor type must be one of [http]",
    "string.required": "Monitor type is required",
  }),
  schedule: Joi.string().required().messages({
    "string.empty": "Schedule cannot be empty",
    "string.required": "Schedule is required",
  }),
  status: Joi.string().valid("active", "paused").required().messages({
    "string.only": "Status must be one of [active, paused]",
    "string.required": "Status is required",
  }),
  httpConfig: Joi.object({
    url: Joi.string().uri().required().messages({
      "string.uri": "URL must be a valid URI",
      "string.required": "URL is required when httpConfig is provided",
    }),
    method: Joi.string()
      .valid("GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH")
      .default("GET"),
  }).optional(),
}).options({ abortEarly: false });

export const monitorIdParamSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "ID must be a valid UUIDv4",
    "any.required": "ID is required",
  }),
});
