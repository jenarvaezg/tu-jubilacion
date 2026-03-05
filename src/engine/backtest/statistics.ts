// Backtest statistics: aggregation, geometric mean, sampling, percentiles.
// All functions are pure with zero side effects.
import type { CohortResult, BacktestSummary, BacktestParams } from "./types";

export function computeGeometricMean(returns: readonly number[]): number {
  if (returns.length === 0) return 0;

  const logSum = returns.reduce((sum, r) => sum + Math.log(1 + r), 0);
  return Math.exp(logSum / returns.length) - 1;
}

export function sampleCohorts(
  allCohorts: readonly CohortResult[],
  maxLines: number,
): readonly CohortResult[] {
  if (allCohorts.length <= maxLines) return allCohorts;
  if (maxLines <= 0) return [];
  if (maxLines === 1) return [allCohorts[0]];
  if (maxLines === 2) return [allCohorts[0], allCohorts[allCohorts.length - 1]];

  const result: CohortResult[] = [allCohorts[0]];
  const step = (allCohorts.length - 1) / (maxLines - 1);

  for (let i = 1; i < maxLines - 1; i++) {
    const index = Math.round(i * step);
    result.push(allCohorts[index]);
  }

  result.push(allCohorts[allCohorts.length - 1]);
  return result;
}

export function computeBacktestSummary(
  cohorts: readonly CohortResult[],
  params: BacktestParams,
): BacktestSummary {
  if (cohorts.length === 0) {
    throw new Error("Cannot compute summary from empty cohorts array");
  }

  const sorted = [...cohorts].sort(
    (a, b) => a.finalPortfolioReal - b.finalPortfolioReal,
  );

  const worst = sorted[0];
  const best = sorted[sorted.length - 1];
  const medianIndex = Math.floor((sorted.length - 1) / 2);
  const median = sorted[medianIndex];

  const depositsFV =
    Math.max(0, params.initialBalance) +
    params.monthlyContribution * 12 * params.yearsOfAccumulation;

  const cohortsAboveDeposits = cohorts.filter(
    (c) => c.finalPortfolioReal > depositsFV,
  ).length;
  const percentileAboveDeposits =
    Math.round((cohortsAboveDeposits / cohorts.length) * 10000) / 100;

  return {
    seriesId: params.seriesId,
    initialBalance: Math.max(0, params.initialBalance),
    totalCohorts: cohorts.length,
    yearsOfAccumulation: params.yearsOfAccumulation,
    drawdownYears: params.drawdownYears,
    best,
    worst,
    median,
    percentileAboveDeposits,
    allCohorts: cohorts,
  };
}
