import { Meal } from "@/application/entities/meal";
import { getLocalDay } from "@/shared/utils/get-local-day";

export class MealItem {
  private readonly keys: MealItem.Keys;

  static readonly type = "Meal";

  constructor(private readonly attributes: MealItem.Attributes) {
    this.keys = {
      PK: MealItem.getPK({
        accountId: this.attributes.accountId,
        mealId: this.attributes.id,
      }),
      SK: MealItem.getSK({
        accountId: this.attributes.accountId,
        mealId: this.attributes.id,
      }),
      GSI1PK: MealItem.getGSI1PK({
        accountId: this.attributes.accountId,
        localDay: this.attributes.localDay,
      }),
      GSI1SK: MealItem.getGSI1SK(this.attributes.id),
    };
  }

  public toItem(): MealItem.Document {
    return {
      ...this.keys,
      ...this.attributes,
      type: MealItem.type,
    };
  }

  public static fromEntity(meal: Meal): MealItem {
    return new MealItem({
      id: meal.id,
      accountId: meal.accountId,
      status: meal.status,
      processingAttempts: meal.processingAttempts,
      inputType: meal.inputType,
      inputFileKey: meal.inputFileKey,
      name: meal.name,
      icon: meal.icon,
      foods: meal.foods,
      createdAt: meal.createdAt.toISOString(),
      timeZone: meal.timeZone,
      localDay: getLocalDay(meal.createdAt, meal.timeZone),
    });
  }

  public static toEntity(mealItem: MealItem.Document): Meal {
    return new Meal({
      id: mealItem.id,
      accountId: mealItem.accountId,
      status: mealItem.status,
      processingAttempts: mealItem.processingAttempts,
      inputType: mealItem.inputType,
      inputFileKey: mealItem.inputFileKey,
      name: mealItem.name,
      icon: mealItem.icon,
      foods: mealItem.foods,
      createdAt: new Date(mealItem.createdAt),
      timeZone: mealItem.timeZone,
    });
  }

  public static getPK({ accountId, mealId }: MealItem.PKParams): MealItem.Keys["PK"] {
    return `ACCOUNT#${accountId}#MEAL#${mealId}`;
  }

  public static getSK({ accountId, mealId }: MealItem.SKParams): MealItem.Keys["SK"] {
    return `ACCOUNT#${accountId}#MEAL#${mealId}`;
  }

  public static getGSI1PK({ accountId, localDay }: MealItem.GS1PKParams): MealItem.Keys["GSI1PK"] {
    return `MEALS#${accountId}#${localDay}`;
  }

  public static getGSI1SK(mealId: string): MealItem.Keys["GSI1SK"] {
    return `MEAL#${mealId}`;
  }
}

export namespace MealItem {
  export type Keys = {
    PK: `ACCOUNT#${string}#MEAL#${string}`;
    SK: `ACCOUNT#${string}#MEAL#${string}`;
    GSI1PK: `MEALS#${string}#${string}`; // MEALS#<accountId>#<localDay YYYY-MM-DD>
    GSI1SK: `MEAL#${string}`;
  };

  export type Attributes = {
    id: string;
    accountId: string;
    status: Meal.Status;
    processingAttempts: number;
    inputType: Meal.InputType;
    inputFileKey: string;
    name: string;
    icon: string;
    foods: Meal.Food[];
    createdAt: string;
    timeZone: string;
    localDay: string;
  };

  export type Document = Keys &
    Attributes & {
      type: "Meal";
    };

  export type PKParams = {
    accountId: string;
    mealId: string;
  };

  export type SKParams = {
    accountId: string;
    mealId: string;
  };

  export type GS1PKParams = {
    accountId: string;
    localDay: string;
  };
}
