import { z } from "zod";

const supportedTimeZones = new Set(Intl.supportedValuesOf("timeZone"));

function isValidTimeZone(timeZone: string): boolean {
  return supportedTimeZones.has(timeZone);
}

export const timeZoneSchema = z.string().refine(isValidTimeZone, "Invalid IANA time zone");
