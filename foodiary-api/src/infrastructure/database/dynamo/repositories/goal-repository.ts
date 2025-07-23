import { PutCommand } from "@aws-sdk/lib-dynamodb";

import type { Goal } from "@/application/entities/goal";
import { Injectable } from "@/core/decorators/injectable";
import { dynamoClient } from "@/infrastructure/clients/dynamo-client";
import { GoalItem } from "@/infrastructure/database/dynamo/items/goal-item";
import { AppConfig } from "@/shared/config/app-config";

@Injectable()
export class GoalRepository {
  constructor(private readonly config: AppConfig) {}

  public async create(goal: Goal): Promise<void> {
    const goalItem = GoalItem.fromEntity(goal);

    const command = new PutCommand({
      TableName: this.config.db.dynamo.mainTable,
      Item: goalItem.toItem(),
    });

    await dynamoClient.send(command);
  }
}
