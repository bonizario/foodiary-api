import { InvalidRefreshTokenError } from "@/application/errors/application/invalid-refresh-token-error";
import { AuthGateway } from "@/infrastructure/gateways/auth-gateway";
import { Injectable } from "@/kernel/decorators/injectable";

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  public async execute({
    refreshToken,
  }: RefreshTokenUseCase.Input): Promise<RefreshTokenUseCase.Output> {
    try {
      const tokens = await this.authGateway.refreshToken({ refreshToken });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new InvalidRefreshTokenError({ cause: error });
    }
  }
}

export namespace RefreshTokenUseCase {
  export type Input = {
    refreshToken: string;
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}
