import { useId } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { money, type ExpenditureMonth } from "../../lib/subscriptions";
import type { Period } from "../../lib/types/period";
import { PeriodFilter } from "../subtrack/PeriodFilter";

interface ActualExpenditureChartProps {
  monthly: ExpenditureMonth[];
  currency: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
  title: string;
}

export function ActualExpenditureChart({
  monthly,
  currency,
  period,
  onPeriodChange,
  title,
}: ActualExpenditureChartProps) {
  const gradientId = `expenditure-area-${useId().replace(/:/g, "")}`;
  const historicalPoints = monthly.filter(point => !point.predicted);
  const forecastPoint = monthly.find(point => point.predicted);
  const plottedPoints = [
    ...historicalPoints,
    ...(forecastPoint ? [forecastPoint] : []),
  ];
  const chartData = plottedPoints.map((point, index) => ({
    ...point,
    actualAmount: point.predicted ? null : point.amount,
    forecastAmount:
      point.predicted || index === historicalPoints.length - 1
        ? point.amount
        : null,
  }));
  const compactMoney = (amount: number) => money(amount, currency, true);

  return (
    <section className="panel expenditure-panel">
      <div className="panel-heading expenditure-heading">
        <div>
          <h2>{title}</h2>
          <p>
            {period === "Last 30 days"
              ? "Recorded payments by day"
              : period.endsWith("years")
                ? "Recorded payments by year"
                : "Recorded payments by month"}
            {forecastPoint ? " · next month forecast shown separately" : ""}
          </p>
        </div>
        <PeriodFilter period={period} onChange={onPeriodChange} />
      </div>
      <div className="expenditure-chart-wrap">
        <div
          className="expenditure-chart"
          role="img"
          aria-label={`${period} of actual expenditure and next-month forecast in ${currency}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 24, right: 12, bottom: 4, left: 16 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#388f64" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="#388f64" stopOpacity={0.025} />
                </linearGradient>
                <linearGradient
                  id={`${gradientId}-forecast`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#d18428" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#d18428" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#e9eee9"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="fullLabel"
                ticks={
                  period === "Last 30 days"
                    ? historicalPoints
                        .filter((_, index) => index % 2 === 0)
                        .map(point => point.fullLabel)
                    : undefined
                }
                tickFormatter={value =>
                  plottedPoints.find(point => point.fullLabel === value)
                    ?.axisLabel ?? String(value)
                }
                tick={{ fill: "#929d94", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#dce5de" }}
                interval={period === "Last 30 days" ? 0 : "preserveStartEnd"}
                minTickGap={8}
              />
              <YAxis
                domain={[0, "auto"]}
                tickFormatter={value => compactMoney(Number(value))}
                tick={{ fill: "#929d94", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={68}
                tickCount={3}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as (typeof chartData)[number];
                  const entries = payload.filter(
                    entry =>
                      (entry.dataKey !== "actualAmount" ||
                        entry.name === "Actual") &&
                      (entry.dataKey !== "forecastAmount" ||
                        entry.name === "Forecast")
                  );
                  return (
                    <div className="expenditure-tooltip">
                      <strong>{label}</strong>
                      {entries.map(entry => {
                        if (
                          entry.dataKey === "forecastAmount" &&
                          !data.predicted
                        )
                          return null;
                        const isForecast = entry.dataKey === "forecastAmount";
                        return (
                          <div key={String(entry.dataKey)}>
                            <i
                              className={
                                isForecast
                                  ? "tooltip-dot-forecast"
                                  : "tooltip-dot-actual"
                              }
                            />
                            <span>{isForecast ? "Forecast" : "Actual"}</span>
                            <b>{money(Number(entry.value), currency)}</b>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="actualAmount"
                stroke="none"
                fill={`url(#${gradientId})`}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="forecastAmount"
                stroke="none"
                fill={`url(#${gradientId}-forecast)`}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="actualAmount"
                stroke="#388f64"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#fff",
                  stroke: "#388f64",
                  strokeWidth: 2.5,
                }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={false}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="forecastAmount"
                stroke="#d18428"
                strokeWidth={2.5}
                dot={(props: {
                  cx?: number;
                  cy?: number;
                  payload?: { predicted?: boolean };
                }) =>
                  props.payload?.predicted &&
                  typeof props.cx === "number" &&
                  typeof props.cy === "number" ? (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r="5"
                      fill="#fff"
                      stroke="#d18428"
                      strokeWidth="3"
                    />
                  ) : (
                    <g />
                  )
                }
                activeDot={{ r: 6, strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={false}
                name="Forecast"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="expenditure-chart-legend">
        <span>
          <i className="expenditure-legend-actual" />
          {period.endsWith("years")
            ? "Recorded payments by year"
            : period === "Last 30 days"
              ? "Recorded payments by day"
              : "Recorded payments by month"}
        </span>
        {forecastPoint && (
          <span>
            <i className="expenditure-legend-forecast" />
            Next month: new, unpaid subscriptions
          </span>
        )}
      </div>
    </section>
  );
}
