import Joi from "joi";

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const createMonitorSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 1 character long",
    "string.max": "Name cannot exceed 255 characters",
  }),
  monitorType: Joi.string().valid("http").required().messages({
    "any.only": "Monitor type must be one of [http]",
    "any.required": "Monitor type is required",
  }),
});

export const monitorIdParamSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "ID must be a valid UUIDv4",
    "any.required": "ID is required",
  }),
});
