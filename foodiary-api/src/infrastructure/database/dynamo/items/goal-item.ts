import { Goal } from "@/application/entities/goal";
import type { AccountItem } from "@/infrastructure/database/dynamo/items/account-item";

export class GoalItem {
  private readonly type = "Goal";
  private readonly keys: GoalItem.Keys;

  constructor(private readonly attributes: GoalItem.Attributes) {
    this.keys = {
      PK: GoalItem.getPK(this.attributes.accountId),
      SK: GoalItem.getSK(this.attributes.accountId),
    };
  }

  public toItem(): GoalItem.Document {
    return {
      ...this.keys,
      ...this.attributes,
      type: this.type,
    };
  }

  public static fromEntity(goal: Goal): GoalItem {
    return new GoalItem({
      accountId: goal.accountId,
      calories: goal.calories,
      proteins: goal.proteins,
      carbohydrates: goal.carbohydrates,
      fats: goal.fats,
      createdAt: goal.createdAt.toISOString(),
    });
  }

  public static toEntity(goalItem: GoalItem.Document): Goal {
    return new Goal({
      accountId: goalItem.accountId,
      calories: goalItem.calories,
      proteins: goalItem.proteins,
      carbohydrates: goalItem.carbohydrates,
      fats: goalItem.fats,
      createdAt: new Date(goalItem.createdAt),
    });
  }

  public static getPK(goalId: string): GoalItem.Keys["PK"] {
    return `ACCOUNT#${goalId}`;
  }

  public static getSK(goalId: string): GoalItem.Keys["SK"] {
    return `ACCOUNT#${goalId}#GOAL`;
  }
}

export namespace GoalItem {
  export type Keys = {
    PK: AccountItem.Keys["PK"];
    SK: `ACCOUNT#${string}#GOAL`;
  };

  export type Attributes = {
    accountId: string;
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    createdAt: string;
  };

  export type Document = Keys &
    Attributes & {
      type: "Goal";
    };
}
