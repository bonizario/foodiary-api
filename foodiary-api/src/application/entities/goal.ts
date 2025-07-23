export class Goal {
  readonly accountId: string;

  calories: number;

  proteins: number;

  carbohydrates: number;

  fats: number;

  readonly createdAt: Date;

  constructor(attributes: Goal.Attributes) {
    this.accountId = attributes.accountId;
    this.calories = attributes.calories;
    this.proteins = attributes.proteins;
    this.carbohydrates = attributes.carbohydrates;
    this.fats = attributes.fats;
    this.createdAt = attributes.createdAt ?? new Date();
  }
}

export namespace Goal {
  export type Attributes = {
    accountId: string;
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    createdAt?: Date;
  };
}
