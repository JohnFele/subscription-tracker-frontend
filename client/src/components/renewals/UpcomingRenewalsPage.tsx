import { useMemo, useState } from "react";
import { daysUntil } from "../../lib/utils/dates";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  WalletCards,
} from "lucide-react";
import { dateInputValue } from "../../lib/utils/dates";
import type { Page } from "../../lib/types/navigation";
import {
  dateLabel,
  money,
  pretty,
  type Currency,
  type Subscription,
} from "../../lib/subscriptions";
import { BrandMark } from "../subtrack/BrandMark";
import { Button } from "../subtrack/Button";

interface UpcomingRenewalsPageProps {
  subscriptions: Subscription[];
  currency: Currency;
  onOpenSubscription: (subscription: Subscription) => void;
  onNavigate: (page: Page) => void;
}

export function UpcomingRenewalsPage({
  subscriptions,
  currency,
  onOpenSubscription,
  onNavigate,
}: UpcomingRenewalsPageProps) {
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState(() =>
    dateInputValue(new Date())
  );
  const [horizon, setHorizon] = useState<7 | 14 | 30>(7);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1
    );
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const key = dateInputValue(date);
      return {
        date,
        key,
        inMonth: date.getMonth() === calendarMonth.getMonth(),
        renewals: subscriptions.filter(
          subscription => subscription.renewalDate.slice(0, 10) === key
        ),
      };
    });
  }, [calendarMonth, subscriptions]);

  const selectedDayRenewals = subscriptions.filter(
    subscription => subscription.renewalDate.slice(0, 10) === selectedDay
  );
  const horizonRenewals = subscriptions.filter(
    subscription => daysUntil(subscription.renewalDate) <= horizon
  );
  const nextThirtyDayTotal = subscriptions
    .filter(subscription => daysUntil(subscription.renewalDate) <= 30)
    .reduce(
      (sum, subscription) =>
        sum +
        (subscription.convertedPrice ??
          (subscription.currency === currency ? subscription.price : 0)),
      0
    );

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + offset,
      1
    );
    setCalendarMonth(nextMonth);
    setSelectedDay(dateInputValue(nextMonth));
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">AHEAD OF THE CURVE</div>
          <h1>Upcoming renewals</h1>
          <p>Browse scheduled renewals by day.</p>
        </div>
        <Button kind="light" onClick={() => onNavigate("Subscriptions")}>
          <WalletCards size={16} /> Manage subscriptions
        </Button>
      </div>
      <div className="renewal-callout">
        <div className="callout-icon">
          <CalendarDays size={19} />
        </div>
        <div>
          <strong>{subscriptions.length} active renewals ahead</strong>
          <p>
            Dates come from your subscription records; verify them with your
            provider.
          </p>
        </div>
        <div className="callout-total">
          <span>Due in next 30 days · {currency}</span>
          <strong>{money(nextThirtyDayTotal, currency)}</strong>
        </div>
      </div>
      <section className="panel renewal-calendar-panel">
        <div className="renewal-calendar-heading">
          <div>
            <h2>
              {calendarMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <p>Select a day to view its scheduled renewals.</p>
          </div>
          <div className="renewal-calendar-nav">
            <button aria-label="Previous month" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={17} />
            </button>
            <button aria-label="Next month" onClick={() => changeMonth(1)}>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
        <div className="renewal-calendar-grid renewal-calendar-weekdays">
          {"Sun Mon Tue Wed Thu Fri Sat".split(" ").map(day => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="renewal-calendar-grid">
          {calendarDays.map(({ date, key, inMonth, renewals }) => (
            <button
              key={key}
              className={`renewal-calendar-day ${!inMonth ? "outside-month" : ""} ${selectedDay === key ? "selected-day" : ""} ${renewals.length ? "has-renewals" : ""}`}
              aria-pressed={selectedDay === key}
              onClick={() => {
                setSelectedDay(key);
                if (!inMonth)
                  setCalendarMonth(
                    new Date(date.getFullYear(), date.getMonth(), 1)
                  );
              }}
            >
              <span>{date.getDate()}</span>
              {renewals.length > 0 && (
                <small>
                  {renewals.length} renewal{renewals.length === 1 ? "" : "s"}
                </small>
              )}
            </button>
          ))}
        </div>
      </section>
      <section className="panel selected-renewals-panel">
        <div className="panel-heading">
          <div>
            <h2>
              {new Date(`${selectedDay}T00:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h2>
            <p>
              {selectedDayRenewals.length} scheduled renewal
              {selectedDayRenewals.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        {selectedDayRenewals.length > 0 ? (
          <div className="selected-renewals-list">
            {selectedDayRenewals.map(subscription => (
              <article className="renewal-card" key={subscription._id}>
                <BrandMark name={subscription.name} large />
                <div className="renewal-card-meta">
                  <strong>{subscription.name}</strong>
                  <span>
                    {pretty(subscription.category)} <i>·</i>{" "}
                    {pretty(subscription.frequency)}
                  </span>
                  <span className="payment-hint">
                    <CreditCard size={12} />{" "}
                    {subscription.paymentMethod || "Payment method not set"}
                  </span>
                </div>
                <div className="renewal-card-price">
                  <strong>
                    {money(
                      subscription.convertedPrice ?? subscription.price,
                      subscription.convertedCurrency ?? subscription.currency
                    )}
                  </strong>
                  <small>
                    per{" "}
                    {subscription.frequency === "yearly"
                      ? "year"
                      : subscription.frequency === "monthly"
                        ? "month"
                        : subscription.frequency}
                  </small>
                </div>
                <button
                  className="icon-button"
                  aria-label={`View ${subscription.name}`}
                  onClick={() => onOpenSubscription(subscription)}
                >
                  <ArrowRight size={17} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="selected-renewals-empty">
            <CalendarDays size={22} />
            <span>No subscriptions renew on this day.</span>
          </div>
        )}
      </section>
      <section className="panel horizon-renewals-panel">
        <div className="panel-heading horizon-heading">
          <div>
            <h2>Due soon</h2>
            <p>Upcoming scheduled subscription payments</p>
          </div>
          <div
            className="horizon-filter"
            role="group"
            aria-label="Filter renewals by time period"
          >
            {([7, 14, 30] as const).map(days => (
              <button
                key={days}
                className={horizon === days ? "selected" : ""}
                aria-pressed={horizon === days}
                onClick={() => setHorizon(days)}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>
        {horizonRenewals.length > 0 ? (
          <div className="horizon-renewal-list">
            {horizonRenewals.map(subscription => {
              const days = daysUntil(subscription.renewalDate);
              return (
                <article className="horizon-renewal-row" key={subscription._id}>
                  <BrandMark name={subscription.name} />
                  <div className="horizon-renewal-meta">
                    <strong>{subscription.name}</strong>
                    <span>
                      {pretty(subscription.category)} ·{" "}
                      {pretty(subscription.frequency)}
                    </span>
                  </div>
                  <span className="horizon-renewal-date">
                    {days === 0
                      ? "Today"
                      : days === 1
                        ? "Tomorrow"
                        : `In ${days} days`}{" "}
                    ·{" "}
                    {dateLabel(subscription.renewalDate, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <strong className="horizon-renewal-price">
                    {money(
                      subscription.convertedPrice ?? subscription.price,
                      subscription.convertedCurrency ?? subscription.currency
                    )}
                  </strong>
                  <button
                    className="icon-button"
                    aria-label={`View ${subscription.name}`}
                    onClick={() => onOpenSubscription(subscription)}
                  >
                    <ArrowRight size={16} />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="selected-renewals-empty">
            <CalendarDays size={22} />
            <span>No subscriptions are due in the next {horizon} days.</span>
          </div>
        )}
      </section>
    </>
  );
}
