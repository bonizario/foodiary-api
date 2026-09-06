import "reflect-metadata";

import { MealImageUploadedEventHandler } from "@/application/events/files/meal-image-uploaded-event-handler";
import { lambdaS3Adapter } from "@/main/adapters/lambda-s3-adapter";

export const handler = lambdaS3Adapter(MealImageUploadedEventHandler);
