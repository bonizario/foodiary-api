import { z } from "zod";

export const confirmationCodeSchema = z.string().min(1, "Confirmation code is required");
