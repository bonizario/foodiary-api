import { Controller } from "@/application/contracts/controller";
import { Injectable } from "@/core/decorators/injectable";
import KSUID from "ksuid";

type ResponseBody = {
  mealId: string;
};

@Injectable()
export class CreateMealController extends Controller<ResponseBody> {
  constructor() {
    super();
  }

  protected override async handle(): Promise<Controller.Response<ResponseBody>> {
    return {
      statusCode: 201,
      body: {
        mealId: KSUID.randomSync().string,
      },
    };
  }
}
