import { Meal } from "@/application/entities/meal";
import { ResourceNotFoundError } from "@/application/errors/application/resource-not-found-error";
import { Injectable } from "@/core/decorators/injectable";
import { MealRepository } from "@/infrastructure/database/dynamo/repositories/meal-repository";

@Injectable()
export class GetMealByIdUseCase {
  constructor(private readonly mealRepository: MealRepository) {}

  public async execute(dto: GetMealByIdUseCase.Input): Promise<GetMealByIdUseCase.Output> {
    const meal = await this.mealRepository.findById({
      accountId: dto.accountId,
      mealId: dto.mealId,
    });

    if (!meal) {
      throw new ResourceNotFoundError("Meal not found");
    }

    return {
      meal: {
        id: meal.id,
        status: meal.status,
        inputType: meal.inputType,
        inputFileKey: meal.inputFileKey,
        name: meal.name,
        icon: meal.icon,
        foods: meal.foods,
        createdAt: meal.createdAt,
      },
    };
  }
}

export namespace GetMealByIdUseCase {
  export type Input = {
    accountId: string;
    mealId: string;
  };

  export type Output = {
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
}
