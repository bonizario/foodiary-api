import { ApplicationError } from "@/application/errors/application/application-error";
import { ErrorCode } from "@/application/errors/error-code";

export class InvalidForgotPasswordConfirmationCodeError extends ApplicationError {
  public override statusCode = 400;

  public override code: ErrorCode;

  constructor(options?: ErrorOptions) {
    super("Invalid forgot password confirmation code", options);

    this.code = ErrorCode.INVALID_FORGOT_PASSWORD_CONFIRMATION_CODE;
    this.name = "InvalidForgotPasswordConfirmationCodeError";
  }
}
