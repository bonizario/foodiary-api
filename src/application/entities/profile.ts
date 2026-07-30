export class Profile {
  readonly accountId: string;

  name: string;

  birthdate: Date;

  biologicalSex: Profile.BiologicalSex;

  height: number; // TODO: consider using cm or m

  weight: number; // TODO: consider using kg or lb

  readonly activityLevel: Profile.ActivityLevel;

  readonly goal: Profile.Goal;

  readonly createdAt: Date;

  constructor(attributes: Profile.Attributes) {
    this.accountId = attributes.accountId;
    this.name = attributes.name;
    this.birthdate = attributes.birthdate;
    this.biologicalSex = attributes.biologicalSex;
    this.height = attributes.height;
    this.weight = attributes.weight;
    this.activityLevel = attributes.activityLevel;
    this.goal = attributes.goal;
    this.createdAt = attributes.createdAt ?? new Date();
  }
}

export namespace Profile {
  export type Attributes = {
    accountId: string;
    name: string;
    birthdate: Date;
    biologicalSex: Profile.BiologicalSex;
    height: number;
    weight: number;
    activityLevel: Profile.ActivityLevel;
    goal: Profile.Goal;
    createdAt?: Date | undefined;
  };

  export enum BiologicalSex {
    MALE = "MALE",
    FEMALE = "FEMALE",
  }

  export enum Goal {
    LOSE = "LOSE",
    MAINTAIN = "MAINTAIN",
    GAIN = "GAIN",
  }

  export enum ActivityLevel {
    SEDENTARY = "SEDENTARY",
    LIGHT = "LIGHT",
    MODERATE = "MODERATE",
    HEAVY = "HEAVY",
    ATHLETE = "ATHLETE",
  }
}
