import { Account } from "@/application/entities/account";
import { Goal } from "@/application/entities/goal";
import { Profile } from "@/application/entities/profile";
import { Injectable } from "@/core/decorators/injectable";
import { AccountRepository } from "@/infrastructure/database/dynamo/repositories/account-repository";
import { GoalRepository } from "@/infrastructure/database/dynamo/repositories/goal-repository";
import { ProfileRepository } from "@/infrastructure/database/dynamo/repositories/profile-repository";
import { UnitOfWork } from "@/infrastructure/database/dynamo/unit-of-work/unit-of-work";

@Injectable()
export class SignUpUnitOfWork extends UnitOfWork {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly goalRepository: GoalRepository,
    private readonly profileRepository: ProfileRepository,
  ) {
    super();
  }

  async run({
    account,
    goal,
    profile,
  }: SignUpUnitOfWork.RunParams): Promise<SignUpUnitOfWork.Output> {
    this.addPut(this.accountRepository.getPutCommandInput(account));
    this.addPut(this.goalRepository.getPutCommandInput(goal));
    this.addPut(this.profileRepository.getPutCommandInput(profile));

    await this.commit();
  }
}

export namespace SignUpUnitOfWork {
  export type RunParams = {
    account: Account;
    goal: Goal;
    profile: Profile;
  };
  export type Output = void;
}
