import { createHmac } from "node:crypto";
import { format } from "node:util";

import { InitiateAuthCommand, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

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

    const { AccessToken: accessToken, RefreshToken: refreshToken } = AuthenticationResult;

    return {
      accessToken,
      refreshToken,
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
}
