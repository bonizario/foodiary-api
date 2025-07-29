import KSUID from "ksuid";

export class Meal {
  readonly id: string;

  readonly accountId: string;

  status: Meal.Status;

  processingAttempts: number;

  inputType: Meal.InputType;

  inputFileKey: string; // mandatory because currently there is no manual input

  name: string;

  icon: string;

  foods: Meal.Food[];

  readonly createdAt: Date;

  constructor(attributes: Meal.Attributes) {
    this.id = attributes.id ?? KSUID.randomSync().string;
    this.accountId = attributes.accountId;
    this.status = attributes.status;
    this.inputType = attributes.inputType;
    this.inputFileKey = attributes.inputFileKey;
    this.processingAttempts = attributes.processingAttempts ?? 0;
    this.name = attributes.name ?? "";
    this.icon = attributes.icon ?? "";
    this.foods = attributes.foods ?? [];
    this.createdAt = attributes.createdAt ?? new Date();
  }
}

export namespace Meal {
  export type Attributes = {
    id?: string | undefined;
    accountId: string;
    status: Meal.Status;
    inputType: Meal.InputType;
    inputFileKey: string;
    processingAttempts?: number | undefined;
    name?: string | undefined;
    icon?: string | undefined;
    foods?: Meal.Food[] | undefined;
    createdAt?: Date | undefined;
  };

  export enum Status {
    UPLOADING = "UPLOADING",
    QUEUED = "QUEUED",
    PROCESSING = "PROCESSING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
  }

  export enum InputType {
    AUDIO = "AUDIO",
    IMAGE = "IMAGE",
  }

  export type Food = {
    name: string;
    quantity: string;
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
  };
}
