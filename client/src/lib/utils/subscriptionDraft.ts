import type { Subscription, SubscriptionDraft } from "../subscriptions";
import { dateInputValue } from "./dates";
import { nextBillingDate } from "./billingDates";

export function emptyDraft(
  currency: SubscriptionDraft["currency"] = "ZAR"
): SubscriptionDraft {
  const startDate = dateInputValue(new Date());
  return {
    name: "",
    price: 0,
    currency,
    recurring: true,
    frequency: "monthly",
    category: "entertainment",
    paymentMethod: "",
    status: "active",
    startDate,
    renewalDate: nextBillingDate(startDate, "monthly"),
  };
}

export function toSubscriptionDraft(
  subscription: Subscription
): SubscriptionDraft {
  return {
    name: subscription.name,
    price: subscription.price,
    currency: subscription.currency,
    recurring: subscription.recurring !== false,
    frequency: subscription.frequency,
    category: subscription.category,
    paymentMethod: subscription.paymentMethod,
    status: subscription.status,
    startDate: subscription.startDate.slice(0, 10),
    renewalDate: subscription.renewalDate?.slice(0, 10),
  };
}

export function updateSubscriptionDraft(
  draft: SubscriptionDraft,
  key: keyof SubscriptionDraft,
  value: string | number | boolean
): SubscriptionDraft {
  const next = { ...draft, [key]: value } as SubscriptionDraft;
  if (key === "startDate" || key === "frequency") {
    const startDate = key === "startDate" ? String(value) : draft.startDate;
    const frequency =
      key === "frequency"
        ? (value as SubscriptionDraft["frequency"])
        : draft.frequency;
    if (frequency && (!next.renewalDate || next.renewalDate <= startDate)) {
      next.renewalDate = nextBillingDate(startDate, frequency);
    }
  }
  return next;
}
