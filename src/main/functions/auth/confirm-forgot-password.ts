import "reflect-metadata";

import { ConfirmForgotPasswordController } from "@/application/controllers/auth/confirm-forgot-password-controller";
import { Registry } from "@/core/di/registry";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

const controller = Registry.getInstance().resolve(ConfirmForgotPasswordController);

export const handler = lambdaHttpAdapter(controller);
