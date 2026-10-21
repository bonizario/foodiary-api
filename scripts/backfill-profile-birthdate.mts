/**
 * One-off backfill: trim legacy Profile `birthdate` values to `YYYY-MM-DD`.
 *
 * Why this exists
 * ---------------
 * The `Profile` entity used to model `birthdate` as a JS `Date`, so
 * `ProfileItem.fromEntity` persisted it with `.toISOString()`. Legacy rows therefore
 * store a full ISO timestamp (e.g. `2000-05-13T00:00:00.000Z`). Birthdate is now a
 * plain calendar-date string, so these rows must be trimmed to their date part.
 *
 * Safety
 * ------
 * - Idempotent: safe to re-run. Rows whose `birthdate` is already `YYYY-MM-DD` are
 *   skipped (no write).
 * - `--dry-run` logs intended changes without writing.
 * - `UpdateCommand` rewrites only the `birthdate` attribute.
 *
 * Usage
 * -----
 *   node --env-file=.env.development ./scripts/backfill-profile-birthdate.mts [--dry-run]
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  type ScanCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { log, requireEnv } from "./utils.mts";

const MAIN_TABLE = requireEnv("DYNAMO_MAIN_TABLE");
const DRY_RUN = process.argv.includes("--dry-run");

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

type ProfileDocument = {
  PK: string;
  SK: string;
  birthdate: string;
  type: "Profile";
  [key: string]: unknown;
};

async function* scanProfiles(): AsyncGenerator<ProfileDocument> {
  let lastEvaluatedKey: ScanCommandInput["ExclusiveStartKey"];

  do {
    const { Items = [], LastEvaluatedKey } = await client.send(
      new ScanCommand({
        TableName: MAIN_TABLE,
        FilterExpression: "#type = :type",
        ExpressionAttributeNames: { "#type": "type" },
        ExpressionAttributeValues: { ":type": "Profile" },
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    for (const item of Items) {
      yield item as ProfileDocument;
    }

    lastEvaluatedKey = LastEvaluatedKey;
  } while (lastEvaluatedKey);
}

async function run(): Promise<void> {
  log.title(`Backfill profile birthdate${DRY_RUN ? " (dry run)" : ""}`);
  log.info(`Table: ${MAIN_TABLE}`);

  let scanned = 0;
  let updated = 0;
  let skipped = 0;

  for await (const profile of scanProfiles()) {
    scanned += 1;

    const nextBirthdate = profile.birthdate.slice(0, 10);

    if (DATE_ONLY.test(profile.birthdate)) {
      skipped += 1;
      continue;
    }

    log.step(`${profile.SK}: birthdate ${profile.birthdate} -> ${nextBirthdate}`);

    if (DRY_RUN) {
      updated += 1;
      continue;
    }

    await client.send(
      new UpdateCommand({
        TableName: MAIN_TABLE,
        Key: { PK: profile.PK, SK: profile.SK },
        UpdateExpression: "SET #birthdate = :birthdate",
        ExpressionAttributeNames: { "#birthdate": "birthdate" },
        ExpressionAttributeValues: { ":birthdate": nextBirthdate },
      }),
    );
    updated += 1;
  }

  log.ok(
    `Done. scanned=${scanned} ${DRY_RUN ? "would update" : "updated"}=${updated} skipped=${skipped}`,
  );
}

run().catch((error) => {
  log.fail(`Backfill failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
