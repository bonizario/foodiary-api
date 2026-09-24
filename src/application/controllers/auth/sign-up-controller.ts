import { z } from "zod";

import { Controller } from "@/application/contracts/controller";
import { passwordSchema } from "@/application/controllers/auth/schemas/password-schema";
import { Profile } from "@/application/entities/profile";
import { SignUpUseCase } from "@/application/use-cases/auth/sign-up-use-case";
import { Injectable } from "@/core/decorators/injectable";
import { Schema } from "@/core/decorators/schema";

const schema = z.object({
  account: z.object({
    email: z.email(),
    password: passwordSchema,
  }),
  profile: z.object({
    name: z.string().min(1).max(100),
    birthdate: z.iso
      .date("Birthdate must be a valid date (YYYY-MM-DD format)")
      .transform((date) => new Date(date)),
    biologicalSex: z.enum(Profile.BiologicalSex),
    height: z.number().min(1).max(500),
    weight: z.number().min(1).max(500),
    activityLevel: z.enum(Profile.ActivityLevel),
    goal: z.enum(Profile.Goal),
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
    const { accessToken, refreshToken } = await this.signUpUseCase.execute({
      account: request.body.account,
      profile: request.body.profile,
    });

    return {
      statusCode: 201,
      body: {
        accessToken,
        refreshToken,
      },
    };
  }
}
