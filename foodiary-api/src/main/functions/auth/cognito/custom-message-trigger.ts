import type { CustomMessageTriggerEvent } from "aws-lambda";

export async function handler(
  event: CustomMessageTriggerEvent,
): Promise<CustomMessageTriggerEvent> {
  if (event.triggerSource === "CustomMessage_ForgotPassword") {
    const code = event.request.codeParameter;
    event.response.emailSubject = "🍏 foodiary | Recover your account!";
    event.response.emailMessage = `Your verification code is: ${code}`;
  }

  return event;
}
