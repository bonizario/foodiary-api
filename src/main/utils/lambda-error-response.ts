import { ErrorCode } from "@/application/errors/error-code";

interface LambdaErrorResponseParams {
  code: ErrorCode;
  message: unknown;
  statusCode: number;
}

export function lambdaErrorResponse({ code, message, statusCode }: LambdaErrorResponseParams) {
  return {
    statusCode,
    body: JSON.stringify({
      error: {
        code,
        message,
      },
    }),
  };
}
