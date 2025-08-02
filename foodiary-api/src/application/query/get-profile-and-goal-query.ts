import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import type { Profile } from "@/application/entities/profile";
import { ResourceNotFoundError } from "@/application/errors/application/resource-not-found-error";
import { Injectable } from "@/core/decorators/injectable";
import { dynamoClient } from "@/infrastructure/clients/dynamo-client";
import { AccountItem } from "@/infrastructure/database/dynamo/items/account-item";
import { GoalItem } from "@/infrastructure/database/dynamo/items/goal-item";
import { ProfileItem } from "@/infrastructure/database/dynamo/items/profile-item";
import { AppConfig } from "@/shared/config/app-config";

@Injectable()
export class GetProfileAndGoalQuery {
  constructor(private readonly config: AppConfig) {}

  async execute({
    accountId,
  }: GetProfileAndGoalQuery.Input): Promise<GetProfileAndGoalQuery.Output> {
    const command = new QueryCommand({
      TableName: this.config.db.dynamo.mainTable,
      Limit: 2,
      ProjectionExpression:
        "#PK, #SK, #name, #birthdate, #biologicalSex, #height, #weight, #calories, #carbohydrates, #fats, #proteins, #type",
      KeyConditionExpression: "#PK = :PK AND begins_with(#SK, :SK)",
      ExpressionAttributeNames: {
        "#PK": "PK",
        "#SK": "SK",
        "#name": "name",
        "#birthdate": "birthdate",
        "#biologicalSex": "biologicalSex",
        "#height": "height",
        "#weight": "weight",
        "#calories": "calories",
        "#carbohydrates": "carbohydrates",
        "#fats": "fats",
        "#proteins": "proteins",
        "#type": "type",
      },
      ExpressionAttributeValues: {
        ":PK": AccountItem.getPK(accountId),
        ":SK": `${AccountItem.getPK(accountId)}#`,
      },
    });

    const { Items = [] } = await dynamoClient.send(command);

    const profile = Items.find(
      (item): item is GetProfileAndGoalQuery.ProfileDocument => item["type"] === ProfileItem.type,
    );

    const goal = Items.find(
      (item): item is GetProfileAndGoalQuery.GoalDocument => item["type"] === GoalItem.type,
    );

    if (!profile || !goal) {
      throw new ResourceNotFoundError("Account not found");
    }

    return {
      profile: {
        name: profile.name,
        birthdate: profile.birthdate,
        biologicalSex: profile.biologicalSex,
        height: profile.height,
        weight: profile.weight,
      },
      goal: {
        calories: goal.calories,
        carbohydrates: goal.carbohydrates,
        fats: goal.fats,
        proteins: goal.proteins,
      },
    };
  }
}

export namespace GetProfileAndGoalQuery {
  export type Input = {
    accountId: string;
  };

  export type Output = {
    profile: Omit<ProfileDocument, "PK" | "SK" | "type">;
    goal: Omit<GoalDocument, "PK" | "SK" | "type">;
  };

  export type ProfileDocument = {
    PK: string;
    SK: string;
    type: string;
    name: string;
    birthdate: string;
    biologicalSex: Profile.BiologicalSex;
    height: number;
    weight: number;
  };

  export type GoalDocument = {
    PK: string;
    SK: string;
    type: string;
    calories: number;
    carbohydrates: number;
    fats: number;
    proteins: number;
  };
}
