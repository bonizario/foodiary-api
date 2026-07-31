import { Injectable } from "@/core/decorators/injectable";
import { sqsClient } from "@/infrastructure/clients/sqs-client";
import { AppConfig } from "@/shared/config/app-config";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

@Injectable()
export class MealsQueueGateway {
  constructor(private readonly config: AppConfig) {}

  public async publish(message: MealsQueueGateway.Message): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: this.config.queues.mealsQueueUrl,
      MessageBody: JSON.stringify(message),
    });

    await sqsClient.send(command);
  }
}

export namespace MealsQueueGateway {
  export type Message = {
    accountId: string;
    mealId: string;
  };
}
