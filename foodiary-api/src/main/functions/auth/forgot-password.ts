import "reflect-metadata";

import { ForgotPasswordController } from "@/application/controllers/auth/forgot-password-controller";
import { Registry } from "@/core/di/registry";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

const controller = Registry.getInstance().resolve(ForgotPasswordController);

export const handler = lambdaHttpAdapter(controller);
