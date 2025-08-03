import "reflect-metadata";

import { GetMealByIdController } from "@/application/controllers/meals/get-meal-by-id-controller";
import { Registry } from "@/core/di/registry";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

const controller = Registry.getInstance().resolve(GetMealByIdController);

export const handler = lambdaHttpAdapter(controller);
