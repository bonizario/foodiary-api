import "reflect-metadata";

import { CreateMealController } from "@/application/controllers/meals/create-meal-controller";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

export const handler = lambdaHttpAdapter(CreateMealController);
