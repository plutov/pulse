import j from "./extend";

export const createMonitorSchema = j
  .object({
    name: j.string().min(1).max(255).required().messages({
      "any.required": "Name is required",
      "string.empty": "Name cannot be empty",
      "string.min": "Name must be at least 1 character long",
      "string.max": "Name cannot exceed 255 characters",
    }),
    monitorType: j.string().valid("http").required().messages({
      "any.only": "Monitor type must be one of [http]",
      "any.required": "Monitor type is required",
    }),
    schedule: j.string().cron().required().messages({
      "string.empty": "Schedule cannot be empty",
      "any.required": "Schedule is required",
      "string.cron": "Schedule must be a valid cron expression",
    }),
    status: j.string().valid("active", "paused").required().messages({
      "any.only": "Status must be one of [active, paused]",
      "any.required": "Status is required",
    }),
    config: j
      .alternatives()
      .try(
        j.object({
          url: j.string().uri().required().messages({
            "string.uri": "URL must be a valid URI",
            "any.required": "URL is required",
          }),
          method: j
            .string()
            .required()
            .valid("GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH")
            .default("GET")
            .messages({
              "any.required": "Method is required",
              "any.only":
                "Method must be one of [GET, POST, PUT, DELETE, HEAD, OPTIONS, PATCH]",
            }),
        }),
      )
      .required()
      .messages({
        "any.required": "Config is required",
        "alternatives.match": "Config must match one of the allowed types",
      }),
  })
  .options({ abortEarly: false });

export const monitorIdParamSchema = j.object({
  id: j.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "ID must be a valid UUIDv4",
    "any.required": "ID is required",
  }),
});
