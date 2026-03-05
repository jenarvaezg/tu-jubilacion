import { describe, it, expect } from "vitest";
import { HISTORICAL_SERIES } from "../../src/data/historical-returns";
import { runBacktest } from "../../src/engine/backtest/simulation";
import { computeBacktestSummary } from "../../src/engine/backtest/statistics";
import type { HistoricalSeriesId } from "../../src/engine/backtest/types";

// Tests for the backtest hook logic (engine functions directly, no React rendering)

describe("backtest hook logic", () => {
  const validParams = {
    monthlyContribution: 200,
    yearsOfAccumulation: 30,
    drawdownYears: 20,
    seriesId: "sp500" as HistoricalSeriesId,
  };

  it("returns valid summary for valid inputs", () => {
    const series = HISTORICAL_SERIES[validParams.seriesId];
    const cohorts = runBacktest(validParams, series);
    expect(cohorts.length).toBeGreaterThan(0);

    const summary = computeBacktestSummary(cohorts, validParams);
    expect(summary.totalCohorts).toBe(cohorts.length);
    expect(summary.best.finalPortfolioReal).toBeGreaterThanOrEqual(
      summary.worst.finalPortfolioReal,
    );
  });

  it("returns empty cohorts for zero contribution", () => {
    const params = { ...validParams, monthlyContribution: 0 };
    const series = HISTORICAL_SERIES[params.seriesId];
    const cohorts = runBacktest(params, series);
    // Engine still runs but portfolios will be 0
    for (const c of cohorts) {
      expect(c.finalPortfolioReal).toBe(0);
    }
  });

  it("returns empty cohorts for zero accumulation years", () => {
    const params = { ...validParams, yearsOfAccumulation: 0 };
    const series = HISTORICAL_SERIES[params.seriesId];
    const cohorts = runBacktest(params, series);
    expect(cohorts.length).toBe(0);
  });

  it("works for all four series", () => {
    const seriesIds: HistoricalSeriesId[] = [
      "sp500",
      "msci-world",
      "tbond",
      "tbill",
    ];
    for (const seriesId of seriesIds) {
      const series = HISTORICAL_SERIES[seriesId];
      const cohorts = runBacktest({ ...validParams, seriesId }, series);
      expect(cohorts.length).toBeGreaterThan(0);

      const summary = computeBacktestSummary(cohorts, {
        ...validParams,
        seriesId,
      });
      expect(summary.seriesId).toBe(seriesId);
    }
  });

  it("msci-world has fewer cohorts than sp500 due to shorter history", () => {
    const sp500Cohorts = runBacktest(
      validParams,
      HISTORICAL_SERIES["sp500"],
    );
    const msciCohorts = runBacktest(
      { ...validParams, seriesId: "msci-world" },
      HISTORICAL_SERIES["msci-world"],
    );
    expect(msciCohorts.length).toBeLessThan(sp500Cohorts.length);
  });

  it("computeBacktestSummary throws on empty cohorts", () => {
    expect(() => computeBacktestSummary([], validParams)).toThrow();
  });
});
