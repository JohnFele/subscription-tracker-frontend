import type { Period } from "../types/period";

export function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function daysUntil(value: string) {
  return Math.ceil(
    (new Date(value).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
      86400000
  );
}

export function periodBounds(period: Period) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  if (period === "This month") start.setDate(1);
  else if (period === "Last 30 days") start.setDate(start.getDate() - 29);
  else if (period.endsWith("months")) {
    start.setDate(1);
    start.setMonth(start.getMonth() - (Number(period.split(" ")[1]) - 1));
  } else if (period.endsWith("years")) {
    start.setFullYear(start.getFullYear() - Number(period.split(" ")[1]) + 1);
    start.setMonth(0, 1);
  }
  return { from: dateInputValue(start), to: dateInputValue(end) };
}
