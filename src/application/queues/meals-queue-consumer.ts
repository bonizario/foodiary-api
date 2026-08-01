import type { QueueConsumer } from "@/application/contracts/queue-consumer";
import { Injectable } from "@/core/decorators/injectable";
import type { MealsQueueGateway } from "@/infrastructure/gateways/meals-queue-gateway";

@Injectable()
export class MealsQueueConsumer implements QueueConsumer<MealsQueueGateway.Message> {
  public async process({ accountId, mealId }: MealsQueueGateway.Message): Promise<void> {
    console.log(JSON.stringify({ accountId, mealId }, null, 2));
  }
}
