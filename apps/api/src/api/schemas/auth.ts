import j from "./extend";

export const loginSchema = j
  .object({
    username: j.string().required().messages({
      "any.required": "Username is required",
      "string.empty": "Username cannot be empty",
    }),
    password: j.string().required().messages({
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  })
  .options({ abortEarly: false });
