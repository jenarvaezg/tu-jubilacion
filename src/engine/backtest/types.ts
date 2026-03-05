// Backtest domain types for Phase 3.
// All types are immutable (readonly) and shared across engine and UI.

export type HistoricalSeriesId = "sp500" | "tbond" | "tbill" | "msci-world";

export interface HistoricalReturnYear {
  readonly year: number;
  readonly return: number; // decimal, e.g. 0.07 for 7%
}

export interface HistoricalReturnSeries {
  readonly id: HistoricalSeriesId;
  readonly label: string;
  readonly data: readonly HistoricalReturnYear[];
  readonly startYear: number;
  readonly endYear: number;
}

export interface BacktestParams {
  readonly initialBalance: number;
  readonly monthlyContribution: number;
  readonly yearsOfAccumulation: number;
  readonly drawdownYears: number;
  readonly seriesId: HistoricalSeriesId;
}

export interface CohortYearPoint {
  readonly yearIndex: number; // 0 = start of accumulation
  readonly portfolioValueReal: number;
}

export interface CohortResult {
  readonly startYear: number;
  readonly endYear: number;
  readonly trajectory: readonly CohortYearPoint[];
  readonly finalPortfolioReal: number;
  readonly monthlyIncomeReal: number;
}

export interface BacktestSummary {
  readonly seriesId: HistoricalSeriesId;
  readonly initialBalance: number;
  readonly totalCohorts: number;
  readonly yearsOfAccumulation: number;
  readonly drawdownYears: number;
  readonly best: CohortResult;
  readonly worst: CohortResult;
  readonly median: CohortResult;
  readonly percentileAboveDeposits: number; // 0-100
  readonly allCohorts: readonly CohortResult[];
}
