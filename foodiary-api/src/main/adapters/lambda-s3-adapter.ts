import type { FileEventHandler } from "@/application/contracts/file-event-handler";
import type { S3Event, S3Handler } from "aws-lambda";

export function lambdaS3Adapter(eventHandler: FileEventHandler): S3Handler {
  return async (event: S3Event): Promise<void> => {
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
