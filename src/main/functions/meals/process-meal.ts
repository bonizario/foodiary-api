import { SQSEvent } from "aws-lambda";

export async function handler(event: SQSEvent): Promise<void> {
  console.log(JSON.stringify(event, null, 2));
}
