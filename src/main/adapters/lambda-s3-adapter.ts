import type { S3Event, S3Handler } from "aws-lambda";

import type { FileEventHandler } from "@/application/contracts/file-event-handler";
import { Registry } from "@/core/di/registry";
import type { Constructor } from "@/shared/types/constructor";

export function lambdaS3Adapter(eventHandlerImpl: Constructor<FileEventHandler>): S3Handler {
  return async (event: S3Event): Promise<void> => {
    const eventHandler = Registry.getInstance().resolve(eventHandlerImpl);

    const results = await Promise.allSettled(
      event.Records.map((record) =>
        eventHandler.handle({
          fileKey: record.s3.object.key,
        }),
      ),
    );

    const failedEvents = results.filter((result) => result.status === "rejected");

    for (const result of failedEvents) {
      console.error("Failed to process S3 event:", result.reason);
    }
  };
}
