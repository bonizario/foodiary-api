import { Account } from "@/application/entities/account";
import { Goal } from "@/application/entities/goal";
import { Profile } from "@/application/entities/profile";
import { EmailAlreadyInUseError } from "@/application/errors/application/email-already-in-use-error";
import { Injectable } from "@/core/decorators/injectable";
import { AccountRepository } from "@/infrastructure/database/dynamo/repositories/account-repository";
import { GoalRepository } from "@/infrastructure/database/dynamo/repositories/goal-repository";
import { ProfileRepository } from "@/infrastructure/database/dynamo/repositories/profile-repository";
import { AuthGateway } from "@/infrastructure/gateways/auth-gateway";

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountRepository,
    private readonly goalRepository: GoalRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  public async execute({
    account: { email, password },
    profile: { name, birthdate, biologicalSex, height, weight, activityLevel },
  }: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    const accountWithSameEmail = await this.accountRepository.findByEmail(email);

    if (accountWithSameEmail) {
      throw new EmailAlreadyInUseError();
    }

    const account = new Account({ email });
    const profile = new Profile({
      accountId: account.id,
      name,
      birthdate,
      biologicalSex,
      height,
      weight,
      activityLevel,
    });
    const goal = new Goal({
      accountId: account.id,
      calories: 2000,
      proteins: 180,
      carbohydrates: 300,
      fats: 70,
    });

    await Promise.all([
      this.accountRepository.create(account),
      this.profileRepository.create(profile),
      this.goalRepository.create(goal),
    ]);

    const { externalId } = await this.authGateway.signUp({
      email,
      password,
      internalId: account.id,
    });

    account.externalId = externalId;

    await this.accountRepository.create(account);

    const { accessToken, refreshToken } = await this.authGateway.signIn({ email, password });

    return {
      accessToken,
      refreshToken,
    };
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
    };
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}
