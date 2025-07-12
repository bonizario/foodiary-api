import { ApplicationError } from "@/application/errors/application/application-error";
import { ErrorCode } from "@/application/errors/error-code";

export class InvalidCredentials extends ApplicationError {
  public override statusCode = 401;

  public override code: ErrorCode;

  constructor(options?: ErrorOptions) {
    super("Invalid credentials", options);

    this.code = ErrorCode.INVALID_CREDENTIALS;
    this.name = "InvalidCredentials";
  }
}
