import { Controller } from "@/application/contracts/controller";
import { Injectable } from "@/core/decorators/injectable";

type ResponseBody = {
  accountId: string | null;
};

@Injectable()
export class CreateMealController extends Controller<"authenticated", ResponseBody> {
  constructor() {
    super();
  }

  protected override async handle({
    accountId,
  }: Controller.Request<"authenticated">): Promise<Controller.Response<ResponseBody>> {
    return {
      statusCode: 201,
      body: {
        accountId,
      },
    };
  }
}
