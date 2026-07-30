import type { Prettify } from "@/shared/types/prettify";

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Prettify<
  Partial<T> & { [K in Keys]-?: Required<Pick<T, K>> }[Keys]
>;
