import { z } from "zod";

/**
 * Builds a Zod codec that parses a JSON string into `schema` on decode and
 * serializes back to JSON on encode. Reports a Zod issue on malformed JSON.
 */
export function jsonCodec<T extends z.core.$ZodType>(schema: T) {
  return z.codec(z.string(), schema, {
    decode: (jsonString, ctx) => {
      try {
        return JSON.parse(jsonString);
      } catch (error: unknown) {
        ctx.issues.push({
          code: "invalid_format",
          format: "json",
          input: jsonString,
          message: error instanceof Error ? error.message : "Invalid JSON",
        });
        return z.NEVER;
      }
    },
    encode: (value) => JSON.stringify(value),
  });
}
