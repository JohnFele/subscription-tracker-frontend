import { CircleHelp, WalletCards } from "lucide-react";
import {
  CATEGORIES,
  CURRENCIES,
  pretty,
  type Category,
  type ExpenseDraft,
} from "../../lib/subscriptions";
import { dateInputValue } from "../../lib/utils/dates";
import { Button } from "../subtrack/Button";
import { Field } from "../subtrack/Field";

interface SubscriptionPaymentModalProps {
  draft: ExpenseDraft;
  busy: boolean;
  onDraftChange: (update: (draft: ExpenseDraft) => ExpenseDraft) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function SubscriptionPaymentModal({
  draft,
  busy,
  onDraftChange,
  onSubmit,
  onCancel,
}: SubscriptionPaymentModalProps) {
  return (
    <>
      <div className="modal-heading">
        <div className="modal-icon">
          <WalletCards size={18} />
        </div>
        <h2>Record subscription payment</h2>
        <p>Record this charge to update your actual expenditure history.</p>
      </div>
      <form className="subscription-form" onSubmit={onSubmit}>
        <Field label="Subscription" wide>
          <input required maxLength={100} value={draft.name} disabled />
        </Field>
        <Field label="Amount">
          <div className="price-input">
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={draft.amount || ""}
              onChange={event =>
                onDraftChange(previous => ({
                  ...previous,
                  amount: Number(event.target.value),
                }))
              }
            />
            <select
              value={draft.currency}
              onChange={event =>
                onDraftChange(previous => ({
                  ...previous,
                  currency: event.target.value,
                }))
              }
            >
              {CURRENCIES.map(currency => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="Category">
          <select
            value={draft.category}
            onChange={event =>
              onDraftChange(previous => ({
                ...previous,
                category: event.target.value as Category,
              }))
            }
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {pretty(category)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input
            type="date"
            required
            max={dateInputValue(new Date())}
            value={draft.date}
            onChange={event =>
              onDraftChange(previous => ({
                ...previous,
                date: event.target.value,
              }))
            }
          />
        </Field>
        <div className="form-note">
          <CircleHelp size={14} /> This records an actual payment and updates
          its next renewal date.
        </div>
        <div className="modal-actions">
          <Button kind="light" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Record payment"}
          </Button>
        </div>
      </form>
    </>
  );
}
