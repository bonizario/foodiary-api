import { Injectable } from "@/core/decorators/injectable";
import { env } from "@/shared/config/env";

@Injectable()
export class AppConfig {
  public readonly auth: AppConfig.Auth;
  public readonly db: AppConfig.Database;
  public readonly storage: AppConfig.Storage;
  public readonly cdns: AppConfig.Cdns;
  public readonly queues: AppConfig.Queues;

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
    this.cdns = {
      mealsCdn: env.MEALS_CDN_DOMAIN_NAME,
    };
    this.queues = {
      mealsQueueUrl: env.MEALS_QUEUE_URL,
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

  export type Cdns = {
    mealsCdn: string;
  };

  export type Queues = {
    mealsQueueUrl: string;
  };
}
