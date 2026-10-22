export type OverviewCategorySort =
  | "amount-desc"
  | "amount-asc"
  | "date-asc"
  | "date-desc";
export interface OverviewCategoryRow {
  category: string;
  amount: number;
}
