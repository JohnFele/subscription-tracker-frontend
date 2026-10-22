export function money(
  value: number,
  currency: string = "ZAR",
  compact = false
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

export function dateLabel(value: string, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "—"
    : new Intl.DateTimeFormat(
        "en-US",
        options ?? { month: "short", day: "numeric", year: "numeric" }
      ).format(date);
}

export const pretty = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);
