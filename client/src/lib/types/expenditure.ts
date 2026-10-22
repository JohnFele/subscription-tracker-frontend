import type { Category } from "./subscriptions";

export interface ExpenseRecord {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  convertedAmount: number | null;
  convertedCurrency: string;
  conversionRate?: number | null;
  rateUpdatedAt?: string | null;
  ratesStale?: boolean;
  category: Category;
  date: string;
  type: "subscription" | "one-time";
  subscription?: string | null;
}

export interface ExpenseDraft {
  name: string;
  amount: number;
  currency: string;
  category: Category;
  date: string;
  subscriptionId?: string;
  advanceRenewal?: boolean;
}

export interface ExpenditureMonth {
  key: string;
  label: string;
  axisLabel: string;
  fullLabel: string;
  date: string;
  amount: number;
  payments: number;
  subscriptionAmount: number;
  oneTimeAmount: number;
  predicted: boolean;
}

export interface ExpenditureSummary {
  currency: string;
  currentYear: number;
  previousYear: number;
  asOf: string;
  monthly: ExpenditureMonth[];
  totals: {
    priorYearActual: number;
    priorYearPayments: number;
    currentYearToDate: number;
    currentYearPayments: number;
    currentYearOneTime: number;
    currentYearSubscription: number;
    remainingRecurring: number;
    currentYearForecast: number;
    nextMonthForecast: number;
    nextMonthNewSubscriptionCount: number;
    activeMonthlyCommitment: number;
    monthlyAverage: number;
    averagePerPayment: number;
    daysRemainingInYear: number;
  };
  categories: {
    category: Category;
    amount: number;
    payments: number;
    share: number;
  }[];
  conversionIncomplete: boolean;
  unconvertedExpenses: number;
  historyRecorded: boolean;
}
