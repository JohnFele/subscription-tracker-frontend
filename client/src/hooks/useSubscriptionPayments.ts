import { api } from "../lib/api";
import type { ExpenseDraft } from "../lib/subscriptions";
import { toast } from "sonner";

interface UseSubscriptionPaymentsOptions {
  refreshSubscriptions: () => Promise<void>;
  refreshExpenditure: () => Promise<void>;
}

export function useSubscriptionPayments({
  refreshSubscriptions,
  refreshExpenditure,
}: UseSubscriptionPaymentsOptions) {
  const recordPayment = async (draft: ExpenseDraft) => {
    try {
      await api.createExpense(draft);
      await Promise.all([refreshSubscriptions(), refreshExpenditure()]);
      toast.success("Subscription payment recorded");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not record expense"
      );
      return false;
    }
  };

  return { recordPayment };
}
