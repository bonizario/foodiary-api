import { Meal } from "@/application/entities/meal";
import { Injectable } from "@/core/decorators/injectable";
import { MealRepository } from "@/infrastructure/database/dynamo/repositories/meal-repository";
import { MealsFileStorageGateway } from "@/infrastructure/gateways/meals-file-storage-gateway";

@Injectable()
export class CreateMealUseCase {
  constructor(
    private readonly mealRepository: MealRepository,
    private readonly mealsFileStorageGateway: MealsFileStorageGateway,
  ) {}

  public async execute(dto: CreateMealUseCase.Input): Promise<CreateMealUseCase.Output> {
    const inputFileKey = MealsFileStorageGateway.generateInputFileKey({
      accountId: dto.accountId,
      inputType: dto.file.inputType,
    });

    const meal = new Meal({
      accountId: dto.accountId,
      status: Meal.Status.UPLOADING,
      inputType: dto.file.inputType,
      inputFileKey,
    });

    await this.mealRepository.create(meal);

    return {
      mealId: meal.id,
    };
  }
}

export namespace CreateMealUseCase {
  export type Input = {
    accountId: string;
    file: {
      inputType: Meal.InputType;
      size: number;
    };
  };

  export type Output = {
    mealId: string;
  };
}
