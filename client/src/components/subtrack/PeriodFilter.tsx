import { CalendarDays, ChevronDown } from "lucide-react";
import { PERIODS } from "../../lib/constants/periods";
import type { Period } from "../../lib/types/period";

export function PeriodFilter({
  period,
  onChange,
}: {
  period: Period;
  onChange: (period: Period) => void;
}) {
  return (
    <label className="period-filter">
      <CalendarDays size={16} />
      <span className="sr-only">Filter spending period</span>
      <select
        aria-label="Filter spending period"
        value={period}
        onChange={event => onChange(event.target.value as Period)}
      >
        {PERIODS.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} />
    </label>
  );
}
