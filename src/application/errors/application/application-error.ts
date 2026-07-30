import type { ErrorCode } from "@/application/errors/error-code";

export abstract class ApplicationError extends Error {
  public statusCode?: number;

  public abstract code: ErrorCode;
}
