import type { ErrorCode } from "@/application/errors/error-code";

export abstract class HttpError extends Error {
  public abstract statusCode: number;

  public abstract code: ErrorCode;
}
