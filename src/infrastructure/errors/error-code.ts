export const InfrastructureErrorCode = {
  OPEN_AI_RESPONSE_ERROR: "OPEN_AI_RESPONSE_ERROR",
} as const;

export type InfrastructureErrorCode = keyof typeof InfrastructureErrorCode;
