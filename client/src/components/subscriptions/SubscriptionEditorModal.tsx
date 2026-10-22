import { CircleHelp, CreditCard } from "lucide-react";
import {
  CATEGORIES,
  CURRENCIES,
  FREQUENCIES,
  pretty,
  STATUSES,
  type SubscriptionDraft,
} from "../../lib/subscriptions";
import { PAYMENT_METHODS } from "../../lib/constants/paymentMethods";
import { nextBillingDate } from "../../lib/utils/billingDates";
import { updateSubscriptionDraft } from "../../lib/utils/subscriptionDraft";
import { Button } from "../subtrack/Button";
import { Field } from "../subtrack/Field";

interface SubscriptionEditorModalProps {
  mode: "add" | "edit";
  draft: SubscriptionDraft;
  otherPaymentMethod: boolean;
  busy: boolean;
  onDraftChange: (
    update: (draft: SubscriptionDraft) => SubscriptionDraft
  ) => void;
  onPaymentMethodChange: (isOther: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function SubscriptionEditorModal({
  mode,
  draft,
  otherPaymentMethod,
  busy,
  onDraftChange,
  onPaymentMethodChange,
  onSubmit,
  onCancel,
}: SubscriptionEditorModalProps) {
  const setField = (
    key: keyof SubscriptionDraft,
    value: string | number | boolean
  ) => onDraftChange(previous => updateSubscriptionDraft(previous, key, value));
  return (
    <>
      <div className="modal-heading">
        <div className="modal-icon">
          <CreditCard size={18} />
        </div>
        <h2>{mode === "edit" ? "Edit subscription" : "Add a subscription"}</h2>
        <p>
          {mode === "edit"
            ? "Update the details for this service."
            : "Keep another recurring cost on your radar."}
        </p>
      </div>
      <form className="subscription-form" onSubmit={onSubmit}>
        <Field label="Service name" wide>
          <input
            autoFocus
            required
            placeholder="e.g. Netflix"
            value={draft.name}
            onChange={event => setField("name", event.target.value)}
          />
        </Field>
        <Field label="Price">
          <div className="price-input">
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={draft.price || ""}
              onChange={event => setField("price", Number(event.target.value))}
            />
            <select
              value={draft.currency}
              onChange={event => setField("currency", event.target.value)}
            >
              {CURRENCIES.map(currency => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="Billing type">
          <select
            value={draft.recurring ? "recurring" : "once"}
            onChange={event => {
              const recurring = event.target.value === "recurring";
              onDraftChange(previous => ({
                ...previous,
                recurring,
                ...(recurring
                  ? {
                      frequency: previous.frequency ?? "monthly",
                      renewalDate:
                        previous.renewalDate ??
                        nextBillingDate(
                          previous.startDate,
                          previous.frequency ?? "monthly"
                        ),
                    }
                  : {}),
              }));
            }}
          >
            <option value="recurring">Recurring</option>
            <option value="once">One-time</option>
          </select>
        </Field>
        {draft.recurring && (
          <Field label="Billing frequency">
            <select
              value={draft.frequency ?? "monthly"}
              onChange={event => setField("frequency", event.target.value)}
            >
              {FREQUENCIES.map(frequency => (
                <option key={frequency} value={frequency}>
                  {pretty(frequency)}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Category">
          <select
            value={draft.category}
            onChange={event => setField("category", event.target.value)}
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {pretty(category)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={draft.status}
            onChange={event => setField("status", event.target.value)}
          >
            {STATUSES.map(status => (
              <option key={status} value={status}>
                {pretty(status)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Payment method" wide>
          <select
            value={
              otherPaymentMethod
                ? "Other"
                : PAYMENT_METHODS.includes(draft.paymentMethod)
                  ? draft.paymentMethod
                  : ""
            }
            onChange={event => {
              const value = event.target.value;
              onPaymentMethodChange(value === "Other");
              setField(
                "paymentMethod",
                value === "Other" || value === "" ? "" : value
              );
            }}
          >
            <option value="">Select a payment method</option>
            {PAYMENT_METHODS.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
          {otherPaymentMethod && (
            <input
              aria-label="Other payment method"
              placeholder="Enter payment method"
              value={draft.paymentMethod}
              onChange={event => setField("paymentMethod", event.target.value)}
            />
          )}
        </Field>
        <Field label="Start date">
          <input
            type="date"
            required
            value={draft.startDate}
            onChange={event => setField("startDate", event.target.value)}
          />
        </Field>
        {draft.recurring && (
          <Field label="Renewal date">
            <input
              type="date"
              required
              min={nextBillingDate(draft.startDate, "daily")}
              value={draft.renewalDate ?? ""}
              onChange={event => setField("renewalDate", event.target.value)}
            />
          </Field>
        )}
        {draft.recurring && (
          <div className="form-note">
            <CircleHelp size={14} /> Enter the renewal date shown by your
            provider. Renewal tracking uses the date saved on each record.
          </div>
        )}
        <div className="modal-actions">
          <Button kind="light" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Add subscription"}
          </Button>
        </div>
      </form>
    </>
  );
}
