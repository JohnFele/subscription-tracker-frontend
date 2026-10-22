import { useCallback, useEffect, useState } from "react";
import { ApiError, api } from "../lib/api";
import type {
  Subscription,
  SubscriptionDraft,
  User,
} from "../lib/subscriptions";
import { toast } from "sonner";

interface UseSubscriptionsOptions {
  user: User | null;
  onUnauthorized: () => void;
  refreshExpenditure: () => Promise<void>;
}

function reportError(
  error: unknown,
  fallback: string,
  onUnauthorized: () => void
) {
  if (error instanceof ApiError && error.status === 401) {
    onUnauthorized();
    toast.error("Your session has expired. Please sign in again.");
    return;
  }
  toast.error(error instanceof Error ? error.message : fallback);
}

export function useSubscriptions({
  user,
  onUnauthorized,
  refreshExpenditure,
}: UseSubscriptionsOptions) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(
    async (account: User | null = user) => {
      if (!account) {
        setSubscriptions([]);
        return;
      }
      setLoading(true);
      try {
        const all: Subscription[] = [];
        for (let page = 1; page <= 100; page++) {
          const result = await api.subscriptions(page, 100);
          all.push(...result.records);
          if (page >= result.totalPages) break;
        }
        setSubscriptions(all);
      } catch (error) {
        reportError(error, "Could not load subscriptions", onUnauthorized);
      } finally {
        setLoading(false);
      }
    },
    [user, onUnauthorized]
  );

  useEffect(() => {
    void refresh(user);
  }, [user, refresh]);

  const save = async (
    draft: SubscriptionDraft,
    selected: Subscription | null
  ) => {
    try {
      const payload = draft.recurring
        ? draft
        : { ...draft, frequency: undefined, renewalDate: undefined };
      if (selected) await api.update(selected._id, payload);
      else await api.create(payload);
      await Promise.all([refresh(), refreshExpenditure()]);
      toast.success(selected ? "Subscription updated" : "Subscription added");
      return true;
    } catch (error) {
      reportError(error, "Could not save subscription", onUnauthorized);
      return false;
    }
  };

  const cancel = async (subscription: Subscription) => {
    try {
      await api.cancel(subscription._id);
      await Promise.all([refresh(), refreshExpenditure()]);
      toast.success(`${subscription.name} cancelled`);
      return true;
    } catch (error) {
      reportError(error, "Could not cancel subscription", onUnauthorized);
      return false;
    }
  };

  const remove = async (subscription: Subscription) => {
    try {
      await api.remove(subscription._id);
      await Promise.all([refresh(), refreshExpenditure()]);
      toast.success("Subscription deleted");
      return true;
    } catch (error) {
      reportError(error, "Could not delete subscription", onUnauthorized);
      return false;
    }
  };

  return {
    subscriptions,
    loading,
    refresh,
    save,
    cancel,
    remove,
  };
}
