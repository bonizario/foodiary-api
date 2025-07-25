import { PutCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";

import type { Goal } from "@/application/entities/goal";
import { Injectable } from "@/core/decorators/injectable";
import { dynamoClient } from "@/infrastructure/clients/dynamo-client";
import { GoalItem } from "@/infrastructure/database/dynamo/items/goal-item";
import { AppConfig } from "@/shared/config/app-config";

@Injectable()
export class GoalRepository {
  constructor(private readonly config: AppConfig) {}

  public getPutCommandInput(goal: Goal): PutCommandInput {
    const goalItem = GoalItem.fromEntity(goal);

    return {
      TableName: this.config.db.dynamo.mainTable,
      Item: goalItem.toItem(),
    };
  }

  public async create(goal: Goal): Promise<void> {
    await dynamoClient.send(new PutCommand(this.getPutCommandInput(goal)));
  }
}
