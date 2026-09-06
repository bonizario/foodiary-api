import "reflect-metadata";

import { UpdateProfileController } from "@/application/controllers/profiles/update-profile-controller";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

export const handler = lambdaHttpAdapter(UpdateProfileController);
