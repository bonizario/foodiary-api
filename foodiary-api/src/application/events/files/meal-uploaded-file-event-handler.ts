import type { FileEventHandler } from "@/application/contracts/file-event-handler";
import { Injectable } from "@/core/decorators/injectable";

@Injectable()
export class MealUploadedFileEventHandler implements FileEventHandler {
  public async handle({ fileKey }: FileEventHandler.Input): Promise<void> {
    console.log({
      MealUploadedFileEventHandler: {
        fileKey,
      },
    });
  }
}
