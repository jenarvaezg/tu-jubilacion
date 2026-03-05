import { describe, it, expect } from "vitest";
import {
  computeGeometricMean,
  sampleCohorts,
  computeBacktestSummary,
} from "../../../src/engine/backtest/statistics";
import type { CohortResult } from "../../../src/engine/backtest/types";

function makeCohort(
  startYear: number,
  finalPortfolio: number,
  monthlyIncome: number = 100,
): CohortResult {
  return {
    startYear,
    endYear: startYear + 10,
    trajectory: [
      { yearIndex: 0, portfolioValueReal: 0 },
      { yearIndex: 10, portfolioValueReal: finalPortfolio },
    ],
    finalPortfolioReal: finalPortfolio,
    monthlyIncomeReal: monthlyIncome,
  };
}

describe("computeGeometricMean", () => {
  it("[0.10, -0.10] approximately equals -0.005", () => {
    const result = computeGeometricMean([0.1, -0.1]);
    expect(result).toBeCloseTo(-0.00504, 4);
  });

  it("empty array returns 0", () => {
    expect(computeGeometricMean([])).toBe(0);
  });
});

describe("sampleCohorts", () => {
  const cohorts = Array.from({ length: 20 }, (_, index) =>
    makeCohort(2000 + index, (index + 1) * 10000),
  );

  it("returns all when maxLines >= length", () => {
    expect(sampleCohorts(cohorts, 30)).toHaveLength(20);
  });

  it("always includes first and last cohort", () => {
    const sampled = sampleCohorts(cohorts, 5);
    expect(sampled[0].startYear).toBe(2000);
    expect(sampled[sampled.length - 1].startYear).toBe(2019);
  });

  it("never exceeds 25 lines for chart rendering", () => {
    const largeCohorts = Array.from({ length: 80 }, (_, index) =>
      makeCohort(1940 + index, (index + 1) * 5000),
    );
    const sampled = sampleCohorts(largeCohorts, 25);
    expect(sampled.length).toBeLessThanOrEqual(25);
  });
});

describe("computeBacktestSummary", () => {
  it("best >= median >= worst by finalPortfolioReal", () => {
    const cohorts = [
      makeCohort(2000, 50000),
      makeCohort(2001, 100000),
      makeCohort(2002, 75000),
      makeCohort(2003, 200000),
      makeCohort(2004, 30000),
    ];
    const summary = computeBacktestSummary(cohorts, {
      initialBalance: 10000,
      monthlyContribution: 100,
      yearsOfAccumulation: 10,
      drawdownYears: 20,
      seriesId: "sp500",
    });

    expect(summary.initialBalance).toBe(10000);
    expect(summary.best.finalPortfolioReal).toBeGreaterThanOrEqual(
      summary.median.finalPortfolioReal,
    );
    expect(summary.median.finalPortfolioReal).toBeGreaterThanOrEqual(
      summary.worst.finalPortfolioReal,
    );
  });

  it("percentileAboveDeposits uses initial balance plus contributions", () => {
    const cohorts = [
      makeCohort(2000, 25000),
      makeCohort(2001, 30000),
      makeCohort(2002, 15000),
    ];
    const summary = computeBacktestSummary(cohorts, {
      initialBalance: 10000,
      monthlyContribution: 100,
      yearsOfAccumulation: 10,
      drawdownYears: 20,
      seriesId: "sp500",
    });

    expect(summary.percentileAboveDeposits).toBeCloseTo(66.67, 2);
  });

  it("throws on empty cohorts", () => {
    expect(() =>
      computeBacktestSummary([], {
        initialBalance: 0,
        monthlyContribution: 100,
        yearsOfAccumulation: 10,
        drawdownYears: 20,
        seriesId: "sp500",
      }),
    ).toThrow();
  });
});
