import { useMemo } from "react";
import { daysUntil } from "../lib/utils/dates";
import {
  monthlyCost,
  type Currency,
  type Subscription,
} from "../lib/subscriptions";
import type {
  OverviewCategoryRow,
  OverviewCategorySort,
} from "../lib/types/overview";

export function useSubscriptionMetrics(
  subscriptions: Subscription[],
  currency: Currency,
  categorySort: OverviewCategorySort,
  showAllCategories: boolean
) {
  const activeSubscriptions = useMemo(
    () =>
      subscriptions.filter(subscription => subscription.status === "active"),
    [subscriptions]
  );
  const convertedRecurringSubscriptions = useMemo(
    () =>
      activeSubscriptions
        .filter(subscription => subscription.recurring !== false)
        .flatMap(subscription => {
          if (
            subscription.convertedPrice == null &&
            subscription.currency !== currency
          )
            return [];
          return [
            {
              ...subscription,
              price: subscription.convertedPrice ?? subscription.price,
              currency,
            },
          ];
        }),
    [activeSubscriptions, currency]
  );
  const monthlyCommitment = useMemo(
    () =>
      convertedRecurringSubscriptions.reduce(
        (total, subscription) => total + monthlyCost(subscription),
        0
      ),
    [convertedRecurringSubscriptions]
  );
  const conversionIncomplete = activeSubscriptions.some(
    subscription =>
      subscription.currency !== currency && subscription.convertedPrice == null
  );
  const staleExchangeRates = activeSubscriptions.some(
    subscription => subscription.ratesStale
  );
  const otherCurrencyCount = new Set(
    subscriptions
      .map(subscription => subscription.currency)
      .filter(code => code !== currency)
  ).size;
  const upcomingRenewals = useMemo(
    () =>
      subscriptions
        .filter(
          subscription =>
            subscription.status === "active" &&
            subscription.recurring !== false &&
            daysUntil(subscription.renewalDate) >= 0
        )
        .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate)),
    [subscriptions]
  );
  const overviewRows = useMemo(() => {
    const totals = new Map<string, number>();
    const renewalDates = new Map<string, string>();
    for (const subscription of convertedRecurringSubscriptions) {
      const category = subscription.category;
      totals.set(
        category,
        (totals.get(category) ?? 0) + monthlyCost(subscription)
      );
      const currentDate = renewalDates.get(category);
      if (!currentDate || subscription.renewalDate < currentDate)
        renewalDates.set(category, subscription.renewalDate);
    }

    const categories = [...totals.entries()].sort(
      ([categoryA, amountA], [categoryB, amountB]) => {
        if (categorySort === "amount-asc")
          return amountA - amountB || categoryA.localeCompare(categoryB);
        if (categorySort === "date-asc")
          return (
            (renewalDates.get(categoryA) ?? "9999").localeCompare(
              renewalDates.get(categoryB) ?? "9999"
            ) || categoryA.localeCompare(categoryB)
          );
        if (categorySort === "date-desc")
          return (
            (renewalDates.get(categoryB) ?? "").localeCompare(
              renewalDates.get(categoryA) ?? ""
            ) || categoryA.localeCompare(categoryB)
          );
        return amountB - amountA || categoryA.localeCompare(categoryB);
      }
    );

    const shown = showAllCategories ? categories : categories.slice(0, 4);
    const rows: OverviewCategoryRow[] = shown.map(([category, amount]) => ({
      category,
      amount,
    }));
    const hiddenAmount = showAllCategories
      ? 0
      : categories.slice(4).reduce((total, [, amount]) => total + amount, 0);
    if (hiddenAmount > 0)
      rows.push({ category: "__other", amount: hiddenAmount });
    return rows;
  }, [convertedRecurringSubscriptions, categorySort, showAllCategories]);

  return {
    activeSubscriptions,
    convertedRecurringSubscriptions,
    monthlyCommitment,
    conversionIncomplete,
    staleExchangeRates,
    otherCurrencyCount,
    upcomingRenewals,
    overviewRows,
  };
}
