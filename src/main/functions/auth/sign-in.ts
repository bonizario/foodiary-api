import "reflect-metadata";

import { SignInController } from "@/application/controllers/auth/sign-in-controller";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

export const handler = lambdaHttpAdapter(SignInController);
