import { z } from "zod";

import { Controller } from "@/application/contracts/controller";
import { Meal } from "@/application/entities/meal";
import { ListMealsByDayQuery } from "@/application/query/list-meals-by-day-query";
import { Injectable } from "@/core/decorators/injectable";

const queryParamsSchema = z.object({
  date: z
    .string()
    .date("Date must be a valid date (YYYY-MM-DD format)")
    .transform((date) => new Date(date)),
});

type ResponseBody = {
  meals: {
    id: string;
    name: string;
    icon: string;
    foods: Meal.Food[];
    createdAt: string;
  }[];
};

@Injectable()
export class ListMealsByDayController extends Controller<"authenticated", ResponseBody> {
  constructor(private readonly listMealsByDayQuery: ListMealsByDayQuery) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"authenticated">,
  ): Promise<Controller.Response<ResponseBody>> {
    const { date } = queryParamsSchema.parse(request.queryParams);

    const { meals } = await this.listMealsByDayQuery.execute({
      accountId: request.accountId,
      date,
    });

    return {
      statusCode: 200,
      body: {
        meals,
      },
    };
  }
}
