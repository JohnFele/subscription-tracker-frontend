import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, api } from "../lib/api";
import { periodBounds } from "../lib/utils/dates";
import type { Period } from "../lib/types/period";
import type {
  Currency,
  ExpenseRecord,
  ExpenditureMonth,
  ExpenditureSummary,
  User,
} from "../lib/subscriptions";
import { toast } from "sonner";

interface UseExpenditureDataOptions {
  user: User | null;
  period: Period;
  currency: Currency;
  onUnauthorized: () => void;
}

export function useExpenditureData({
  user,
  period,
  currency,
  onUnauthorized,
}: UseExpenditureDataOptions) {
  const [summary, setSummary] = useState<ExpenditureSummary | null>(null);
  const [periodRecords, setPeriodRecords] = useState<ExpenseRecord[]>([]);

  const refreshSummary = useCallback(
    async (account: User | null = user) => {
      if (!account) {
        setSummary(null);
        return;
      }
      try {
        setSummary(
          await api.expenditureSummary(account.defaultCurrency ?? "ZAR")
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) onUnauthorized();
        else
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not load expenditure history"
          );
      }
    },
    [user, onUnauthorized]
  );

  useEffect(() => {
    void refreshSummary(user);
  }, [user, refreshSummary]);

  useEffect(() => {
    if (!user) {
      setPeriodRecords([]);
      return;
    }
    const { from, to } = periodBounds(period);
    let cancelled = false;
    setPeriodRecords([]);
    api
      .expenses(currency, from, to)
      .then(records => {
        if (!cancelled) setPeriodRecords(records);
      })
      .catch(error => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) onUnauthorized();
        else
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not load spending for this period"
          );
      });
    return () => {
      cancelled = true;
    };
  }, [user, period, currency, onUnauthorized]);

  const monthly: ExpenditureMonth[] = useMemo(() => {
    const start = periodBounds(period).from;
    const daily = period === "Last 30 days";
    const yearly = period.endsWith("years");
    const buckets = new Map<
      string,
      Omit<
        ExpenditureMonth,
        "key" | "label" | "axisLabel" | "fullLabel" | "date" | "predicted"
      >
    >();

    for (const record of periodRecords) {
      const date = new Date(record.date);
      const key = daily
        ? date.toISOString().slice(0, 10)
        : yearly
          ? date.toISOString().slice(0, 4)
          : date.toISOString().slice(0, 7);
      const value = buckets.get(key) ?? {
        amount: 0,
        payments: 0,
        subscriptionAmount: 0,
        oneTimeAmount: 0,
      };
      const amount =
        record.convertedAmount ??
        (record.currency === currency ? record.amount : 0);
      value.amount += amount;
      value.payments++;
      if (record.type === "subscription") value.subscriptionAmount += amount;
      else value.oneTimeAmount += amount;
      buckets.set(key, value);
    }

    const firstDate = new Date(`${start}T00:00:00.000Z`);
    const count = daily
      ? 30
      : yearly
        ? Number(period.split(" ")[1])
        : Math.max(
            1,
            (new Date().getFullYear() - firstDate.getFullYear()) * 12 +
              new Date().getMonth() -
              firstDate.getMonth() +
              1
          );

    const points = Array.from({ length: count }, (_, index) => {
      const date = new Date(firstDate);
      if (daily) date.setUTCDate(date.getUTCDate() + index);
      else if (yearly) date.setUTCFullYear(date.getUTCFullYear() + index);
      else date.setUTCMonth(date.getUTCMonth() + index);
      const key = daily
        ? date.toISOString().slice(0, 10)
        : yearly
          ? date.toISOString().slice(0, 4)
          : date.toISOString().slice(0, 7);
      const values = buckets.get(key) ?? {
        amount: 0,
        payments: 0,
        subscriptionAmount: 0,
        oneTimeAmount: 0,
      };
      const label = yearly
        ? key
        : daily
          ? date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })
          : date.toLocaleDateString("en-US", {
              month: "short",
              timeZone: "UTC",
            });
      const fullLabel = yearly
        ? key
        : daily
          ? date.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })
          : date.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            });
      return {
        ...values,
        key,
        label,
        axisLabel: label,
        fullLabel,
        date: date.toISOString(),
        predicted: false,
      };
    });

    const forecast = summary?.monthly.find(point => point.predicted);
    return forecast && !yearly ? [...points, forecast] : points;
  }, [period, periodRecords, currency, summary]);

  const periodSpend = useMemo(
    () =>
      periodRecords.reduce(
        (total, record) =>
          total +
          (record.convertedAmount ??
            (record.currency === currency ? record.amount : 0)),
        0
      ),
    [periodRecords, currency]
  );

  return { summary, periodRecords, monthly, periodSpend, refreshSummary };
}
