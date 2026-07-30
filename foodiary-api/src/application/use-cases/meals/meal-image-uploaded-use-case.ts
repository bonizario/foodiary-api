import { Meal } from "@/application/entities/meal";
import { ResourceNotFoundError } from "@/application/errors/application/resource-not-found-error";
import { Injectable } from "@/core/decorators/injectable";
import { MealRepository } from "@/infrastructure/database/dynamo/repositories/meal-repository";
import { MealsFileStorageGateway } from "@/infrastructure/gateways/meals-file-storage-gateway";

@Injectable()
export class MealImageUploadedUseCase {
  constructor(
    private readonly mealRepository: MealRepository,
    private readonly mealsFileStorageGateway: MealsFileStorageGateway,
  ) {}

  public async execute(
    dto: MealImageUploadedUseCase.Input,
  ): Promise<MealImageUploadedUseCase.Output> {
    const { accountId, mealId } = await this.mealsFileStorageGateway.getFileMetadata({
      fileKey: dto.fileKey,
    });

    const meal = await this.mealRepository.findById({ accountId, mealId });

    if (!meal) {
      throw new ResourceNotFoundError("Meal not found");
    }

    meal.status = Meal.Status.QUEUED;

    await this.mealRepository.save(meal);
  }
}

export namespace MealImageUploadedUseCase {
  export type Input = {
    fileKey: string;
  };

  export type Output = void;
}
