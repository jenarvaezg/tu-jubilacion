// Backtest simulation: run historical cohort simulations for all valid starting years.
// All functions are pure with zero side effects.
import type {
  HistoricalReturnYear,
  CohortYearPoint,
  CohortResult,
  BacktestParams,
} from "./types";
import type { HistoricalReturnSeries } from "./types";
import { monthlyIncomeFromPortfolio } from "../savings/portfolio";
import { computeGeometricMean } from "./statistics";

/**
 * Simulate a single cohort starting at a given year index in the returns array.
 * Uses annual compounding with year-end contributions:
 *   portfolio_year = portfolio_prev * (1 + return) + (monthlyContribution * 12)
 */
export function simulateCohort(params: {
  readonly startIndex: number;
  readonly returns: readonly HistoricalReturnYear[];
  readonly initialBalance: number;
  readonly monthlyContribution: number;
  readonly yearsOfAccumulation: number;
  readonly drawdownYears: number;
  readonly drawdownReturn: number;
}): CohortResult {
  const {
    startIndex,
    returns,
    initialBalance,
    monthlyContribution,
    yearsOfAccumulation,
    drawdownYears,
    drawdownReturn,
  } = params;

  const annualContribution = monthlyContribution * 12;
  const normalizedInitialBalance = Math.max(0, initialBalance);
  const trajectory: CohortYearPoint[] = [];
  let portfolio = normalizedInitialBalance;

  trajectory.push({
    yearIndex: 0,
    portfolioValueReal: Math.round(normalizedInitialBalance * 100) / 100,
  });

  for (let i = 0; i < yearsOfAccumulation; i++) {
    const yearReturn = returns[startIndex + i].return;
    portfolio = portfolio * (1 + yearReturn) + annualContribution;
    trajectory.push({
      yearIndex: i + 1,
      portfolioValueReal: Math.round(portfolio * 100) / 100,
    });
  }

  const finalPortfolio = Math.max(0, portfolio);
  const monthlyIncome = monthlyIncomeFromPortfolio(
    finalPortfolio,
    drawdownYears,
    drawdownReturn,
  );

  return {
    startYear: returns[startIndex].year,
    endYear: returns[startIndex + yearsOfAccumulation - 1].year,
    trajectory,
    finalPortfolioReal: Math.round(finalPortfolio * 100) / 100,
    monthlyIncomeReal: Math.round(monthlyIncome * 100) / 100,
  };
}

/**
 * Run backtests for all valid starting years in a historical series.
 * A valid starting year has enough data for the full accumulation period.
 */
export function runBacktest(
  params: BacktestParams,
  series: HistoricalReturnSeries,
): readonly CohortResult[] {
  const {
    initialBalance,
    monthlyContribution,
    yearsOfAccumulation,
    drawdownYears,
  } = params;
  const returns = series.data;

  if (
    returns.length === 0 ||
    yearsOfAccumulation <= 0 ||
    drawdownYears <= 0 ||
    (monthlyContribution <= 0 && initialBalance <= 0)
  ) {
    return [];
  }

  if (yearsOfAccumulation > returns.length) {
    return [];
  }

  const returnValues = returns.map((r) => r.return);
  const geoMean = computeGeometricMean(returnValues);
  const drawdownReturn = Math.max(0, geoMean * 0.5);

  const cohorts: CohortResult[] = [];
  const maxStartIndex = returns.length - yearsOfAccumulation;

  for (let i = 0; i <= maxStartIndex; i++) {
    cohorts.push(
      simulateCohort({
        startIndex: i,
        returns,
        initialBalance,
        monthlyContribution,
        yearsOfAccumulation,
        drawdownYears,
        drawdownReturn,
      }),
    );
  }

  return cohorts;
}
