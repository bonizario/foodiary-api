import { Column, Heading, Html, Row, Section, Text } from "@react-email/components";
import React from "react";

import { TailwindConfig } from "@/infrastructure/emails/components/tailwind-config";

type ForgotPasswordProps = {
  confirmationCode: string;
};

export default function ForgotPassword({ confirmationCode }: ForgotPasswordProps) {
  return (
    <Html>
      <TailwindConfig>
        <Section className="font-sans">
          <Row>
            <Column className="pt-10 text-center">
              <Heading as="h1" className="text-2xl leading-[0]">
                Recover your account
              </Heading>
              <Heading as="h2" className="text-base font-normal text-gray-600">
                Reset your password and and get back to focus! 💪
              </Heading>
            </Column>
          </Row>
          <Row>
            <Column className="pt-10 text-center">
              <span className="inline-block rounded-md bg-gray-200 px-8 py-4 indent-[14px] text-3xl font-bold tracking-[14px]">
                {confirmationCode}
              </span>
            </Column>
          </Row>
          <Row>
            <Column className="pt-10 text-center">
              <Text className="mx-auto max-w-[240px] text-sm text-gray-600">
                If you didn't request this password reset, just ignore and delete this message.
                Don't worry, your account is safe!
              </Text>
            </Column>
          </Row>
        </Section>
      </TailwindConfig>
    </Html>
  );
}

ForgotPassword.PreviewProps = {
  confirmationCode: 341687,
};
