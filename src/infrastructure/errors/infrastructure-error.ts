import type { InfrastructureErrorCode } from "@/infrastructure/errors/error-code";

export abstract class InfrastructureError extends Error {
  public statusCode?: number;

  public abstract code: InfrastructureErrorCode;
}
