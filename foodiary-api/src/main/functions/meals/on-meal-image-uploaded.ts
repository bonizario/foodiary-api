import "reflect-metadata";

import { MealImageUploadedEventHandler } from "@/application/events/files/meal-image-uploaded-event-handler";
import { Registry } from "@/core/di/registry";
import { lambdaS3Adapter } from "@/main/adapters/lambda-s3-adapter";

const eventHandler = Registry.getInstance().resolve(MealImageUploadedEventHandler);

export const handler = lambdaS3Adapter(eventHandler);
