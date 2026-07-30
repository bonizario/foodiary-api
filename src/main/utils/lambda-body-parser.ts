import type { APIGatewayProxyEventV2 } from "aws-lambda";

import { BadRequestError } from "@/application/errors/http/bad-request-error";

export function lambdaBodyParser(body: APIGatewayProxyEventV2["body"]): Record<string, unknown> {
  try {
    if (!body) {
      return {};
    }

    return JSON.parse(body);
  } catch {
    throw new BadRequestError("Invalid JSON body");
  }
}
