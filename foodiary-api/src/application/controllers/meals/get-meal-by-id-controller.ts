import { Controller } from "@/application/contracts/controller";
import { Meal } from "@/application/entities/meal";
import { GetMealByIdUseCase } from "@/application/use-cases/meals/get-meal-by-id-use-case";
import { Injectable } from "@/core/decorators/injectable";

type RequestParams = {
  mealId: string;
};

type ResponseBody = {
  meal: {
    id: string;
    status: Meal.Status;
    inputType: Meal.InputType;
    inputFileKey: string;
    name: string | null;
    icon: string | null;
    foods: Meal.Food[];
    createdAt: Date;
  };
};

@Injectable()
export class GetMealByIdController extends Controller<"authenticated", ResponseBody> {
  constructor(private readonly getMealByIdUseCase: GetMealByIdUseCase) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"authenticated", undefined, RequestParams>,
  ): Promise<Controller.Response<ResponseBody>> {
    const { meal } = await this.getMealByIdUseCase.execute({
      accountId: request.accountId,
      mealId: request.params.mealId,
    });

    return {
      statusCode: 200,
      body: {
        meal,
      },
    };
  }
}
