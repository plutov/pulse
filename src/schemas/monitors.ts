import Joi from "joi";

export const createMonitorSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  monitorType: Joi.string().valid("http").required(),
});

export const monitorIdParamSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});
