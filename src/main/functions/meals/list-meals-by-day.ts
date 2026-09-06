import "reflect-metadata";

import { ListMealsByDayController } from "@/application/controllers/meals/list-meals-by-day-controller";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

export const handler = lambdaHttpAdapter(ListMealsByDayController);
