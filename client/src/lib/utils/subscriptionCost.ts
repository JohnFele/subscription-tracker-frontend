import type { Subscription } from "../types/subscriptions";

export function monthlyCost(subscription: Subscription) {
  if (subscription.recurring === false) return 0;
  const monthlyRate = {
    daily: 365 / 12,
    weekly: 52 / 12,
    monthly: 1,
    yearly: 1 / 12,
  }[subscription.frequency];
  return Number(subscription.price) * monthlyRate;
}
