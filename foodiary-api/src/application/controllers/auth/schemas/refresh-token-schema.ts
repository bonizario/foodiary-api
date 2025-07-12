import { z } from "zod";

export const refreshTokenSchema = z.string().min(1, { message: "Refresh token is required" });
