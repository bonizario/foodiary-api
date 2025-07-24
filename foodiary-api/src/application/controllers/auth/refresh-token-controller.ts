import { z } from "zod";

import { Controller } from "@/application/contracts/controller";
import { RefreshTokenUseCase } from "@/application/use-cases/auth/refresh-token-use-case";
import { Injectable } from "@/core/decorators/injectable";
import { Schema } from "@/core/decorators/schema";

const schema = z.object({
  refreshToken: z.string().min(1),
});

type RequestBody = z.output<typeof schema>;

type ResponseBody = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
@Schema(schema)
export class RefreshTokenController extends Controller<"public", ResponseBody> {
  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"public", RequestBody>,
  ): Promise<Controller.Response<ResponseBody>> {
    const { accessToken, refreshToken } = await this.refreshTokenUseCase.execute({
      refreshToken: request.body.refreshToken,
    });

    return {
      statusCode: 200,
      body: {
        accessToken,
        refreshToken,
      },
    };
  }
}
