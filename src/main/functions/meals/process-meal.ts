import "reflect-metadata";

import { MealsQueueConsumer } from "@/application/queues/meals-queue-consumer";
import { Registry } from "@/core/di/registry";
import { lambdaSqsAdapter } from "@/main/adapters/lambda-sqs-adapter";

const consumer = Registry.getInstance().resolve(MealsQueueConsumer);

export const handler = lambdaSqsAdapter(consumer);
