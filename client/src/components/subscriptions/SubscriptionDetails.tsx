import { CreditCard, Settings2 } from "lucide-react";
import {
  dateLabel,
  money,
  monthlyCost,
  pretty,
  type Subscription,
} from "../../lib/subscriptions";
import { BrandMark } from "../subtrack/BrandMark";
import { Button } from "../subtrack/Button";
import { StatusBadge } from "../subtrack/StatusBadge";

interface SubscriptionDetailsProps {
  subscription: Subscription;
  onClose: () => void;
  onRecordPayment: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function SubscriptionDetails({
  subscription,
  onClose,
  onRecordPayment,
  onEdit,
  onCancel,
  onDelete,
}: SubscriptionDetailsProps) {
  const recurring = subscription.recurring !== false;
  const convertedPrice = subscription.convertedPrice ?? subscription.price;
  const displayCurrency =
    subscription.convertedCurrency ?? subscription.currency;
  const monthlyEquivalent = monthlyCost({
    ...subscription,
    price: convertedPrice,
  });

  return (
    <>
      <div className="detail-head">
        <BrandMark name={subscription.name} large />
        <div>
          <StatusBadge status={subscription.status} />
          <h2>{subscription.name}</h2>
          <span>{pretty(subscription.category)} subscription</span>
        </div>
      </div>
      <div className="detail-price">
        {money(convertedPrice, displayCurrency)}{" "}
        <span>
          {recurring
            ? `per ${pretty(subscription.frequency)}`
            : "one-time charge"}
        </span>
      </div>
      <div className="detail-lines">
        <div>
          <span>Original charge</span>
          <strong>{money(subscription.price, subscription.currency)}</strong>
        </div>
        {recurring && (
          <div>
            <span>Next renewal</span>
            <strong>{dateLabel(subscription.renewalDate)}</strong>
          </div>
        )}
        <div>
          <span>Started</span>
          <strong>{dateLabel(subscription.startDate)}</strong>
        </div>
        <div>
          <span>Payment method</span>
          <strong>{subscription.paymentMethod || "Not specified"}</strong>
        </div>
        {recurring && (
          <div>
            <span>Monthly equivalent</span>
            <strong>{money(monthlyEquivalent, displayCurrency)}</strong>
          </div>
        )}
      </div>
      <div className="modal-actions">
        <Button kind="light" onClick={onClose}>
          Close
        </Button>
        {subscription.status === "active" && (
          <Button kind="light" onClick={onRecordPayment}>
            <CreditCard size={15} /> Record payment
          </Button>
        )}
        <Button kind="light" onClick={onEdit}>
          <Settings2 size={15} /> Edit
        </Button>
        {subscription.status === "active" && recurring && (
          <Button kind="danger" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={onDelete}>Delete</Button>
      </div>
    </>
  );
}
