import { z } from "zod";

import { Controller } from "@/application/contracts/controller";
import { Profile } from "@/application/entities/profile";
import { UpdateProfileUseCase } from "@/application/use-cases/profiles/update-profile-use-case";
import { Injectable } from "@/core/decorators/injectable";
import { Schema } from "@/core/decorators/schema";

const schema = z.object({
  name: z.string().min(1).max(100),
  birthdate: z
    .string()
    .date("Birthdate must be a valid date (YYYY-MM-DD format)")
    .transform((date) => new Date(date)),
  biologicalSex: z.nativeEnum(Profile.BiologicalSex),
  height: z.number().min(1).max(300),
  weight: z.number().min(1).max(600),
});

type RequestBody = z.output<typeof schema>;

@Injectable()
@Schema(schema)
export class UpdateProfileController extends Controller<"authenticated"> {
  constructor(private readonly updateProfileUseCase: UpdateProfileUseCase) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"authenticated", RequestBody>,
  ): Promise<Controller.Response> {
    await this.updateProfileUseCase.execute({
      accountId: request.accountId,
      name: request.body.name,
      birthdate: request.body.birthdate,
      biologicalSex: request.body.biologicalSex,
      height: request.body.height,
      weight: request.body.weight,
    });

    return {
      statusCode: 204,
    };
  }
}
