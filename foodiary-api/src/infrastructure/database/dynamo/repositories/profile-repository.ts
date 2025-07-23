import { PutCommand } from "@aws-sdk/lib-dynamodb";

import type { Profile } from "@/application/entities/profile";
import { Injectable } from "@/core/decorators/injectable";
import { dynamoClient } from "@/infrastructure/clients/dynamo-client";
import { ProfileItem } from "@/infrastructure/database/dynamo/items/profile-item";
import { AppConfig } from "@/shared/config/app-config";

@Injectable()
export class ProfileRepository {
  constructor(private readonly config: AppConfig) {}

  public async create(profile: Profile): Promise<void> {
    const profileItem = ProfileItem.fromEntity(profile);

    const command = new PutCommand({
      TableName: this.config.db.dynamo.mainTable,
      Item: profileItem.toItem(),
    });

    await dynamoClient.send(command);
  }
}
