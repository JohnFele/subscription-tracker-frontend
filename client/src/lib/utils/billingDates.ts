import type { Frequency } from "../types/subscriptions";

export function nextBillingDate(
  startDate: string,
  frequency: Frequency | undefined
) {
  const date = new Date(`${startDate}T00:00:00.000Z`);
  if (frequency === "daily") date.setUTCDate(date.getUTCDate() + 1);
  if (frequency === "weekly") date.setUTCDate(date.getUTCDate() + 7);
  if (frequency === "monthly") {
    const day = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + 1);
    date.setUTCDate(
      Math.min(
        day,
        new Date(
          Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
        ).getUTCDate()
      )
    );
  }
  if (frequency === "yearly") date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
}
