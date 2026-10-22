import { useEffect, useState } from "react";
import { getApiBase } from "../lib/api";

export type ConnectionState =
  | "checking"
  | "good"
  | "slow"
  | "poor"
  | "offline"
  | "unavailable";
export interface ConnectionStatus {
  state: ConnectionState;
  latency: number | null;
}

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    state: "checking",
    latency: null,
  });

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let timer: number | undefined;

    const probe = async () => {
      if (inFlight) return;
      if (!navigator.onLine) {
        setStatus({ state: "offline", latency: null });
        return;
      }

      inFlight = true;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      const started = performance.now();
      try {
        const response = await fetch(`${getApiBase()}/`, {
          method: "GET",
          cache: "no-store",
          credentials: "omit",
          signal: controller.signal,
        });
        const latency = Math.round(performance.now() - started);
        if (active) {
          setStatus({
            state:
              response.status >= 500
                ? "unavailable"
                : latency <= 400
                  ? "good"
                  : latency <= 1000
                    ? "slow"
                    : "poor",
            latency,
          });
        }
      } catch {
        if (active)
          setStatus({
            state: navigator.onLine ? "unavailable" : "offline",
            latency: null,
          });
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
      }
    };

    const onOnline = () => void probe();
    const onOffline = () => setStatus({ state: "offline", latency: null });
    const onFocus = () => void probe();
    void probe();
    timer = window.setInterval(() => void probe(), 30000);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return status;
}
