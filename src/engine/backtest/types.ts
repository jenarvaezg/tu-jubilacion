// Backtest domain types for Phase 3.
// All types are immutable (readonly) and shared across engine and UI.

// Single source of truth for historical series identifiers.
export type HistoricalSeriesId = "sp500" | "tbond" | "tbill" | "msci-world";

// One year of historical return data.
export interface HistoricalReturnYear {
  readonly year: number;
  readonly return: number; // decimal, e.g. 0.07 for 7%
}

// A complete historical return series.
export interface HistoricalReturnSeries {
  readonly id: HistoricalSeriesId;
  readonly label: string;
  readonly data: readonly HistoricalReturnYear[];
  readonly startYear: number;
  readonly endYear: number;
}

// Input parameters for a backtest run.
export interface BacktestParams {
  readonly monthlyContribution: number;
  readonly yearsOfAccumulation: number;
  readonly drawdownYears: number;
  readonly seriesId: HistoricalSeriesId;
}

// One year of a single cohort trajectory.
export interface CohortYearPoint {
  readonly yearIndex: number; // 0 = start of accumulation
  readonly portfolioValueReal: number;
}

// Complete trajectory for one starting year.
export interface CohortResult {
  readonly startYear: number;
  readonly endYear: number;
  readonly trajectory: readonly CohortYearPoint[];
  readonly finalPortfolioReal: number;
  readonly monthlyIncomeReal: number;
}

// Aggregated statistics across all cohorts.
export interface BacktestSummary {
  readonly seriesId: HistoricalSeriesId;
  readonly totalCohorts: number;
  readonly yearsOfAccumulation: number;
  readonly drawdownYears: number;
  readonly best: CohortResult;
  readonly worst: CohortResult;
  readonly median: CohortResult;
  readonly percentileAboveDeposits: number; // 0-100
  readonly allCohorts: readonly CohortResult[];
}
