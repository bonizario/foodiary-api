import type { QueueConsumer } from "@/application/contracts/queue-consumer";
import type { SQSEvent, SQSHandler } from "aws-lambda";

export function lambdaSqsAdapter(consumer: QueueConsumer): SQSHandler {
  return async (event: SQSEvent): Promise<void> => {
    await Promise.all(
      event.Records.map(async (record) => {
        const message = JSON.parse(record.body);
        await consumer.process(message);
      }),
    );
  };
}
