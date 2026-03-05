// Barrel exports for backtest engine module.
export type {
  HistoricalSeriesId,
  HistoricalReturnYear,
  HistoricalReturnSeries,
  BacktestParams,
  CohortYearPoint,
  CohortResult,
  BacktestSummary,
} from "./types";
export { simulateCohort, runBacktest } from "./simulation";
export {
  computeGeometricMean,
  sampleCohorts,
  computeBacktestSummary,
} from "./statistics";
