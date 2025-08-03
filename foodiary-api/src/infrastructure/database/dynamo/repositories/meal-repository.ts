import { GetCommand, PutCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";

import { Meal } from "@/application/entities/meal";
import { Injectable } from "@/core/decorators/injectable";
import { dynamoClient } from "@/infrastructure/clients/dynamo-client";
import { MealItem } from "@/infrastructure/database/dynamo/items/meal-item";
import { AppConfig } from "@/shared/config/app-config";

@Injectable()
export class MealRepository {
  constructor(private readonly config: AppConfig) {}

  public getPutCommandInput(meal: Meal): PutCommandInput {
    const mealItem = MealItem.fromEntity(meal);

    return {
      TableName: this.config.db.dynamo.mainTable,
      Item: mealItem.toItem(),
    };
  }

  public async create(meal: Meal): Promise<void> {
    await dynamoClient.send(new PutCommand(this.getPutCommandInput(meal)));
  }

  public async findById({
    accountId,
    mealId,
  }: MealRepository.FindByIdParams): Promise<Meal | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamo.mainTable,
      Key: {
        PK: MealItem.getPK({ accountId, mealId }),
        SK: MealItem.getSK({ accountId, mealId }),
      },
    });

    const { Item: mealItem } = await dynamoClient.send(command);

    if (!mealItem) {
      return null;
    }

    return MealItem.toEntity(mealItem as MealItem.Document);
  }
}

namespace MealRepository {
  export type FindByIdParams = {
    accountId: string;
    mealId: string;
  };
}
