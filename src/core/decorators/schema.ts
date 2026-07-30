import type { ZodSchema } from "zod";

const SCHEMA_METADATA_KEY = "custom:schema";

export function Schema(schema: ZodSchema): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(SCHEMA_METADATA_KEY, schema, target);
  };
}

export function getSchema(target: object): ZodSchema | undefined {
  return Reflect.getMetadata(SCHEMA_METADATA_KEY, target.constructor);
}

// Potentially rename this decorator to `Body` or something more descriptive when the time comes.
// We might also consider adding a `Query` or `Params` decorator in the future, and `Schema` could be misleading.
