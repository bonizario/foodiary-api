import { ApplicationError } from "@/application/errors/application/application-error";
import { ErrorCode } from "@/application/errors/error-code";

export class ResourceNotFoundError extends ApplicationError {
  public override statusCode = 404;

  public override code: ErrorCode;

  constructor(message = "Resource not found", options?: ErrorOptions) {
    super(message, options);

    this.code = ErrorCode.RESOURCE_NOT_FOUND;
    this.name = "ResourceNotFoundError";
  }
}
