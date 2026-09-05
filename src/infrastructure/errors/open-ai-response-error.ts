import { InfrastructureErrorCode } from "@/infrastructure/errors/error-code";
import { InfrastructureError } from "@/infrastructure/errors/infrastructure-error";

export class OpenAIResponseError extends InfrastructureError {
  public override statusCode = 502;

  public override code: InfrastructureErrorCode;

  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    this.code = InfrastructureErrorCode.OPEN_AI_RESPONSE_ERROR;
    this.name = "OpenAIResponseError";
  }
}
