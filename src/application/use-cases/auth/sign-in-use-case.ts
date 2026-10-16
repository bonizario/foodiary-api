import { InvalidCredentialsError } from "@/application/errors/application/invalid-credentials-error";
import { AuthGateway } from "@/infrastructure/gateways/auth-gateway";
import { Injectable } from "@/kernel/decorators/injectable";

@Injectable()
export class SignInUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  public async execute({ email, password }: SignInUseCase.Input): Promise<SignInUseCase.Output> {
    try {
      const { accessToken, refreshToken } = await this.authGateway.signIn({ email, password });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new InvalidCredentialsError({ cause: error });
    }
  }
}

export namespace SignInUseCase {
  export type Input = {
    email: string;
    password: string;
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}
