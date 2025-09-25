import { ChartInterval } from "@pulse/shared";
import j from "./extend";

export const timeSeriesChartSchema = j
  .object({
    monitorIds: j
      .array()
      .items(j.string().guid({ version: "uuidv4" }))
      .min(1)
      .required()
      .messages({
        "any.required": "Monitor IDs are required",
        "array.min": "At least one monitor ID is required",
        "string.guid": "Each monitor ID must be a valid UUIDv4",
      }),
    timeRange: j
      .string()
      .valid(...Object.values(ChartInterval))
      .required()
      .messages({
        "any.required": "Time range is required",
        "any.only": `Time range must be one of: ${Object.values(ChartInterval).join(", ")}`,
      }),
    interval: j
      .string()
      .valid(...Object.values(ChartInterval))
      .required()
      .messages({
        "any.required": "Interval is required",
        "any.only": `Interval must be one of: ${Object.values(ChartInterval).join(", ")}`,
      }),
  })
  .options({ abortEarly: false });
