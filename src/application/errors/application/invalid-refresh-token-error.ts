import { ApplicationError } from "@/application/errors/application/application-error";
import { ErrorCode } from "@/application/errors/error-code";

export class InvalidRefreshTokenError extends ApplicationError {
  public override statusCode = 401;

  public override code: ErrorCode;

  constructor(options?: ErrorOptions) {
    super("Invalid refresh token", options);

    this.code = ErrorCode.INVALID_REFRESH_TOKEN;
    this.name = "InvalidRefreshTokenError";
  }
}
