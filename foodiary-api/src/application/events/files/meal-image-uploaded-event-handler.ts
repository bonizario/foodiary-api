import type { FileEventHandler } from "@/application/contracts/file-event-handler";
import { MealImageUploadedUseCase } from "@/application/use-cases/meals/meal-image-uploaded-use-case";
import { Injectable } from "@/core/decorators/injectable";

@Injectable()
export class MealImageUploadedEventHandler implements FileEventHandler {
  constructor(private readonly mealImageUploadedUseCase: MealImageUploadedUseCase) {}

  public async handle({ fileKey }: FileEventHandler.Input): Promise<void> {
    await this.mealImageUploadedUseCase.execute({ fileKey });
  }
}
