import Joi from "joi";
import cron from "node-cron";

const j = Joi.extend({
  type: "string",
  base: Joi.string(),
  messages: {
    "string.cron": '"{{#value}}" must be a valid cron expression"',
  },
  rules: {
    cron: {
      validate(value, { error }) {
        const res = cron.validate(value);
        if (!res) {
          return error("string.cron", { value });
        }

        return value;
      },
    },
  },
});

export default j;
