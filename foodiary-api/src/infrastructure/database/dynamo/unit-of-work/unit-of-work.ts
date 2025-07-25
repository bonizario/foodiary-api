import {
  PutCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";

import { dynamoClient } from "@/infrastructure/clients/dynamo-client";
import { RequireAtLeastOne } from "@/shared/types/require-at-least-one";

type TransactItem = RequireAtLeastOne<
  NonNullable<TransactWriteCommandInput["TransactItems"]>[number]
>;

export abstract class UnitOfWork {
  private transactItems: TransactItem[] = [];

  protected addPut(putInput: PutCommandInput) {
    this.transactItems.push({ Put: putInput });
  }

  protected async commit() {
    const command = new TransactWriteCommand({
      TransactItems: this.transactItems,
    });

    await dynamoClient.send(command);
  }
}
