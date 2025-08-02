import KSUID from "ksuid";

import { Meal } from "@/application/entities/meal";
import { Injectable } from "@/core/decorators/injectable";

@Injectable()
export class MealsFileStorageGateway {
  public static generateInputFileKey({
    accountId,
    inputType,
  }: MealsFileStorageGateway.GenerateInputFileKeyParams): string {
    const extension = inputType === Meal.InputType.AUDIO ? "m4a" : "jpeg";
    const filename = `${KSUID.randomSync().string}.${extension}`;
    return `${accountId}/${filename}`;
  }

  public async createPOST(): Promise<void> {}
}

export namespace MealsFileStorageGateway {
  export type GenerateInputFileKeyParams = {
    accountId: string;
    inputType: string;
  };
}
