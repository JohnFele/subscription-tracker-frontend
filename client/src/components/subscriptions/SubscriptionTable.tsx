import { Ellipsis, Settings2, WalletCards, X } from "lucide-react";
import { daysUntil } from "../../lib/utils/dates";
import {
  dateLabel,
  money,
  pretty,
  type Subscription,
} from "../../lib/subscriptions";
import { BrandMark } from "../subtrack/BrandMark";
import { StatusBadge } from "../subtrack/StatusBadge";

interface SubscriptionTableProps {
  records: Subscription[];
  onOpen: (subscription: Subscription) => void;
  onEdit: (subscription: Subscription) => void;
  onCancel: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  showActions?: boolean;
}

export function SubscriptionTable({
  records,
  onOpen,
  onEdit,
  onCancel,
  onDelete,
  showActions = false,
}: SubscriptionTableProps) {
  if (!records.length) {
    return (
      <div className="empty-state table-empty">
        <WalletCards size={25} />
        <strong>No subscriptions found</strong>
        <span>Try clearing a filter or add a service to get started.</span>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="subscription-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Category</th>
            <th>Price</th>
            <th>Renewal date</th>
            <th>Status</th>
            {showActions && (
              <th>
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {records.map(subscription => {
            const recurring = subscription.recurring !== false;
            const price = subscription.convertedPrice ?? subscription.price;
            const currency =
              subscription.convertedCurrency ?? subscription.currency;

            return (
              <tr key={subscription._id} onClick={() => onOpen(subscription)}>
                <td>
                  <div className="service-cell">
                    <BrandMark name={subscription.name} />
                    <div>
                      <strong>{subscription.name}</strong>
                      <small>
                        <span
                          className={
                            recurring ? "recurring-badge" : "one-time-badge"
                          }
                        >
                          {recurring ? "Recurring" : "One-time"}
                        </span>
                        <span>
                          {recurring
                            ? pretty(subscription.frequency)
                            : "One-time charge"}{" "}
                          · {subscription.paymentMethod || "Subscription"}
                        </span>
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-label">
                    <i
                      className={`cat-dot category-color-${subscription.category}`}
                    />
                    {pretty(subscription.category)}
                  </span>
                </td>
                <td>
                  <strong className="price-cell">
                    {money(price, currency)}
                  </strong>
                  <small className="price-period">
                    {recurring
                      ? `/ ${subscription.frequency.replace("ly", "")}`
                      : "one time"}
                  </small>
                </td>
                <td>
                  <div className="renew-cell">
                    {recurring
                      ? dateLabel(subscription.renewalDate, {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                    {recurring &&
                      subscription.status === "active" &&
                      daysUntil(subscription.renewalDate) >= 0 && (
                        <small>
                          {daysUntil(subscription.renewalDate) === 0
                            ? "Today"
                            : `In ${daysUntil(subscription.renewalDate)} days`}
                        </small>
                      )}
                  </div>
                </td>
                <td>
                  <StatusBadge status={subscription.status} />
                </td>
                {showActions && (
                  <td>
                    <div
                      className="table-actions"
                      onClick={event => event.stopPropagation()}
                    >
                      <button title="Edit" onClick={() => onEdit(subscription)}>
                        <Settings2 size={15} />
                      </button>
                      {subscription.status === "active" && recurring && (
                        <button
                          title="Cancel"
                          onClick={() => onCancel(subscription)}
                        >
                          <X size={15} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          title="Delete"
                          onClick={() => onDelete(subscription)}
                        >
                          <Ellipsis size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
