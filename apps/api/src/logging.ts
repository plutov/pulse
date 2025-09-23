import pino from "pino";

export const logger = pino({
  name: "pulse",
  level: "debug",
});
