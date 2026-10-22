import { pretty, type Subscription } from "../../lib/subscriptions";

export function StatusBadge({
  status,
}: {
  status: Subscription["status"] | string;
}) {
  return (
    <span className={`status status-${status}`}>
      <i />
      {pretty(status)}
    </span>
  );
}
