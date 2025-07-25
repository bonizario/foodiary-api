import { PutCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";

import type { Profile } from "@/application/entities/profile";
import { Injectable } from "@/core/decorators/injectable";
import { dynamoClient } from "@/infrastructure/clients/dynamo-client";
import { ProfileItem } from "@/infrastructure/database/dynamo/items/profile-item";
import { AppConfig } from "@/shared/config/app-config";

@Injectable()
export class ProfileRepository {
  constructor(private readonly config: AppConfig) {}

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
}
