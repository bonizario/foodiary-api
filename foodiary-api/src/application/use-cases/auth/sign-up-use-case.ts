import { Account } from "@/application/entities/account";
import { EmailAlreadyInUseError } from "@/application/errors/application/email-already-in-use-error";
import { Injectable } from "@/core/decorators/injectable";
import { AccountRepository } from "@/infrastructure/database/dynamo/repositories/account-repository";
import { AuthGateway } from "@/infrastructure/gateways/auth-gateway";

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authGateway: AuthGateway,
  ) {}

  public async execute({ email, password }: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    const accountWithSameEmail = await this.accountRepository.findByEmail(email);

    if (accountWithSameEmail) {
      throw new EmailAlreadyInUseError();
    }

    const account = new Account({ email });

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
    email: string;
    password: string;
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}
