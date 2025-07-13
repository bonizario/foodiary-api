import { render } from "@react-email/render";
import type { CustomMessageTriggerEvent } from "aws-lambda";

import ForgotPassword from "@/infrastructure/emails/templates/forgot-password";

export async function handler(
  event: CustomMessageTriggerEvent,
): Promise<CustomMessageTriggerEvent> {
  if (event.triggerSource === "CustomMessage_ForgotPassword") {
    const code = event.request.codeParameter;

    const html = await render(ForgotPassword({ confirmationCode: code }));

    event.response.emailSubject = "🍏 foodiary | Recover your account!";
    event.response.emailMessage = html;
  }

  return event;
}
