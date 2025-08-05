import { z } from "zod";

import { Controller } from "@/application/contracts/controller";
import { UpdateGoalUseCase } from "@/application/use-cases/goals/update-goal-use-case";
import { Injectable } from "@/core/decorators/injectable";
import { Schema } from "@/core/decorators/schema";

const schema = z.object({
  calories: z.number().min(0).max(10_000),
  carbohydrates: z.number().min(0).max(10_000),
  fats: z.number().min(0).max(10_000),
  proteins: z.number().min(0).max(10_000),
});

type RequestBody = z.output<typeof schema>;

@Injectable()
@Schema(schema)
export class UpdateGoalController extends Controller<"authenticated"> {
  constructor(private readonly updateGoalUseCase: UpdateGoalUseCase) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"authenticated", RequestBody>,
  ): Promise<Controller.Response> {
    await this.updateGoalUseCase.execute({
      accountId: request.accountId,
      calories: request.body.calories,
      carbohydrates: request.body.carbohydrates,
      fats: request.body.fats,
      proteins: request.body.proteins,
    });

    return {
      statusCode: 204,
    };
  }
}
