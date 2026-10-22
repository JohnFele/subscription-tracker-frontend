import {
  dateLabel,
  money,
  pretty,
  type ExpenseRecord,
  type ExpenditureMonth,
  type ExpenditureSummary,
} from "../../lib/subscriptions";
import type { Period } from "../../lib/types/period";
import { ActualExpenditureChart } from "./ActualExpenditureChart";

interface ExpenditurePageProps {
  expenditure: ExpenditureSummary | null;
  currency: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
  records: ExpenseRecord[];
  monthly: ExpenditureMonth[];
}

export function ExpenditurePage({
  expenditure,
  currency,
  period,
  onPeriodChange,
  records,
  monthly,
}: ExpenditurePageProps) {
  if (!expenditure)
    return (
      <section className="panel expenditure-loading">
        <strong>Loading expenditure information…</strong>
      </section>
    );

  const { totals } = expenditure;
  const periodTotal = records.reduce(
    (sum, record) =>
      sum +
      (record.convertedAmount ??
        (record.currency === currency ? record.amount : 0)),
    0
  );
  const totalsByCategory = records.reduce((categoryTotals, record) => {
    const amount =
      record.convertedAmount ??
      (record.currency === currency ? record.amount : 0);
    const current = categoryTotals.get(record.category) ?? {
      amount: 0,
      payments: 0,
    };
    current.amount += amount;
    current.payments += 1;
    categoryTotals.set(record.category, current);
    return categoryTotals;
  }, new Map<string, { amount: number; payments: number }>());
  const periodCategories = [...totalsByCategory.entries()]
    .map(([category, value]) => ({
      category,
      ...value,
      share: periodTotal ? value.amount / periodTotal : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
  const periodCount = monthly.filter(point => !point.predicted).length;
  const averageLabel =
    period === "Last 30 days"
      ? "Average per day"
      : period.endsWith("years")
        ? "Average per year"
        : "Average per month";
  const statCards = [
    {
      title: `Actual spend · ${period}`,
      value: money(periodTotal, currency),
      note: `${records.length} recorded payments`,
    },
    {
      title: `${averageLabel} in range`,
      value: money(periodTotal / Math.max(1, periodCount), currency),
      note: `${periodCount} ${period === "Last 30 days" ? "days" : period.endsWith("years") ? "years" : "months"} shown`,
    },
    {
      title: `Previous year actual · ${expenditure.previousYear}`,
      value: totals.priorYearPayments
        ? money(totals.priorYearActual, currency)
        : "No history recorded",
      note: `${totals.priorYearPayments} recorded payments`,
    },
    {
      title: `Year to date actual · ${expenditure.currentYear}`,
      value: money(totals.currentYearToDate, currency),
      note: `${totals.currentYearPayments} recorded payments through ${dateLabel(expenditure.asOf)}`,
    },
    {
      title: `Current year forecast · ${expenditure.currentYear}`,
      value: money(totals.currentYearForecast, currency),
      note: "Actual spending plus scheduled recurring charges",
    },
    {
      title: "Scheduled recurring remaining",
      value: money(totals.remainingRecurring, currency),
      note: `${totals.daysRemainingInYear} days remaining in the year`,
    },
    {
      title: "Average monthly actual",
      value: money(totals.monthlyAverage, currency),
      note: "Average per calendar month this year",
    },
    {
      title: "Active monthly commitment",
      value: money(totals.activeMonthlyCommitment, currency),
      note: "Monthly equivalent of active subscriptions",
    },
    {
      title: `Next month forecast · ${totals.nextMonthNewSubscriptionCount} new subscriptions`,
      value: money(totals.nextMonthForecast, currency),
      note: "Scheduled next month with no recorded payment yet",
    },
  ];

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SPENDING TRENDS</div>
          <h1>Expenditure</h1>
          <p>
            Recorded payments, recurring commitments, and a forward-looking
            forecast in {currency}.
          </p>
        </div>
      </div>
      <div className="expenditure-year-cards">
        {statCards.map(card => (
          <article
            key={card.title}
            className={`expenditure-year-card ${card.title.startsWith("Current year forecast") ? "expenditure-projection" : ""}`}
          >
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </article>
        ))}
      </div>
      <ActualExpenditureChart
        monthly={monthly}
        currency={currency}
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
      <div className="expenditure-insights-grid">
        <section className="panel expenditure-breakdown">
          <div className="panel-heading">
            <div>
              <h2>Spending by category</h2>
              <p>
                Recorded payments · {period} · {currency}
              </p>
            </div>
          </div>
          {periodCategories.length ? (
            <div className="expenditure-category-list">
              {periodCategories.map(category => (
                <div
                  className="expenditure-category-row"
                  key={category.category}
                >
                  <i
                    className={`cat-dot category-color-${category.category}`}
                  />
                  <span>{pretty(category.category)}</span>
                  <div className="expenditure-category-track">
                    <i
                      className={`category-color-${category.category}`}
                      style={{
                        width: `${Math.min(100, category.share * 100)}%`,
                      }}
                    />
                  </div>
                  <strong>{money(category.amount, currency)}</strong>
                  <small>{category.payments} payments</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="expenditure-empty-note">
              No recorded payments in this period.
            </p>
          )}
        </section>
        <section className="panel expenditure-method">
          <div className="panel-heading">
            <div>
              <h2>How to read this</h2>
              <p>Historical actuals and forecast</p>
            </div>
          </div>
          <div className="expenditure-method-body">
            <p>
              <strong>Actual spending</strong> comes from recorded subscription
              payments and any previously recorded one-time expenses. Historical
              records are converted to {currency} for this report.
            </p>
            <p>
              <strong>Current year forecast</strong> adds year-to-date actuals
              to remaining scheduled charges from active recurring
              subscriptions. It does not assume future one-time spending.
            </p>
            <p>
              <strong>Next month</strong> highlights charges due from
              subscriptions added this month that do not yet have a recorded
              payment.
            </p>
          </div>
        </section>
      </div>
      {expenditure.conversionIncomplete && (
        <p className="expenditure-warning">
          Some amounts could not be converted to {currency} and are excluded
          from these totals.
        </p>
      )}
    </>
  );
}
