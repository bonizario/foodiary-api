import "reflect-metadata";

import { SignUpController } from "@/application/controllers/auth/sign-up-controller";
import { lambdaHttpAdapter } from "@/main/adapters/lambda-http-adapter";

export const handler = lambdaHttpAdapter(SignUpController);
