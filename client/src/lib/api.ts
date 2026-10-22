import type {
  ExpenseDraft,
  ExpenseRecord,
  ExpenditureSummary,
  Subscription,
  SubscriptionDraft,
  User,
} from "./subscriptions";
const DEFAULT_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://subscription-tracker-7twe.onrender.com"
    : "");
export const getApiBase = () => {
  const base = import.meta.env.PROD
    ? DEFAULT_BASE
    : (localStorage.getItem("subtrack-api-url") ?? DEFAULT_BASE);

  return base.replace(/\/+$/, "");
};
export const setApiBase = (value: string) =>
  localStorage.setItem("subtrack-api-url", value.trim().replace(/\/+$/, ""));
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getApiBase()}/api/v1${path}`, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError(
      "Could not reach the API. Check the backend URL and credentialed CORS settings.",
      0
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined")
      window.dispatchEvent(new Event("subtrack:unauthorized"));
    throw new ApiError(
      payload.message || payload.error || `Request failed (${response.status})`,
      response.status
    );
  }
  return payload as T;
}
const data = <T>(payload: any): T => payload?.data as T;
export const api = {
  async login(email: string, password: string) {
    const r = await request<any>("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return (r?.data?.userData ?? r?.data?.user ?? r?.user) as User;
  },
  async register(name: string, email: string, password: string) {
    const r = await request<any>("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    return (r?.data?.user ?? r?.data?.userData ?? r?.user) as User;
  },
  logout: () => request("/auth/sign-out", { method: "POST" }),
  user: async (id: string) =>
    data<User>(await request(`/users/${encodeURIComponent(id)}`)),
  async subscriptions(page = 1, limit = 100, userId?: string) {
    const path = userId
      ? `/subscriptions/user/${encodeURIComponent(userId)}`
      : "/subscriptions";
    const r = await request<any>(`${path}?page=${page}&limit=${limit}`);
    return {
      records: (r?.data ?? []) as Subscription[],
      totalPages: Number(r?.totalPages ?? 1),
      total: Number(r?.total ?? r?.data?.length ?? 0),
    };
  },
  subscription: async (id: string) =>
    data<Subscription>(
      await request(`/subscriptions/${encodeURIComponent(id)}`)
    ),
  convertCurrency: async (
    amount: number,
    fromCurrency: string,
    toCurrency?: string
  ) =>
    data<{
      amount: number;
      fromCurrency: string;
      toCurrency: string;
      convertedAmount: number;
      rate: number;
      rateUpdatedAt: string | null;
      stale: boolean;
    }>(
      await request("/currency/convert", {
        method: "POST",
        body: JSON.stringify({
          amount,
          fromCurrency,
          ...(toCurrency ? { toCurrency } : {}),
        }),
      })
    ),
  expenses: async (currency: string, from?: string, to?: string) =>
    data<ExpenseRecord[]>(
      await request(
        `/expenses?currency=${encodeURIComponent(currency)}${from ? `&from=${encodeURIComponent(from)}` : ""}${to ? `&to=${encodeURIComponent(to)}` : ""}`
      )
    ),
  expenditureSummary: async (currency: string) =>
    data<ExpenditureSummary>(
      await request(
        `/expenses/summary?currency=${encodeURIComponent(currency)}`
      )
    ),
  createExpense: async (draft: ExpenseDraft) =>
    data<ExpenseRecord>(
      await request("/expenses", {
        method: "POST",
        body: JSON.stringify(draft),
      })
    ),
  create: async (draft: SubscriptionDraft) =>
    data<Subscription>(
      await request("/subscriptions", {
        method: "POST",
        body: JSON.stringify(draft),
      })
    ),
  update: async (id: string, draft: SubscriptionDraft) =>
    data<Subscription>(
      await request(`/subscriptions/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(draft),
      })
    ),
  cancel: async (id: string) =>
    data<Subscription>(
      await request(`/subscriptions/${encodeURIComponent(id)}/cancel`, {
        method: "PUT",
      })
    ),
  remove: (id: string) =>
    request(`/subscriptions/${encodeURIComponent(id)}`, { method: "DELETE" }),
  users: async () => data<User[]>(await request("/users")),
  createUser: (draft: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => request("/users", { method: "POST", body: JSON.stringify(draft) }),
  updateUser: async (id: string, draft: Record<string, string>) =>
    data<{ user: User }>(
      await request(`/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(draft),
      })
    ).user,
  removeUser: (id: string) =>
    request(`/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
      body: JSON.stringify({ confirm: true }),
    }),
};
