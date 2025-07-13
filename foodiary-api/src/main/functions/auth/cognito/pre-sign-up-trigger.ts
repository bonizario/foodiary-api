import type { PreSignUpEmailTriggerEvent } from "aws-lambda";

export async function handler(
  event: PreSignUpEmailTriggerEvent,
): Promise<PreSignUpEmailTriggerEvent> {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  return event;
}
