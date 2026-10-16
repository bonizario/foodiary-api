/**
 * Returns the local calendar day (`YYYY-MM-DD`) of `instant` in `timeZone`.
 *
 * Assembled from `formatToParts` so the result is locale-robust and always
 * `YYYY-MM-DD` regardless of the host's default locale.
 */
export function getLocalDay(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}
