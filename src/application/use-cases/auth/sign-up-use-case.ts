import { Account } from "@/application/entities/account";
import { Goal } from "@/application/entities/goal";
import { Profile } from "@/application/entities/profile";
import { EmailAlreadyInUseError } from "@/application/errors/application/email-already-in-use-error";
import { GoalCalculator } from "@/application/services/goal-calculator";
import { Injectable } from "@/core/decorators/injectable";
import { AccountRepository } from "@/infrastructure/database/dynamo/repositories/account-repository";
import { SignUpUnitOfWork } from "@/infrastructure/database/dynamo/unit-of-work/sign-up-unit-of-work";
import { AuthGateway } from "@/infrastructure/gateways/auth-gateway";
import { Saga } from "@/shared/saga/saga";

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountRepository,
    private readonly signUpUnitOfWork: SignUpUnitOfWork,
    private readonly saga: Saga,
  ) {}

  public async execute(dto: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    return await this.saga.run(async () => {
      const accountWithSameEmail = await this.accountRepository.findByEmail(dto.account.email);

      if (accountWithSameEmail) {
        throw new EmailAlreadyInUseError();
      }

      const account = new Account({ email: dto.account.email });

      const profile = new Profile({
        accountId: account.id,
        name: dto.profile.name,
        birthdate: dto.profile.birthdate,
        biologicalSex: dto.profile.biologicalSex,
        height: dto.profile.height,
        weight: dto.profile.weight,
        activityLevel: dto.profile.activityLevel,
        goal: dto.profile.goal,
      });

      const { calories, carbohydrates, fats, proteins } = GoalCalculator.calculate(profile);

      const goal = new Goal({
        accountId: account.id,
        calories,
        carbohydrates,
        fats,
        proteins,
      });

      const { externalId } = await this.authGateway.signUp({
        email: dto.account.email,
        password: dto.account.password,
        internalId: account.id,
      });
      this.saga.addCompensation(() => this.authGateway.deleteUser({ externalId }));

      account.externalId = externalId;

      await this.signUpUnitOfWork.run({
        account,
        goal,
        profile,
      });

      await this.accountRepository.create(account);

      const { accessToken, refreshToken } = await this.authGateway.signIn({
        email: dto.account.email,
        password: dto.account.password,
      });

      return {
        accessToken,
        refreshToken,
      };
    });
  }
}

export namespace SignUpUseCase {
  export type Input = {
    account: {
      email: string;
      password: string;
    };
    profile: {
      name: string;
      birthdate: Date;
      biologicalSex: Profile.BiologicalSex;
      height: number;
      weight: number;
      activityLevel: Profile.ActivityLevel;
      goal: Profile.Goal;
    };
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}
