import { z } from "zod";

import { Controller } from "@/application/contracts/controller";
import { Meal } from "@/application/entities/meal";
import { CreateMealUseCase } from "@/application/use-cases/meals/create-meal-use-case";
import { Injectable } from "@/core/decorators/injectable";
import { Schema } from "@/core/decorators/schema";
import { mbToBytes } from "@/shared/utils/mb-to-bytes";

const schema = z.object({
  file: z.object({
    type: z.enum(["audio/m4a", "image/jpeg"]),
    size: z
      .number()
      .min(1, "File size must be greater than or equal to 1")
      .max(mbToBytes(10), "File size must be less than or equal to 10 MB (10_485_760 bytes)"),
  }),
});

type RequestBody = z.output<typeof schema>;

type ResponseBody = {
  mealId: string;
  uploadSignature: string;
};

@Injectable()
@Schema(schema)
export class CreateMealController extends Controller<"authenticated", ResponseBody> {
  constructor(private readonly createMealUseCase: CreateMealUseCase) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"authenticated", RequestBody>,
  ): Promise<Controller.Response<ResponseBody>> {
    const inputType =
      request.body.file.type === "audio/m4a" ? Meal.InputType.AUDIO : Meal.InputType.IMAGE;

    const { mealId, uploadSignature } = await this.createMealUseCase.execute({
      accountId: request.accountId,
      file: {
        inputType: inputType,
        size: request.body.file.size,
      },
    });

    return {
      statusCode: 201,
      body: {
        mealId,
        uploadSignature,
      },
    };
  }
}
