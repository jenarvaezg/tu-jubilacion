import { useMemo } from "react";
import type {
  HistoricalSeriesId,
  BacktestSummary,
} from "../engine/backtest/types";
import { HISTORICAL_SERIES } from "../data/historical-returns";
import { runBacktest } from "../engine/backtest/simulation";
import { computeBacktestSummary } from "../engine/backtest/statistics";

export interface BacktestCalculationResult {
  readonly summary: BacktestSummary | null;
  readonly error: string | null;
}

export function useBacktestCalculation(params: {
  readonly initialBalance: number;
  readonly monthlyContribution: number;
  readonly yearsOfAccumulation: number;
  readonly drawdownYears: number;
  readonly seriesId: HistoricalSeriesId;
}): BacktestCalculationResult {
  const {
    initialBalance,
    monthlyContribution,
    yearsOfAccumulation,
    drawdownYears,
    seriesId,
  } = params;

  return useMemo(() => {
    try {
      if (
        yearsOfAccumulation <= 0 ||
        drawdownYears <= 0 ||
        (monthlyContribution <= 0 && initialBalance <= 0)
      ) {
        return { summary: null, error: null };
      }

      const series = HISTORICAL_SERIES[seriesId];
      const backtestParams = {
        initialBalance,
        monthlyContribution,
        yearsOfAccumulation,
        drawdownYears,
        seriesId,
      };

      const cohorts = runBacktest(backtestParams, series);
      if (cohorts.length === 0) {
        return { summary: null, error: null };
      }

      const summary = computeBacktestSummary(cohorts, backtestParams);
      return { summary, error: null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error en el calculo del backtest";
      return { summary: null, error: message };
    }
  }, [initialBalance, monthlyContribution, yearsOfAccumulation, drawdownYears, seriesId]);
}
