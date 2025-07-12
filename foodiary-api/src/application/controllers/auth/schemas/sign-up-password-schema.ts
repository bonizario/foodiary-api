import { signInPasswordSchema } from "@/application/controllers/auth/schemas/sign-in-password-schema";

export const signUpPasswordSchema = signInPasswordSchema.regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])/,
  {
    message: "Password must include uppercase and lowercase letters, numbers, and symbols",
  },
);
