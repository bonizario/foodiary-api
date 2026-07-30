import { Profile } from "@/application/entities/profile";
import type { AccountItem } from "@/infrastructure/database/dynamo/items/account-item";

export class ProfileItem {
  private readonly keys: ProfileItem.Keys;

  static readonly type = "Profile";

  constructor(private readonly attributes: ProfileItem.Attributes) {
    this.keys = {
      PK: ProfileItem.getPK(this.attributes.accountId),
      SK: ProfileItem.getSK(this.attributes.accountId),
    };
  }

  public toItem(): ProfileItem.Document {
    return {
      ...this.keys,
      ...this.attributes,
      type: ProfileItem.type,
    };
  }

  public static fromEntity(profile: Profile): ProfileItem {
    return new ProfileItem({
      accountId: profile.accountId,
      name: profile.name,
      birthdate: profile.birthdate.toISOString(),
      biologicalSex: profile.biologicalSex,
      height: profile.height,
      weight: profile.weight,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      createdAt: profile.createdAt.toISOString(),
    });
  }

  public static toEntity(profileItem: ProfileItem.Document): Profile {
    return new Profile({
      accountId: profileItem.accountId,
      name: profileItem.name,
      birthdate: new Date(profileItem.birthdate),
      biologicalSex: profileItem.biologicalSex,
      height: profileItem.height,
      weight: profileItem.weight,
      activityLevel: profileItem.activityLevel,
      goal: profileItem.goal,
      createdAt: new Date(profileItem.createdAt),
    });
  }

  public static getPK(profileId: string): ProfileItem.Keys["PK"] {
    return `ACCOUNT#${profileId}`;
  }

  public static getSK(profileId: string): ProfileItem.Keys["SK"] {
    return `ACCOUNT#${profileId}#PROFILE`;
  }
}

export namespace ProfileItem {
  export type Keys = {
    PK: AccountItem.Keys["PK"];
    SK: `ACCOUNT#${string}#PROFILE`;
  };

  export type Attributes = {
    accountId: string;
    name: string;
    birthdate: string;
    biologicalSex: Profile.BiologicalSex;
    height: number;
    weight: number;
    activityLevel: Profile.ActivityLevel;
    goal: Profile.Goal;
    createdAt: string;
  };

  export type Document = Keys &
    Attributes & {
      type: "Profile";
    };
}
