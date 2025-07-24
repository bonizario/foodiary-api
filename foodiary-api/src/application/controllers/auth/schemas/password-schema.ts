import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])/;

export const passwordSchema = z.string().min(8).max(128).regex(PASSWORD_REGEX, {
  message: "Password must include uppercase and lowercase letters, numbers, and symbols",
});
