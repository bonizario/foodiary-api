import { Meal } from "@/application/entities/meal";
import { ResourceNotFoundError } from "@/application/errors/application/resource-not-found-error";
import { Injectable } from "@/core/decorators/injectable";
import { MealRepository } from "@/infrastructure/database/dynamo/repositories/meal-repository";
import { MealsFileStorageGateway } from "@/infrastructure/gateways/meals-file-storage-gateway";

@Injectable()
export class GetMealByIdUseCase {
  constructor(
    private readonly mealRepository: MealRepository,
    private readonly mealsFileStorageGateway: MealsFileStorageGateway,
  ) {}

  public async execute(dto: GetMealByIdUseCase.Input): Promise<GetMealByIdUseCase.Output> {
    const meal = await this.mealRepository.findById({
      accountId: dto.accountId,
      mealId: dto.mealId,
    });

    if (!meal) {
      throw new ResourceNotFoundError("Meal not found");
    }

    const inputFileUrl = this.mealsFileStorageGateway.getFileUrl(meal.inputFileKey);

    return {
      meal: {
        id: meal.id,
        status: meal.status,
        inputType: meal.inputType,
        inputFileUrl,
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
      inputFileUrl: string;
      name: string | null;
      icon: string | null;
      foods: Meal.Food[];
      createdAt: Date;
    };
  };
}
