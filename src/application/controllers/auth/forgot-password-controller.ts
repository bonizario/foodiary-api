import { z } from "zod";

import { Controller } from "@/application/contracts/controller";
import { ForgotPasswordUseCase } from "@/application/use-cases/auth/forgot-password-use-case";
import { Injectable } from "@/core/decorators/injectable";
import { Schema } from "@/core/decorators/schema";

const schema = z.object({
  email: z.string().email(),
});

type RequestBody = z.output<typeof schema>;

@Injectable()
@Schema(schema)
export class ForgotPasswordController extends Controller<"public"> {
  constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"public", RequestBody>,
  ): Promise<Controller.Response> {
    await this.forgotPasswordUseCase.execute({
      email: request.body.email,
    });

    return {
      statusCode: 204,
    };
  }
}
