export type Period =
  | "This month"
  | "Last 30 days"
  | "Past 3 months"
  | "Past 6 months"
  | "Past 12 months"
  | `Past ${2 | 3 | 4 | 5} years`;
