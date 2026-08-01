import type { QueueConsumer } from "@/application/contracts/queue-consumer";
import { ProcessMealUseCase } from "@/application/use-cases/meals/process-meal-use-case";
import { Injectable } from "@/core/decorators/injectable";
import type { MealsQueueGateway } from "@/infrastructure/gateways/meals-queue-gateway";

@Injectable()
export class MealsQueueConsumer implements QueueConsumer<MealsQueueGateway.Message> {
  constructor(private readonly processMealUseCase: ProcessMealUseCase) {}

  public async process({ accountId, mealId }: MealsQueueGateway.Message): Promise<void> {
    await this.processMealUseCase.execute({ accountId, mealId });
  }
}
