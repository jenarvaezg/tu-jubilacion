import { describe, it, expect } from "vitest";
import { simulateCohort, runBacktest } from "../../../src/engine/backtest/simulation";
import type {
  HistoricalReturnYear,
  HistoricalReturnSeries,
} from "../../../src/engine/backtest/types";

function makeSeries(
  returns: readonly number[],
  startYear = 2000,
): HistoricalReturnSeries {
  const data: HistoricalReturnYear[] = returns.map((value, index) => ({
    year: startYear + index,
    return: value,
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
  it("with 0% returns equals initial balance plus simple contributions", () => {
    const returns: HistoricalReturnYear[] = Array.from({ length: 5 }, (_, index) => ({
      year: 2000 + index,
      return: 0,
    }));
    const result = simulateCohort({
      startIndex: 0,
      returns,
      initialBalance: 5000,
      monthlyContribution: 100,
      yearsOfAccumulation: 5,
      drawdownYears: 20,
      drawdownReturn: 0,
    });

    expect(result.finalPortfolioReal).toBeCloseTo(11000, 0);
    expect(result.trajectory[0]).toEqual({
      yearIndex: 0,
      portfolioValueReal: 5000,
    });
  });

  it("with known 2-year window produces correct result", () => {
    const returns: HistoricalReturnYear[] = [
      { year: 2000, return: 0.1 },
      { year: 2001, return: 0.2 },
    ];
    const result = simulateCohort({
      startIndex: 0,
      returns,
      initialBalance: 1000,
      monthlyContribution: 100,
      yearsOfAccumulation: 2,
      drawdownYears: 20,
      drawdownReturn: 0,
    });

    expect(result.finalPortfolioReal).toBeCloseTo(3960, 0);
  });

  it("monthly income is computed for drawdown", () => {
    const returns: HistoricalReturnYear[] = [{ year: 2000, return: 0.1 }];
    const result = simulateCohort({
      startIndex: 0,
      returns,
      initialBalance: 12000,
      monthlyContribution: 0,
      yearsOfAccumulation: 1,
      drawdownYears: 20,
      drawdownReturn: 0.02,
    });

    expect(result.monthlyIncomeReal).toBeGreaterThan(0);
    expect(result.finalPortfolioReal).toBeCloseTo(13200, 0);
  });
});

describe("runBacktest", () => {
  it("with 10 years of data and 5 years accumulation produces 6 cohorts", () => {
    const series = makeSeries(Array(10).fill(0.05));
    const cohorts = runBacktest(
      {
        initialBalance: 0,
        monthlyContribution: 100,
        yearsOfAccumulation: 5,
        drawdownYears: 20,
        seriesId: "sp500",
      },
      series,
    );
    expect(cohorts).toHaveLength(6);
  });

  it("with only initial balance still produces cohorts", () => {
    const series = makeSeries(Array(5).fill(0.05));
    const cohorts = runBacktest(
      {
        initialBalance: 10000,
        monthlyContribution: 0,
        yearsOfAccumulation: 3,
        drawdownYears: 20,
        seriesId: "sp500",
      },
      series,
    );
    expect(cohorts).toHaveLength(3);
  });

  it("with no contribution and no initial balance returns empty array", () => {
    const series = makeSeries([0.05, 0.05, 0.05]);
    const cohorts = runBacktest(
      {
        initialBalance: 0,
        monthlyContribution: 0,
        yearsOfAccumulation: 2,
        drawdownYears: 20,
        seriesId: "sp500",
      },
      series,
    );
    expect(cohorts).toHaveLength(0);
  });

  it("each cohort has a different start year", () => {
    const series = makeSeries([0.05, 0.1, 0.15, 0.2, 0.25], 2000);
    const cohorts = runBacktest(
      {
        initialBalance: 0,
        monthlyContribution: 100,
        yearsOfAccumulation: 2,
        drawdownYears: 20,
        seriesId: "sp500",
      },
      series,
    );

    expect(cohorts).toHaveLength(4);
    expect(cohorts[0].startYear).toBe(2000);
    expect(cohorts[3].startYear).toBe(2003);
  });
});
