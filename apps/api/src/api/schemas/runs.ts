import j from "./extend";

export const listMonitorRunsParamsSchema = j
  .object({
    monitorId: j.string().guid({ version: "uuidv4" }).messages({
      "string.guid": "Monitor ID must be a valid UUIDv4",
    }),
    size: j.number().integer().min(1).max(1000).default(50).messages({
      "number.base": "Size must be a number",
      "number.integer": "Size must be an integer",
      "number.min": "Size must be at least 1",
      "number.max": "Size cannot exceed 1000",
    }),
    offset: j.number().integer().min(0).default(0).messages({
      "number.base": "Offset must be a number",
      "number.integer": "Offset must be an integer",
      "number.min": "Offset cannot be negative",
    }),
  })
  .options({ abortEarly: false });
