import { GetCommand, PutCommand, UpdateCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";

import type { Goal } from "@/application/entities/goal";
import { Injectable } from "@/core/decorators/injectable";
import { dynamoClient } from "@/infrastructure/clients/dynamo-client";
import { GoalItem } from "@/infrastructure/database/dynamo/items/goal-item";
import { AppConfig } from "@/shared/config/app-config";

@Injectable()
export class GoalRepository {
  constructor(private readonly config: AppConfig) {}

  public async findByAccountId(accountId: string): Promise<Goal | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamo.mainTable,
      Key: {
        PK: GoalItem.getPK(accountId),
        SK: GoalItem.getSK(accountId),
      },
    });

    const { Item: goalItem } = await dynamoClient.send(command);

    if (!goalItem) {
      return null;
    }

    return GoalItem.toEntity(goalItem as GoalItem.Document);
  }

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

  async save(goal: Goal): Promise<void> {
    const goalItem = GoalItem.fromEntity(goal).toItem();

    const command = new UpdateCommand({
      TableName: this.config.db.dynamo.mainTable,
      Key: {
        PK: goalItem.PK,
        SK: goalItem.SK,
      },
      UpdateExpression:
        "SET #calories = :calories, #carbohydrates = :carbohydrates, #fats = :fats, #proteins = :proteins",
      ExpressionAttributeNames: {
        "#calories": "calories",
        "#carbohydrates": "carbohydrates",
        "#fats": "fats",
        "#proteins": "proteins",
      },
      ExpressionAttributeValues: {
        ":calories": goalItem.calories,
        ":carbohydrates": goalItem.carbohydrates,
        ":fats": goalItem.fats,
        ":proteins": goalItem.proteins,
      },
      ReturnValues: "NONE",
    });

    await dynamoClient.send(command);
  }
}
