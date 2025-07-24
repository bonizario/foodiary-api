import { z } from "zod";

import { Controller } from "@/application/contracts/controller";
import { passwordSchema } from "@/application/controllers/auth/schemas/password-schema";
import { ConfirmForgotPasswordUseCase } from "@/application/use-cases/auth/confirm-forgot-password-use-case";
import { Injectable } from "@/core/decorators/injectable";
import { Schema } from "@/core/decorators/schema";

const schema = z.object({
  confirmationCode: z.string().min(1),
  email: z.string().email(),
  newPassword: passwordSchema,
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
