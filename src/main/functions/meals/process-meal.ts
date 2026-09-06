import "reflect-metadata";

import { MealsQueueConsumer } from "@/application/queues/meals-queue-consumer";
import { lambdaSqsAdapter } from "@/main/adapters/lambda-sqs-adapter";

export const handler = lambdaSqsAdapter(MealsQueueConsumer);
