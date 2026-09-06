import "reflect-metadata";

import { ConfirmForgotPasswordController } from "@/application/controllers/auth/confirm-forgot-password-controller";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

export const handler = lambdaHttpAdapter(ConfirmForgotPasswordController);
