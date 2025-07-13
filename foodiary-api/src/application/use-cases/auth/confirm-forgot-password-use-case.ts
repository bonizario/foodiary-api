import { Injectable } from "@/core/decorators/injectable";
import { AuthGateway } from "@/infrastructure/gateways/auth-gateway";

@Injectable()
export class ConfirmForgotPasswordUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  public async execute({
    confirmationCode,
    email,
    newPassword,
  }: ConfirmForgotPasswordUseCase.Input): Promise<ConfirmForgotPasswordUseCase.Output> {
    await this.authGateway.confirmForgotPassword({ confirmationCode, email, newPassword });
  }
}

// UserNotFoundException
// CodeMismatchException
// ExpiredCodeException

export namespace ConfirmForgotPasswordUseCase {
  export type Input = {
    confirmationCode: string;
    email: string;
    newPassword: string;
  };

  export type Output = void;
}
