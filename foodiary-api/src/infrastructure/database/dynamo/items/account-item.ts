import { Account } from "@/application/entities/account";

export class AccountItem {
  private readonly keys: AccountItem.Keys;

  static readonly type = "Account";

  constructor(private readonly attributes: AccountItem.Attributes) {
    this.keys = {
      PK: AccountItem.getPK(this.attributes.id),
      SK: AccountItem.getSK(this.attributes.id),
      GSI1PK: AccountItem.getGSI1PK(this.attributes.email),
      GSI1SK: AccountItem.getGSI1SK(this.attributes.email),
    };
  }

  public toItem(): AccountItem.Document {
    return {
      ...this.keys,
      ...this.attributes,
      type: AccountItem.type,
    };
  }

  public static fromEntity(account: Account): AccountItem {
    return new AccountItem({
      id: account.id,
      email: account.email,
      externalId: account.externalId,
      createdAt: account.createdAt.toISOString(),
    });
  }

  public static toEntity(accountItem: AccountItem.Document): Account {
    return new Account({
      id: accountItem.id,
      email: accountItem.email,
      externalId: accountItem.externalId,
      createdAt: new Date(accountItem.createdAt),
    });
  }

  public static getPK(accountId: string): AccountItem.Keys["PK"] {
    return `ACCOUNT#${accountId}`;
  }

  public static getSK(accountId: string): AccountItem.Keys["SK"] {
    return `ACCOUNT#${accountId}`;
  }

  public static getGSI1PK(email: string): AccountItem.Keys["GSI1PK"] {
    return `ACCOUNT#${email}`;
  }

  public static getGSI1SK(email: string): AccountItem.Keys["GSI1SK"] {
    return `ACCOUNT#${email}`;
  }
}

export namespace AccountItem {
  export type Keys = {
    PK: `ACCOUNT#${string}`;
    SK: `ACCOUNT#${string}`;
    GSI1PK: `ACCOUNT#${string}`;
    GSI1SK: `ACCOUNT#${string}`;
  };

  export type Attributes = {
    id: string;
    email: string;
    externalId: string | undefined;
    createdAt: string;
  };

  export type Document = Keys &
    Attributes & {
      type: "Account";
    };
}
