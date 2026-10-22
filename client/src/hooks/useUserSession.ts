import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { Currency, User } from "../lib/subscriptions";
import { toast } from "sonner";

interface ProfileUpdate {
  name: string;
  email: string;
  password?: string;
  defaultCurrency: Currency;
}

interface UseUserSessionOptions {
  onSessionEnd: () => void;
}

function clearStoredSession() {
  localStorage.removeItem("subtrack-user-id");
  localStorage.removeItem("subtrack-live");
}

export function useUserSession({ onSessionEnd }: UseUserSessionOptions) {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setUser(null);
    onSessionEnd();
  }, [onSessionEnd]);

  useEffect(() => {
    const cachedId = localStorage.getItem("subtrack-user-id");
    if (!cachedId) return;
    let cancelled = false;
    api
      .user(cachedId)
      .then(account => {
        if (!cancelled) setUser(account);
      })
      .catch(() => {
        clearStoredSession();
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.addEventListener("subtrack:unauthorized", clearSession);
    return () =>
      window.removeEventListener("subtrack:unauthorized", clearSession);
  }, [clearSession]);

  const signInOrRegister = async (
    event: FormEvent<HTMLFormElement>,
    mode: "login" | "register"
  ) => {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    try {
      const account =
        mode === "register"
          ? await api.register(String(form.get("name")), email, password)
          : await api.login(email, password);
      if (!account?.id && !account?._id)
        throw new Error("The API response did not include a user ID.");
      setUser(account);
      localStorage.setItem(
        "subtrack-user-id",
        String(account.id ?? account._id)
      );
      toast.success(`Signed in${account.name ? ` as ${account.name}` : ""}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not authenticate"
      );
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch {
      /* clear the local session even if logout fails */
    }
    clearSession();
    toast.success("Signed out");
  };

  const updateProfile = async (update: ProfileUpdate) => {
    if (!user) return;
    try {
      const payload: Record<string, string> = {
        name: update.name,
        email: update.email,
        defaultCurrency: update.defaultCurrency,
      };
      if (update.password) payload.password = update.password;
      await api.updateUser(String(user.id ?? user._id), payload);
      setUser({
        ...user,
        name: update.name,
        email: update.email,
        defaultCurrency: update.defaultCurrency,
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update profile"
      );
    }
  };

  const deleteAccount = async () => {
    if (
      !user ||
      !window.confirm("Permanently delete your account? This cannot be undone.")
    )
      return;
    try {
      await api.removeUser(String(user.id ?? user._id));
      clearSession();
      toast.success("Account deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete account"
      );
    }
  };

  return {
    user,
    setUser,
    busy,
    signInOrRegister,
    signOut,
    updateProfile,
    deleteAccount,
    clearSession,
  };
}
