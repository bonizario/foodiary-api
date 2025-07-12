import { z } from "zod";

import { Controller } from "@/application/contracts/controller";
import { emailSchema } from "@/application/controllers/auth/schemas/email-schema";
import { signUpPasswordSchema } from "@/application/controllers/auth/schemas/sign-up-password-schema";
import { SignUpUseCase } from "@/application/use-cases/auth/sign-up-use-case";
import { Injectable } from "@/core/decorators/injectable";
import { Schema } from "@/core/decorators/schema";

const schema = z.object({
  account: z.object({
    email: emailSchema,
    password: signUpPasswordSchema,
  }),
});

type RequestBody = z.output<typeof schema>;

type ResponseBody = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
@Schema(schema)
export class SignUpController extends Controller<"public", ResponseBody> {
  constructor(private readonly signUpUseCase: SignUpUseCase) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"public", RequestBody>,
  ): Promise<Controller.Response<ResponseBody>> {
    const { accessToken, refreshToken } = await this.signUpUseCase.execute(request.body.account);

    return {
      statusCode: 201,
      body: {
        accessToken,
        refreshToken,
      },
    };
  }
}
