import { ResourceNotFoundError } from "@/application/errors/application/resource-not-found-error";
import { Injectable } from "@/core/decorators/injectable";
import { GoalRepository } from "@/infrastructure/database/dynamo/repositories/goal-repository";

@Injectable()
export class UpdateGoalUseCase {
  constructor(private readonly goalRepository: GoalRepository) {}

  public async execute(dto: UpdateGoalUseCase.Input): Promise<UpdateGoalUseCase.Output> {
    const goal = await this.goalRepository.findByAccountId(dto.accountId);

    if (!goal) {
      throw new ResourceNotFoundError("Goal not found");
    }

    goal.calories = dto.calories;
    goal.carbohydrates = dto.carbohydrates;
    goal.fats = dto.fats;
    goal.proteins = dto.proteins;

    await this.goalRepository.save(goal);
  }
}

export namespace UpdateGoalUseCase {
  export type Input = {
    accountId: string;
    calories: number;
    carbohydrates: number;
    fats: number;
    proteins: number;
  };

  export type Output = void;
}
