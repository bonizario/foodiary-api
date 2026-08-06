import { Meal } from "@/application/entities/meal";
import { ResourceNotFoundError } from "@/application/errors/application/resource-not-found-error";
import { Injectable } from "@/core/decorators/injectable";
import { MealsAIGateway } from "@/infrastructure/ai/gateways/meals-ai-gateway";
import { MealRepository } from "@/infrastructure/database/dynamo/repositories/meal-repository";

const MAX_PROCESSING_ATTEMPTS = 2;

@Injectable()
export class ProcessMealUseCase {
  constructor(
    private readonly mealRepository: MealRepository,
    private readonly mealsAIGateway: MealsAIGateway,
  ) {}

  public async execute(dto: ProcessMealUseCase.Input): Promise<ProcessMealUseCase.Output> {
    const meal = await this.mealRepository.findById({
      accountId: dto.accountId,
      mealId: dto.mealId,
    });

    if (!meal) {
      throw new ResourceNotFoundError(
        `Meal "${dto.mealId}" not found for account "${dto.accountId}"`,
      );
    }

    if (meal.status === Meal.Status.UPLOADING) {
      throw new Error(`Meal "${dto.mealId}" is still uploading`);
    }

    if (meal.status === Meal.Status.PROCESSING) {
      throw new Error(`Meal "${dto.mealId}" is already being processed`);
    }

    if (meal.status === Meal.Status.SUCCESS) {
      return;
    }

    try {
      meal.status = Meal.Status.PROCESSING;
      meal.processingAttempts += 1;
      await this.mealRepository.save(meal);

      const { name, icon, foods } = await this.mealsAIGateway.processMeal(meal);

      meal.status = Meal.Status.SUCCESS;
      meal.name = name;
      meal.icon = icon;
      meal.foods = foods;

      await this.mealRepository.save(meal);
    } catch (error) {
      meal.status =
        meal.processingAttempts >= MAX_PROCESSING_ATTEMPTS
          ? Meal.Status.FAILED
          : Meal.Status.QUEUED;
      await this.mealRepository.save(meal);
      throw error;
    }
  }
}

export namespace ProcessMealUseCase {
  export type Input = {
    accountId: string;
    mealId: string;
  };

  export type Output = void;
}
