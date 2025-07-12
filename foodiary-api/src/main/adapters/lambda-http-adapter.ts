import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { ZodError } from "zod";

import type { Controller } from "@/application/contracts/controller";
import { ApplicationError } from "@/application/errors/application/application-error";
import { ErrorCode } from "@/application/errors/error-code";
import { HttpError } from "@/application/errors/http/http-error";
import { lambdaBodyParser } from "@/main/utils/lambda-body-parser";
import { lambdaErrorResponse } from "@/main/utils/lambda-error-response";

type Event = APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer;

export function lambdaHttpAdapter(controller: Controller<Controller.RequestType, unknown>) {
  return async (event: Event): Promise<APIGatewayProxyResultV2> => {
    try {
      const body = lambdaBodyParser(event.body);
      const params = event.pathParameters ?? {};
      const queryParams = event.queryStringParameters ?? {};
      const accountId =
        "authorizer" in event.requestContext
          ? (event.requestContext.authorizer.jwt.claims["internalId"] as string)
          : null;

      const response = await controller.execute({
        body,
        params,
        queryParams,
        accountId,
      });

      return {
        statusCode: response.statusCode,
        body: response.body ? JSON.stringify(response.body) : undefined,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return lambdaErrorResponse({
          code: ErrorCode.VALIDATION,
          message: error.issues.map((issue) => ({
            field: issue.path.join("."),
            error: issue.message,
          })),
          statusCode: 400,
        });
      }

      if (error instanceof HttpError) {
        return lambdaErrorResponse(error);
      }

      if (error instanceof ApplicationError) {
        return lambdaErrorResponse({
          code: error.code,
          message: error.message,
          statusCode: error.statusCode ?? 400,
        });
      }

      console.error(error);

      return lambdaErrorResponse({
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error",
        statusCode: 500,
      });
    }
  };
}
