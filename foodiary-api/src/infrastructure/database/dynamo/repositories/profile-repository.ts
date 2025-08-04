import { GetCommand, PutCommand, UpdateCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";

import type { Profile } from "@/application/entities/profile";
import { Injectable } from "@/core/decorators/injectable";
import { dynamoClient } from "@/infrastructure/clients/dynamo-client";
import { ProfileItem } from "@/infrastructure/database/dynamo/items/profile-item";
import { AppConfig } from "@/shared/config/app-config";

@Injectable()
export class ProfileRepository {
  constructor(private readonly config: AppConfig) {}

  public async findByAccountId(accountId: string): Promise<Profile | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamo.mainTable,
      Key: {
        PK: ProfileItem.getPK(accountId),
        SK: ProfileItem.getSK(accountId),
      },
    });

    const { Item: profileItem } = await dynamoClient.send(command);

    if (!profileItem) {
      return null;
    }

    return ProfileItem.toEntity(profileItem as ProfileItem.Document);
  }

  public getPutCommandInput(profile: Profile): PutCommandInput {
    const profileItem = ProfileItem.fromEntity(profile);

    return {
      TableName: this.config.db.dynamo.mainTable,
      Item: profileItem.toItem(),
    };
  }

  public async create(profile: Profile): Promise<void> {
    await dynamoClient.send(new PutCommand(this.getPutCommandInput(profile)));
  }

  async save(profile: Profile): Promise<void> {
    const profileItem = ProfileItem.fromEntity(profile).toItem();

    const command = new UpdateCommand({
      TableName: this.config.db.dynamo.mainTable,
      Key: {
        PK: profileItem.PK,
        SK: profileItem.SK,
      },
      UpdateExpression:
        "SET #name = :name, #birthdate = :birthdate, #biologicalSex = :biologicalSex, #height = :height, #weight = :weight",
      ExpressionAttributeNames: {
        "#name": "name",
        "#birthdate": "birthdate",
        "#biologicalSex": "biologicalSex",
        "#height": "height",
        "#weight": "weight",
      },
      ExpressionAttributeValues: {
        ":name": profileItem.name,
        ":birthdate": profileItem.birthdate,
        ":biologicalSex": profileItem.biologicalSex,
        ":height": profileItem.height,
        ":weight": profileItem.weight,
      },
      ReturnValues: "NONE",
    });

    await dynamoClient.send(command);
  }
}
