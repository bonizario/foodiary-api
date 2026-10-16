import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { Meal } from "@/application/entities/meal";
import { dynamoClient } from "@/infrastructure/clients/dynamo-client";
import { MealItem } from "@/infrastructure/database/dynamo/items/meal-item";
import { Injectable } from "@/kernel/decorators/injectable";
import { AppConfig } from "@/shared/config/app-config";

@Injectable()
export class ListMealsByDayQuery {
  constructor(private readonly config: AppConfig) {}

  public async execute({
    accountId,
    date,
  }: ListMealsByDayQuery.Input): Promise<ListMealsByDayQuery.Output> {
    const command = new QueryCommand({
      TableName: this.config.db.dynamo.mainTable,
      IndexName: "GSI1",
      ProjectionExpression: "#GSI1PK, #id, #name, #icon, #foods, #createdAt, #timeZone",
      KeyConditionExpression: "#GSI1PK = :GSI1PK",
      FilterExpression: "#status = :status",
      ScanIndexForward: false,
      ExpressionAttributeNames: {
        "#GSI1PK": "GSI1PK",
        "#id": "id",
        "#name": "name",
        "#status": "status",
        "#icon": "icon",
        "#foods": "foods",
        "#createdAt": "createdAt",
        "#timeZone": "timeZone",
      },
      ExpressionAttributeValues: {
        ":GSI1PK": MealItem.getGSI1PK({ accountId, localDay: date }),
        ":status": Meal.Status.SUCCESS,
      },
    });

    const { Items = [] } = await dynamoClient.send(command);

    const meals = Items.map((item): ListMealsByDayQuery.Output["meals"][number] => ({
      id: item["id"],
      name: item["name"],
      icon: item["icon"],
      foods: item["foods"],
      createdAt: item["createdAt"],
      timeZone: item["timeZone"],
    }));

    return {
      meals,
    };
  }
}

export namespace ListMealsByDayQuery {
  export type Input = {
    accountId: string;
    date: string;
  };

  export type Output = {
    meals: Omit<MealDocument, "GSI1PK" | "status">[];
  };

  export type MealDocument = {
    GSI1PK: string;
    id: string;
    name: string;
    status: Meal.Status;
    icon: string;
    foods: Meal.Food[];
    createdAt: string;
    timeZone: string;
  };
}
