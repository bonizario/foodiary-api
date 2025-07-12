import { Injectable } from "@/core/decorators/injectable";
import { AuthGateway } from "@/infrastructure/gateways/auth-gateway";

@Injectable()
export class ForgotPasswordUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  public async execute({
    email,
  }: ForgotPasswordUseCase.Input): Promise<ForgotPasswordUseCase.Output> {
    await this.authGateway.forgotPassword({ email });
  }
}

export namespace ForgotPasswordUseCase {
  export type Input = {
    email: string;
  };

  export type Output = void;
}
