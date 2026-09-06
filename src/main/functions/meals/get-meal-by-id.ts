import "reflect-metadata";

import { GetMealByIdController } from "@/application/controllers/meals/get-meal-by-id-controller";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

export const handler = lambdaHttpAdapter(GetMealByIdController);
