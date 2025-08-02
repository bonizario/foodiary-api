import { Injectable } from "@/core/decorators/injectable";
import { env } from "@/shared/config/env";

@Injectable()
export class AppConfig {
  public readonly auth: AppConfig.Auth;
  public readonly db: AppConfig.Database;
  public readonly storage: AppConfig.Storage;

  constructor() {
    this.auth = {
      cognito: {
        clientId: env.COGNITO_CLIENT_ID,
        clientSecret: env.COGNITO_CLIENT_SECRET,
        poolId: env.COGNITO_POOL_ID,
      },
    };
    this.db = {
      dynamo: {
        mainTable: env.DYNAMO_MAIN_TABLE,
      },
    };
    this.storage = {
      mealsBucket: env.MEALS_BUCKET,
    };
  }
}

export namespace AppConfig {
  export type Auth = {
    cognito: {
      clientId: string;
      clientSecret: string;
      poolId: string;
    };
  };

  export type Database = {
    dynamo: {
      mainTable: string;
    };
  };

  export type Storage = {
    mealsBucket: string;
  };
}
