import type { Currency } from "../constants/subscriptions";

export type Role = "user" | "admin";
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: Role;
  defaultCurrency?: Currency;
}
