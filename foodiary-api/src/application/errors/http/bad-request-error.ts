import { ErrorCode } from "@/application/errors/error-code";
import { HttpError } from "@/application/errors/http/http-error";

export class BadRequestError extends HttpError {
  public override statusCode = 400;

  public override code: ErrorCode;

  constructor(message?: string, code?: ErrorCode) {
    super(message || "Bad Request");

    this.code = code ?? ErrorCode.BAD_REQUEST;
    this.name = "BadRequestError";
  }
}
