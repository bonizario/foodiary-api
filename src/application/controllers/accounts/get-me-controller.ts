import { Controller } from "@/application/contracts/controller";
import type { Profile } from "@/application/entities/profile";
import { GetProfileAndGoalQuery } from "@/application/query/get-profile-and-goal-query";
import { Injectable } from "@/core/decorators/injectable";

type ResponseBody = {
  profile: {
    name: string;
    birthdate: string;
    biologicalSex: Profile.BiologicalSex;
    height: number;
    weight: number;
  };
  goal: {
    calories: number;
    carbohydrates: number;
    fats: number;
    proteins: number;
  };
};

@Injectable()
export class GetMeController extends Controller<"authenticated", ResponseBody> {
  constructor(private readonly getProfileAndGoalQuery: GetProfileAndGoalQuery) {
    super();
  }

  protected override async handle(
    request: Controller.Request<"authenticated">,
  ): Promise<Controller.Response<ResponseBody>> {
    const { goal, profile } = await this.getProfileAndGoalQuery.execute({
      accountId: request.accountId,
    });

    return {
      statusCode: 200,
      body: {
        goal,
        profile,
      },
    };
  }
}
