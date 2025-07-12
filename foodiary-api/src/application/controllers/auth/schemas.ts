import { z } from "zod";

export const emailSchema = z.string().email({ message: '"email" is invalid' });

export const signInPasswordSchema = z
  .string()
  .min(8, { message: '"password" must be at least 8 characters long' })
  .max(128, { message: '"password" must be at most 128 characters long' });

export const signUpPasswordSchema = signInPasswordSchema.regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])/,
  {
    message: '"password" must include uppercase and lowercase letters, numbers, and symbols',
  },
);

export const refreshTokenSchema = z.string().min(1, { message: '"refreshToken" is required' });
