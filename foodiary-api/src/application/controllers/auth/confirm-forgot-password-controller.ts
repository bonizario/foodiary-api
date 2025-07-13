import { z } from "zod";

import { Controller } from "@/application/contracts/controller";
import { confirmationCodeSchema } from "@/application/controllers/auth/schemas/confirmation-code-schema";
import { emailSchema } from "@/application/controllers/auth/schemas/email-schema";
import { ConfirmForgotPasswordUseCase } from "@/application/use-cases/auth/confirm-forgot-password-use-case";
import { Injectable } from "@/core/decorators/injectable";
import { Schema } from "@/core/decorators/schema";
import { signUpPasswordSchema } from "./schemas/sign-up-password-schema";

const schema = z.object({
  confirmationCode: confirmationCodeSchema,
  email: emailSchema,
  newPassword: signUpPasswordSchema,
});

type RequestBody = z.output<typeof schema>;

@Injectable()
@Schema(schema)
export class ConfirmForgotPasswordController extends Controller<"public"> {
  constructor(private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"public", RequestBody>,
  ): Promise<Controller.Response> {
    await this.confirmForgotPasswordUseCase.execute({
      confirmationCode: request.body.confirmationCode,
      email: request.body.email,
      newPassword: request.body.newPassword,
    });

    return {
      statusCode: 204,
    };
  }
}
