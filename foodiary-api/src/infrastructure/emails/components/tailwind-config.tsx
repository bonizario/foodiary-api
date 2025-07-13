import { Tailwind } from "@react-email/components";
import React, { type ReactNode } from "react";

type TailwindConfigProps = {
  children: ReactNode;
};

export function TailwindConfig({ children }: TailwindConfigProps) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              foodiary: {
                green: "#64A30D",
              },
              gray: {
                600: "#A1A1AA",
              },
            },
          },
        },
      }}
    >
      {children}
    </Tailwind>
  );
}
