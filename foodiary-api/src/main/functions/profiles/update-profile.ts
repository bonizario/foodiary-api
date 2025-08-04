import "reflect-metadata";

import { UpdateProfileController } from "@/application/controllers/profiles/update-profile-controller";
import { Registry } from "@/core/di/registry";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

const controller = Registry.getInstance().resolve(UpdateProfileController);

export const handler = lambdaHttpAdapter(controller);
