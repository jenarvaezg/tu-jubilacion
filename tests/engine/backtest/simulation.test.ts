import { describe, it, expect } from "vitest";
import { simulateCohort, runBacktest } from "../../../src/engine/backtest/simulation";
import type { HistoricalReturnYear, HistoricalReturnSeries } from "../../../src/engine/backtest/types";

function makeSeries(
  returns: readonly number[],
  startYear = 2000,
): HistoricalReturnSeries {
  const data: HistoricalReturnYear[] = returns.map((r, i) => ({
    year: startYear + i,
    return: r,
  }));
  return {
    id: "sp500",
    label: "Test",
    data,
    startYear,
    endYear: startYear + returns.length - 1,
  };
}

describe("simulateCohort", () => {
  it("with 0% returns equals simple sum of contributions", () => {
    const returns: HistoricalReturnYear[] = Array.from({ length: 5 }, (_, i) => ({
      year: 2000 + i,
      return: 0,
    }));
    const result = simulateCohort({
      startIndex: 0,
      returns,
      monthlyContribution: 100,
      yearsOfAccumulation: 5,
      drawdownYears: 20,
      drawdownReturn: 0,
    });
    // 100 * 12 * 5 = 6000
    expect(result.finalPortfolioReal).toBeCloseTo(6000, 0);
    expect(result.startYear).toBe(2000);
    expect(result.endYear).toBe(2004);
    expect(result.trajectory).toHaveLength(6); // year 0 + 5 years
  });

  it("with known 2-year window produces correct result", () => {
    // Year 1: 10% return, contribute 1200 at year end
    // portfolio = 0 * 1.10 + 1200 = 1200
    // Year 2: 20% return, contribute 1200 at year end
    // portfolio = 1200 * 1.20 + 1200 = 2640
    const returns: HistoricalReturnYear[] = [
      { year: 2000, return: 0.10 },
      { year: 2001, return: 0.20 },
    ];
    const result = simulateCohort({
      startIndex: 0,
      returns,
      monthlyContribution: 100,
      yearsOfAccumulation: 2,
      drawdownYears: 20,
      drawdownReturn: 0,
    });
    expect(result.finalPortfolioReal).toBeCloseTo(2640, 0);
  });

  it("with 3-year window and consistent 5% return", () => {
    const returns: HistoricalReturnYear[] = [
      { year: 2000, return: 0.05 },
      { year: 2001, return: 0.05 },
      { year: 2002, return: 0.05 },
    ];
    const result = simulateCohort({
      startIndex: 0,
      returns,
      monthlyContribution: 500,
      yearsOfAccumulation: 3,
      drawdownYears: 20,
      drawdownReturn: 0,
    });
    // Year 1: 0 * 1.05 + 6000 = 6000
    // Year 2: 6000 * 1.05 + 6000 = 12300
    // Year 3: 12300 * 1.05 + 6000 = 18915
    expect(result.finalPortfolioReal).toBeCloseTo(18915, 0);
  });

  it("monthly income is computed for drawdown", () => {
    const returns: HistoricalReturnYear[] = [
      { year: 2000, return: 0.10 },
    ];
    const result = simulateCohort({
      startIndex: 0,
      returns,
      monthlyContribution: 1000,
      yearsOfAccumulation: 1,
      drawdownYears: 20,
      drawdownReturn: 0.02,
    });
    expect(result.monthlyIncomeReal).toBeGreaterThan(0);
    expect(result.finalPortfolioReal).toBeCloseTo(12000, 0);
  });

  it("trajectory includes year 0 with value 0", () => {
    const returns: HistoricalReturnYear[] = [
      { year: 2000, return: 0.05 },
    ];
    const result = simulateCohort({
      startIndex: 0,
      returns,
      monthlyContribution: 100,
      yearsOfAccumulation: 1,
      drawdownYears: 20,
      drawdownReturn: 0,
    });
    expect(result.trajectory[0]).toEqual({ yearIndex: 0, portfolioValueReal: 0 });
    expect(result.trajectory[1].yearIndex).toBe(1);
  });
});

describe("runBacktest", () => {
  it("with 10 years of data and 5 years accumulation produces 6 cohorts", () => {
    const series = makeSeries(Array(10).fill(0.05));
    const cohorts = runBacktest(
      { monthlyContribution: 100, yearsOfAccumulation: 5, drawdownYears: 20, seriesId: "sp500" },
      series,
    );
    expect(cohorts).toHaveLength(6); // 10 - 5 + 1 = 6
  });

  it("with empty data returns empty array", () => {
    const series = makeSeries([]);
    const cohorts = runBacktest(
      { monthlyContribution: 100, yearsOfAccumulation: 5, drawdownYears: 20, seriesId: "sp500" },
      series,
    );
    expect(cohorts).toHaveLength(0);
  });

  it("with accumulation longer than data returns empty array", () => {
    const series = makeSeries([0.05, 0.05, 0.05]);
    const cohorts = runBacktest(
      { monthlyContribution: 100, yearsOfAccumulation: 10, drawdownYears: 20, seriesId: "sp500" },
      series,
    );
    expect(cohorts).toHaveLength(0);
  });

  it("with 0 contribution returns empty array", () => {
    const series = makeSeries([0.05, 0.05, 0.05]);
    const cohorts = runBacktest(
      { monthlyContribution: 0, yearsOfAccumulation: 2, drawdownYears: 20, seriesId: "sp500" },
      series,
    );
    expect(cohorts).toHaveLength(0);
  });

  it("each cohort has a different start year", () => {
    const series = makeSeries([0.05, 0.10, 0.15, 0.20, 0.25], 2000);
    const cohorts = runBacktest(
      { monthlyContribution: 100, yearsOfAccumulation: 2, drawdownYears: 20, seriesId: "sp500" },
      series,
    );
    expect(cohorts).toHaveLength(4);
    expect(cohorts[0].startYear).toBe(2000);
    expect(cohorts[1].startYear).toBe(2001);
    expect(cohorts[2].startYear).toBe(2002);
    expect(cohorts[3].startYear).toBe(2003);
  });

  it("cohorts with different returns produce different final values", () => {
    const series = makeSeries([0.50, -0.50, 0.50, -0.50, 0.50]);
    const cohorts = runBacktest(
      { monthlyContribution: 100, yearsOfAccumulation: 2, drawdownYears: 20, seriesId: "sp500" },
      series,
    );
    // Cohort starting in a good year should differ from one starting in a bad year
    const values = cohorts.map((c) => c.finalPortfolioReal);
    expect(new Set(values).size).toBeGreaterThan(1);
  });
});
