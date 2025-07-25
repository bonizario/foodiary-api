import { createHmac } from "node:crypto";
import { format } from "node:util";

import {
  AdminDeleteUserCommand,
  CodeMismatchException,
  ConfirmForgotPasswordCommand,
  ExpiredCodeException,
  ForgotPasswordCommand,
  GetTokensFromRefreshTokenCommand,
  InitiateAuthCommand,
  SignUpCommand,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";

import { InvalidForgotPasswordConfirmationCodeError } from "@/application/errors/application/invalid-forgot-password-confirmation-code-error";
import { Injectable } from "@/core/decorators/injectable";
import { cognitoClient } from "@/infrastructure/clients/cognito-client";
import { AppConfig } from "@/shared/config/app-config";

// TODO: HANDLE OTHER KNOWN EXCEPTIONS FROM AWS SDK: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ConfirmForgotPasswordCommand/
@Injectable()
export class AuthGateway {
  constructor(private readonly config: AppConfig) {}

  public async signIn({
    email,
    password,
  }: AuthGateway.SignInParams): Promise<AuthGateway.SignInResult> {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        PASSWORD: password,
        SECRET_HASH: this.getSecretHash(email),
        USERNAME: email,
      },
      ClientId: this.config.auth.cognito.clientId,
    });

    const { AuthenticationResult } = await cognitoClient.send(command);

    if (!AuthenticationResult?.AccessToken || !AuthenticationResult?.RefreshToken) {
      throw new Error(format("Failed to sign in user with email %s", email));
    }

    return {
      accessToken: AuthenticationResult.AccessToken,
      refreshToken: AuthenticationResult.RefreshToken,
    };
  }

  public async signUp({
    email,
    password,
    internalId,
  }: AuthGateway.SignUpParams): Promise<AuthGateway.SignUpResult> {
    const command = new SignUpCommand({
      ClientId: this.config.auth.cognito.clientId,
      Password: password,
      SecretHash: this.getSecretHash(email),
      UserAttributes: [
        {
          Name: "custom:internalId",
          Value: internalId,
        },
      ],
      Username: email,
    });

    const { UserSub: externalId } = await cognitoClient.send(command);

    if (!externalId) {
      throw new Error(format("Failed to sign up user with email %s", email));
    }

    return {
      externalId,
    };
  }

  public async refreshToken({
    refreshToken,
  }: AuthGateway.RefreshTokenParams): Promise<AuthGateway.RefreshTokenResult> {
    const command = new GetTokensFromRefreshTokenCommand({
      ClientId: this.config.auth.cognito.clientId,
      ClientSecret: this.config.auth.cognito.clientSecret,
      RefreshToken: refreshToken,
    });

    const { AuthenticationResult } = await cognitoClient.send(command);

    if (!AuthenticationResult?.AccessToken || !AuthenticationResult?.RefreshToken) {
      throw new Error("Cannot refresh token");
    }

    return {
      accessToken: AuthenticationResult.AccessToken,
      refreshToken: AuthenticationResult.RefreshToken,
    };
  }

  public async forgotPassword({
    email,
  }: AuthGateway.ForgotPasswordParams): Promise<AuthGateway.ForgotPasswordResult> {
    const command = new ForgotPasswordCommand({
      ClientId: this.config.auth.cognito.clientId,
      SecretHash: this.getSecretHash(email),
      Username: email,
    });

    try {
      await cognitoClient.send(command);
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        // swallow the error to prevent user enumeration
        return;
      }
      throw error;
    }
  }

  public async confirmForgotPassword({
    confirmationCode,
    email,
    newPassword,
  }: AuthGateway.ConfirmForgotPasswordParams): Promise<AuthGateway.ConfirmForgotPasswordResult> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.config.auth.cognito.clientId,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
        SecretHash: this.getSecretHash(email),
        Username: email,
      });

      await cognitoClient.send(command);
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        // swallow the error to prevent user enumeration
        return;
      }
      if (error instanceof CodeMismatchException || error instanceof ExpiredCodeException) {
        throw new InvalidForgotPasswordConfirmationCodeError({ cause: error });
      }
      throw error;
    }
  }

  public async deleteUser({
    externalId,
  }: AuthGateway.DeleteUserParams): Promise<AuthGateway.DeleteUserResult> {
    const command = new AdminDeleteUserCommand({
      UserPoolId: this.config.auth.cognito.poolId,
      Username: externalId,
    });

    await cognitoClient.send(command);
  }

  private getSecretHash(email: string): string {
    const { clientId, clientSecret } = this.config.auth.cognito;

    return createHmac("SHA256", clientSecret).update(`${email}${clientId}`).digest("base64");
  }
}

export namespace AuthGateway {
  export type SignUpParams = {
    email: string;
    internalId: string;
    password: string;
  };

  export type SignUpResult = {
    externalId: string;
  };

  export type SignInParams = {
    email: string;
    password: string;
  };

  export type SignInResult = {
    accessToken: string;
    refreshToken: string;
  };

  export type RefreshTokenParams = {
    refreshToken: string;
  };

  export type RefreshTokenResult = {
    accessToken: string;
    refreshToken: string;
  };

  export type ForgotPasswordParams = {
    email: string;
  };

  export type ForgotPasswordResult = void;

  export type ConfirmForgotPasswordParams = {
    confirmationCode: string;
    email: string;
    newPassword: string;
  };

  export type ConfirmForgotPasswordResult = void;

  export type DeleteUserParams = {
    externalId: string;
  };

  export type DeleteUserResult = void;
}
