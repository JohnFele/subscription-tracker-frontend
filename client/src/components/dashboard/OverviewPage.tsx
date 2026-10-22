import { daysUntil } from "../../lib/utils/dates";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Ellipsis,
  FileClock,
  Plus,
  WalletCards,
} from "lucide-react";
import { ActualExpenditureChart } from "../expenditure/ActualExpenditureChart";
import { SubscriptionTable } from "../subscriptions/SubscriptionTable";
import { Button } from "../subtrack/Button";
import { BrandMark } from "../subtrack/BrandMark";
import {
  money,
  pretty,
  type Currency,
  type ExpenseRecord,
  type ExpenditureMonth,
  type Subscription,
} from "../../lib/subscriptions";
import type { Period } from "../../lib/types/period";

import type {
  OverviewCategoryRow,
  OverviewCategorySort,
} from "../../lib/types/overview";
export type {
  OverviewCategoryRow,
  OverviewCategorySort,
} from "../../lib/types/overview";

interface OverviewPageProps {
  userName: string;
  period: Period;
  defaultCurrency: Currency;
  periodSpend: number;
  periodExpenses: ExpenseRecord[];
  periodMonthly: ExpenditureMonth[];
  subscriptions: Subscription[];
  activeCount: number;
  monthlyCommitment: number;
  nextRenewals: Subscription[];
  conversionIncomplete: boolean;
  staleExchangeRates: boolean;
  overviewRows: OverviewCategoryRow[];
  overviewCategorySort: OverviewCategorySort;
  showAllOverviewCategories: boolean;
  onSortChange: (sort: OverviewCategorySort) => void;
  onToggleAllCategories: () => void;
  onPeriodChange: (period: Period) => void;
  onAddSubscription: () => void;
  onNavigate: (page: "Subscriptions" | "Upcoming renewals") => void;
  onOpenSubscription: (subscription: Subscription) => void;
  onEditSubscription: (subscription: Subscription) => void;
  onCancelSubscription: (subscription: Subscription) => void;
}

export function OverviewPage({
  userName,
  period,
  defaultCurrency,
  periodSpend,
  periodExpenses,
  periodMonthly,
  subscriptions,
  activeCount,
  monthlyCommitment,
  nextRenewals,
  conversionIncomplete,
  staleExchangeRates,
  overviewRows,
  overviewCategorySort,
  showAllOverviewCategories,
  onSortChange,
  onToggleAllCategories,
  onPeriodChange,
  onAddSubscription,
  onNavigate,
  onOpenSubscription,
  onEditSubscription,
  onCancelSubscription,
}: OverviewPageProps) {
  const monthlyTotal = monthlyCommitment;
  const totalPercent = (amount: number) =>
    monthlyTotal ? (amount / monthlyTotal) * 100 : 0;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {new Date()
              .toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
              .toUpperCase()}{" "}
            <span className="live-dot" />
          </div>
          <h1>
            Good evening, {userName.split(" ")[0]}{" "}
            <span className="wave">✳</span>
          </h1>
          <p>Here’s what’s happening with your subscriptions.</p>
        </div>
        <div className="heading-actions">
          <Button onClick={onAddSubscription}>
            <Plus size={17} /> Add subscription
          </Button>
        </div>
      </div>
      <section className="metrics-grid">
        <article className="metric-card">
          <div className="metric-label">
            Actual spending · {period}{" "}
            <span className="metric-icon green">
              <CreditCard size={17} />
            </span>
          </div>
          <div className="metric-number">
            {money(periodSpend, defaultCurrency)}
          </div>
          <div className="metric-foot">
            <span className="trend-up">
              <ArrowUpRight size={14} />
              {periodExpenses.length} payments
            </span>
            <span> recorded in this range</span>
          </div>
        </article>
        <article className="metric-card featured-metric">
          <div className="metric-label">
            Monthly commitment{" "}
            <span className="metric-icon white">
              <WalletCards size={17} />
            </span>
          </div>
          <div className="metric-number">
            {money(monthlyCommitment, defaultCurrency)}
            <span className="metric-unit">/mo</span>
          </div>
          <div className="metric-foot">
            <span>Converted to {defaultCurrency} · active only</span>
            <span className="metric-multi">
              {conversionIncomplete
                ? "Some currencies could not be converted"
                : staleExchangeRates
                  ? "Using last available rates"
                  : "Daily exchange rates"}
            </span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-label">
            Renewing soon{" "}
            <span className="metric-icon amber">
              <FileClock size={17} />
            </span>
          </div>
          <div className="metric-number">
            {
              nextRenewals.filter(
                subscription => daysUntil(subscription.renewalDate) <= 7
              ).length
            }
            <span className="metric-unit">this week</span>
          </div>
          <div className="metric-foot">
            <span className="metric-muted">Next 7 days</span>
            <button
              className="text-link"
              onClick={() => onNavigate("Upcoming renewals")}
            >
              See all <ArrowRight size={13} />
            </button>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-label">
            Active services{" "}
            <span className="metric-icon violet">
              <Activity size={17} />
            </span>
          </div>
          <div className="metric-number">
            {activeCount}
            <span className="metric-unit">of {subscriptions.length} total</span>
          </div>
          <div className="progress-track">
            <i
              style={{
                width: `${subscriptions.length ? (activeCount / subscriptions.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="metric-foot">
            <span className="metric-muted">
              {subscriptions.length
                ? Math.round((activeCount / subscriptions.length) * 100)
                : 0}
              % of subscriptions active
            </span>
          </div>
        </article>
      </section>
      <div className="dashboard-grid">
        <section className="panel spending-panel">
          <div className="panel-heading">
            <div>
              <h2>Spending overview</h2>
              <p>
                Monthly estimate from subscriptions that renew on a schedule
              </p>
            </div>
            <div className="spending-panel-actions">
              <label className="overview-category-sort">
                <span className="sr-only">Sort categories</span>
                <select
                  aria-label="Sort categories"
                  value={overviewCategorySort}
                  onChange={event =>
                    onSortChange(event.target.value as OverviewCategorySort)
                  }
                >
                  <option value="amount-desc">Highest spend</option>
                  <option value="amount-asc">Lowest spend</option>
                  <option value="date-asc">Soonest renewal</option>
                  <option value="date-desc">Latest renewal</option>
                </select>
                <ChevronDown size={13} />
              </label>
              <button
                className="overview-filter-button"
                aria-pressed={showAllOverviewCategories}
                onClick={onToggleAllCategories}
              >
                {showAllOverviewCategories ? "Show four" : "Show all"}
              </button>
              <button
                className="more-button"
                onClick={() => onNavigate("Subscriptions")}
                aria-label="View subscriptions"
              >
                <Ellipsis size={19} />
              </button>
            </div>
          </div>
          <div className="spend-chart">
            <div className="chart-summary">
              <div>
                <small>
                  Monthly total <span className="info-dot">i</span>
                </small>
                <strong>
                  {money(monthlyTotal, defaultCurrency)}
                  <span>/mo</span>
                </strong>
              </div>
              <span
                className="chart-trend"
                title="Active subscriptions with scheduled renewals, converted to a monthly estimate."
              >
                <ArrowUpRight size={13} /> Monthly recurring
              </span>
            </div>
            <div className="mix-plot">
              {overviewRows.map(row => (
                <div
                  key={row.category}
                  className={`mix-segment ${row.category === "__other" ? "category-color-overflow" : `category-color-${row.category}`}`}
                  style={{ width: `${totalPercent(row.amount)}%` }}
                  title={`${row.category === "__other" ? "Other" : pretty(row.category)} · ${money(row.amount, defaultCurrency)}`}
                />
              ))}
            </div>
            <div className="chart-legend">
              <span>
                <i className="active-subscriptions-dot" /> Active subscriptions
                · converted to {defaultCurrency}
              </span>
              <span className="legend-note">Projected recurring cost</span>
            </div>
          </div>
          <div className="category-legend">
            {overviewRows.map(row => (
              <div className="category-row" key={row.category}>
                <i
                  className={`cat-dot ${row.category === "__other" ? "category-color-overflow" : `category-color-${row.category}`}`}
                />
                <span>
                  {row.category === "__other" ? "Other" : pretty(row.category)}
                </span>
                <div className="category-bar">
                  <i
                    className={
                      row.category === "__other"
                        ? "category-color-overflow"
                        : `category-color-${row.category}`
                    }
                    style={{ width: `${totalPercent(row.amount)}%` }}
                  />
                </div>
                <strong>{money(row.amount, defaultCurrency)}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel renewals-panel">
          <div className="panel-heading">
            <div>
              <h2>Coming up</h2>
              <p>Your next renewals at a glance</p>
            </div>
            <button
              className="view-all-link"
              onClick={() => onNavigate("Upcoming renewals")}
            >
              View calendar <ArrowRight size={14} />
            </button>
          </div>
          <div className="renewal-list">
            {nextRenewals.slice(0, 5).map((subscription, index) => {
              const days = daysUntil(subscription.renewalDate);
              return (
                <button
                  className="renewal-row"
                  key={subscription._id}
                  onClick={() => onOpenSubscription(subscription)}
                >
                  <div
                    className={`renewal-date ${index === 0 ? "renewal-date-now" : ""}`}
                  >
                    <strong>
                      {new Date(subscription.renewalDate).getDate()}
                    </strong>
                    <span>
                      {new Date(subscription.renewalDate).toLocaleString(
                        "en-US",
                        { month: "short" }
                      )}
                    </span>
                  </div>
                  <BrandMark name={subscription.name} />
                  <div className="renewal-meta">
                    <strong>{subscription.name}</strong>
                    <span>
                      {days === 0
                        ? "Renews today"
                        : days === 1
                          ? "Tomorrow"
                          : `In ${days} days`}
                    </span>
                  </div>
                  <div className="renewal-price">
                    <strong>
                      {money(
                        subscription.convertedPrice ?? subscription.price,
                        subscription.convertedCurrency ?? subscription.currency
                      )}
                    </strong>
                    <small>{pretty(subscription.frequency)}</small>
                  </div>
                </button>
              );
            })}
            {nextRenewals.length === 0 && (
              <div className="empty-mini">
                <CalendarDays />
                <strong>No upcoming renewals</strong>
                <span>When renewal dates are added, they’ll show here.</span>
              </div>
            )}
          </div>
          <button
            className="renewals-footer"
            onClick={() => onNavigate("Upcoming renewals")}
          >
            See all renewals <ArrowRight size={14} />
          </button>
        </section>
      </div>
      <ActualExpenditureChart
        monthly={periodMonthly}
        currency={defaultCurrency}
        period={period}
        onPeriodChange={onPeriodChange}
        title={
          period === "Last 30 days"
            ? "Daily expenditure"
            : period.endsWith("years")
              ? "Yearly expenditure"
              : "Monthly expenditure"
        }
      />
      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>My subscriptions</h2>
            <p>A quick look at your recurring services</p>
          </div>
          <button
            className="view-all-link"
            onClick={() => onNavigate("Subscriptions")}
          >
            View all <ArrowRight size={14} />
          </button>
        </div>
        <SubscriptionTable
          records={subscriptions.slice(0, 5)}
          onOpen={onOpenSubscription}
          onEdit={onEditSubscription}
          onCancel={onCancelSubscription}
        />
      </section>
    </>
  );
}
