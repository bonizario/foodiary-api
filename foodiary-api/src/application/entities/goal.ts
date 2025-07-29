export class Goal {
  readonly accountId: string;

  calories: number;

  carbohydrates: number;

  fats: number;

  proteins: number;

  readonly createdAt: Date;

  constructor(attributes: Goal.Attributes) {
    this.accountId = attributes.accountId;
    this.calories = attributes.calories;
    this.carbohydrates = attributes.carbohydrates;
    this.fats = attributes.fats;
    this.proteins = attributes.proteins;
    this.createdAt = attributes.createdAt ?? new Date();
  }
}

export namespace Goal {
  export type Attributes = {
    accountId: string;
    calories: number;
    carbohydrates: number;
    fats: number;
    proteins: number;
    createdAt?: Date | undefined;
  };
}
