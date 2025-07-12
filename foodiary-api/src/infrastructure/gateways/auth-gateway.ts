import { createHmac } from "node:crypto";
import { format } from "node:util";

import {
  ForgotPasswordCommand,
  GetTokensFromRefreshTokenCommand,
  InitiateAuthCommand,
  SignUpCommand,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";

import { Injectable } from "@/core/decorators/injectable";
import { cognitoClient } from "@/infrastructure/clients/cognito-client";
import { AppConfig } from "@/shared/config/app-config";

@Injectable()
export class AuthGateway {
  constructor(private readonly config: AppConfig) {}

  public async signIn({
    email,
    password,
  }: AuthGateway.SignInParams): Promise<AuthGateway.SignInResult> {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: this.config.auth.cognito.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: this.getSecretHash(email),
      },
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
      Username: email,
      Password: password,
      SecretHash: this.getSecretHash(email),
      UserAttributes: [
        {
          Name: "custom:internalId",
          Value: internalId,
        },
      ],
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
      RefreshToken: refreshToken,
      ClientSecret: this.config.auth.cognito.clientSecret,
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
      Username: email,
      SecretHash: this.getSecretHash(email),
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

  private getSecretHash(email: string): string {
    const { clientId, clientSecret } = this.config.auth.cognito;

    return createHmac("SHA256", clientSecret).update(`${email}${clientId}`).digest("base64");
  }
}

export namespace AuthGateway {
  export type SignUpParams = {
    email: string;
    password: string;
    internalId: string;
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
}
