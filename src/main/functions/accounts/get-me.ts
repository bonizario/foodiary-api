import "reflect-metadata";

import { GetMeController } from "@/application/controllers/accounts/get-me-controller";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

export const handler = lambdaHttpAdapter(GetMeController);
