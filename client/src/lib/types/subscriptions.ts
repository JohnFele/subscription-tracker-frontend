export type Frequency = "daily" | "weekly" | "monthly" | "yearly";
export type Category =
  | "entertainment"
  | "sports"
  | "news"
  | "food"
  | "health"
  | "fitness"
  | "education"
  | "technology"
  | "travel"
  | "productivity"
  | "communication"
  | "utilities"
  | "shopping"
  | "finance"
  | "home"
  | "lifestyle"
  | "other";
export type Status = "active" | "expired" | "cancelled" | "inactive";

export interface Subscription {
  _id: string;
  name: string;
  price: number;
  currency: string;
  convertedPrice?: number | null;
  convertedCurrency?: string;
  conversionRate?: number | null;
  rateUpdatedAt?: string | null;
  ratesStale?: boolean;
  recurring?: boolean;
  frequency: Frequency;
  category: Category;
  paymentMethod: string;
  status: Status;
  startDate: string;
  renewalDate: string;
  createdAt?: string;
}

export type SubscriptionDraft = Omit<
  Subscription,
  | "_id"
  | "createdAt"
  | "convertedPrice"
  | "convertedCurrency"
  | "conversionRate"
  | "rateUpdatedAt"
  | "ratesStale"
  | "recurring"
  | "frequency"
  | "renewalDate"
> & { recurring: boolean; frequency?: Frequency; renewalDate?: string };
