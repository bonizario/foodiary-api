import "reflect-metadata";

import { CreateMealController } from "@/application/controllers/meals/create-meal-controller";
import { Registry } from "@/core/di/registry";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

const controller = Registry.getInstance().resolve(CreateMealController);

export const handler = lambdaHttpAdapter(controller);
