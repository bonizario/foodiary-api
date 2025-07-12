import { ApplicationError } from "@/application/errors/application/application-error";
import { ErrorCode } from "@/application/errors/error-code";

export class EmailAlreadyInUseError extends ApplicationError {
  public override statusCode = 409;

  public override code: ErrorCode;

  constructor(options?: ErrorOptions) {
    super("This email is already in use", options);

    this.code = ErrorCode.EMAIL_ALREADY_IN_USE;
    this.name = "EmailAlreadyInUseError";
  }
}
