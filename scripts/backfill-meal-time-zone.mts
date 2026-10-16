/**
 * One-off backfill: add timeZone + localDay to legacy Meal items and rebuild GSI1PK.
 *
 * Why this exists
 * ---------------
 * Before time zone handling, each Meal's `GSI1PK` day bucket was derived from the
 * Lambda's UTC clock (`createdAt.getFullYear/getMonth/getDate`). Legacy rows therefore
 * bucket under their UTC calendar day and carry no `timeZone`/`localDay` attributes.
 *
 * Assumption for legacy rows
 * --------------------------
 * The app was Brazil-first and had no other time zone, so every legacy meal is assumed
 * to have been eaten in `America/Sao_Paulo`. We stamp that zone, recompute `localDay`
 * from `(createdAt, America/Sao_Paulo)`, and rebuild `GSI1PK = MEALS#<accountId>#<localDay>`.
 *
 * Safety
 * ------
 * - Idempotent: safe to re-run (recomputes the same values; only rewrites items missing
 *   `timeZone` or whose `GSI1PK` differs from the recomputed one).
 * - `--dry-run` logs intended key changes without writing.
 * - Full `PutCommand` per item. The repository `save()` is an `UpdateCommand` that only
 *   rewrites mutable fields (status/name/icon/foods) and never touches
 *   `GSI1PK`/`timeZone`/`localDay`, so it cannot be used here.
 *
 * Usage
 * -----
 *   node --env-file=.env.development ./scripts/backfill-meal-time-zone.mts [--dry-run]
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  type ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";

import { getLocalDay } from "../src/shared/utils/get-local-day.ts";
import { log, requireEnv } from "./utils.mts";

const MAIN_TABLE = requireEnv("DYNAMO_MAIN_TABLE");
const LEGACY_TIME_ZONE = "America/Sao_Paulo";
const DRY_RUN = process.argv.includes("--dry-run");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

type MealDocument = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  accountId: string;
  createdAt: string;
  timeZone?: string;
  localDay?: string;
  type: "Meal";
  [key: string]: unknown;
};

function getGSI1PK(accountId: string, localDay: string): string {
  return `MEALS#${accountId}#${localDay}`;
}

async function* scanMeals(): AsyncGenerator<MealDocument> {
  let lastEvaluatedKey: ScanCommandInput["ExclusiveStartKey"];

  do {
    const { Items = [], LastEvaluatedKey } = await client.send(
      new ScanCommand({
        TableName: MAIN_TABLE,
        FilterExpression: "#type = :type",
        ExpressionAttributeNames: { "#type": "type" },
        ExpressionAttributeValues: { ":type": "Meal" },
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    for (const item of Items) {
      yield item as MealDocument;
    }

    lastEvaluatedKey = LastEvaluatedKey;
  } while (lastEvaluatedKey);
}

async function run(): Promise<void> {
  log.title(`Backfill meal time zone${DRY_RUN ? " (dry run)" : ""}`);
  log.info(`Table: ${MAIN_TABLE}`);
  log.info(`Legacy time zone assumption: ${LEGACY_TIME_ZONE}`);

  let scanned = 0;
  let updated = 0;
  let skipped = 0;

  for await (const meal of scanMeals()) {
    scanned += 1;

    const timeZone = meal.timeZone ?? LEGACY_TIME_ZONE;
    const localDay = getLocalDay(new Date(meal.createdAt), timeZone);
    const nextGSI1PK = getGSI1PK(meal.accountId, localDay);

    const alreadyCorrect =
      meal.timeZone === timeZone && meal.localDay === localDay && meal.GSI1PK === nextGSI1PK;

    if (alreadyCorrect) {
      skipped += 1;
      continue;
    }

    log.step(`${meal.SK}: GSI1PK ${meal.GSI1PK} -> ${nextGSI1PK} (localDay ${localDay})`);

    if (DRY_RUN) {
      updated += 1;
      continue;
    }

    const nextItem: MealDocument = {
      ...meal,
      timeZone,
      localDay,
      GSI1PK: nextGSI1PK,
    };

    await client.send(new PutCommand({ TableName: MAIN_TABLE, Item: nextItem }));
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
