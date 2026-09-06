import type { SQSEvent, SQSHandler } from "aws-lambda";

import type { QueueConsumer } from "@/application/contracts/queue-consumer";
import { Registry } from "@/core/di/registry";
import type { Constructor } from "@/shared/types/constructor";

export function lambdaSqsAdapter(queueConsumerImpl: Constructor<QueueConsumer>): SQSHandler {
  return async (event: SQSEvent): Promise<void> => {
    const queueConsumer = Registry.getInstance().resolve(queueConsumerImpl);

    await Promise.all(
      event.Records.map(async (record) => {
        const message = JSON.parse(record.body);
        await queueConsumer.process(message);
      }),
    );
  };
}
