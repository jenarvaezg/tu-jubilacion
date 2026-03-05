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
    // (1.10 * 0.90)^(1/2) - 1 = 0.99^0.5 - 1 ≈ -0.00504
    expect(result).toBeCloseTo(-0.00504, 4);
  });

  it("[0.05, 0.05, 0.05] equals 0.05", () => {
    const result = computeGeometricMean([0.05, 0.05, 0.05]);
    expect(result).toBeCloseTo(0.05, 6);
  });

  it("empty array returns 0", () => {
    expect(computeGeometricMean([])).toBe(0);
  });

  it("single value returns that value", () => {
    expect(computeGeometricMean([0.07])).toBeCloseTo(0.07, 6);
  });

  it("geometric mean is less than arithmetic mean for mixed returns", () => {
    const returns = [0.2, -0.1, 0.15, -0.05];
    const geoMean = computeGeometricMean(returns);
    const arithMean = returns.reduce((a, b) => a + b, 0) / returns.length;
    expect(geoMean).toBeLessThan(arithMean);
  });
});

describe("sampleCohorts", () => {
  const cohorts = Array.from({ length: 20 }, (_, i) =>
    makeCohort(2000 + i, (i + 1) * 10000),
  );

  it("returns all when maxLines >= length", () => {
    expect(sampleCohorts(cohorts, 30)).toHaveLength(20);
    expect(sampleCohorts(cohorts, 20)).toHaveLength(20);
  });

  it("returns exactly maxLines when smaller", () => {
    expect(sampleCohorts(cohorts, 5)).toHaveLength(5);
    expect(sampleCohorts(cohorts, 10)).toHaveLength(10);
  });

  it("always includes first and last cohort", () => {
    const sampled = sampleCohorts(cohorts, 5);
    expect(sampled[0].startYear).toBe(2000);
    expect(sampled[sampled.length - 1].startYear).toBe(2019);
  });

  it("returns empty for maxLines 0", () => {
    expect(sampleCohorts(cohorts, 0)).toHaveLength(0);
  });

  it("returns single element for maxLines 1", () => {
    const sampled = sampleCohorts(cohorts, 1);
    expect(sampled).toHaveLength(1);
    expect(sampled[0].startYear).toBe(2000);
  });

  it("returns first and last for maxLines 2", () => {
    const sampled = sampleCohorts(cohorts, 2);
    expect(sampled).toHaveLength(2);
    expect(sampled[0].startYear).toBe(2000);
    expect(sampled[1].startYear).toBe(2019);
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
      monthlyContribution: 100,
      yearsOfAccumulation: 10,
      drawdownYears: 20,
      seriesId: "sp500",
    });
    expect(summary.best.finalPortfolioReal).toBeGreaterThanOrEqual(
      summary.median.finalPortfolioReal,
    );
    expect(summary.median.finalPortfolioReal).toBeGreaterThanOrEqual(
      summary.worst.finalPortfolioReal,
    );
  });

  it("single cohort: best = worst = median", () => {
    const cohorts = [makeCohort(2000, 100000)];
    const summary = computeBacktestSummary(cohorts, {
      monthlyContribution: 100,
      yearsOfAccumulation: 10,
      drawdownYears: 20,
      seriesId: "sp500",
    });
    expect(summary.best.startYear).toBe(summary.worst.startYear);
    expect(summary.median.startYear).toBe(summary.worst.startYear);
  });

  it("percentileAboveDeposits is 100% when all beat deposits", () => {
    // monthlyContribution=100, 10 years: deposits FV = 100*12*10 = 12000
    const cohorts = [
      makeCohort(2000, 20000),
      makeCohort(2001, 30000),
      makeCohort(2002, 25000),
    ];
    const summary = computeBacktestSummary(cohorts, {
      monthlyContribution: 100,
      yearsOfAccumulation: 10,
      drawdownYears: 20,
      seriesId: "sp500",
    });
    expect(summary.percentileAboveDeposits).toBe(100);
  });

  it("percentileAboveDeposits is 0% when none beat deposits", () => {
    // deposits FV = 100*12*10 = 12000
    const cohorts = [
      makeCohort(2000, 5000),
      makeCohort(2001, 8000),
      makeCohort(2002, 10000),
    ];
    const summary = computeBacktestSummary(cohorts, {
      monthlyContribution: 100,
      yearsOfAccumulation: 10,
      drawdownYears: 20,
      seriesId: "sp500",
    });
    expect(summary.percentileAboveDeposits).toBe(0);
  });

  it("totalCohorts matches input length", () => {
    const cohorts = [makeCohort(2000, 50000), makeCohort(2001, 100000)];
    const summary = computeBacktestSummary(cohorts, {
      monthlyContribution: 100,
      yearsOfAccumulation: 10,
      drawdownYears: 20,
      seriesId: "sp500",
    });
    expect(summary.totalCohorts).toBe(2);
    expect(summary.seriesId).toBe("sp500");
  });

  it("median picks lower-middle for even cohort count", () => {
    const cohorts = [
      makeCohort(2000, 10000),
      makeCohort(2001, 20000),
      makeCohort(2002, 30000),
      makeCohort(2003, 40000),
    ];
    const summary = computeBacktestSummary(cohorts, {
      monthlyContribution: 100,
      yearsOfAccumulation: 10,
      drawdownYears: 20,
      seriesId: "sp500",
    });
    // 4 cohorts sorted: 10k, 20k, 30k, 40k
    // lower-middle index = floor((4-1)/2) = 1 → 20000
    expect(summary.median.finalPortfolioReal).toBe(20000);
  });

  it("throws on empty cohorts", () => {
    expect(() =>
      computeBacktestSummary([], {
        monthlyContribution: 100,
        yearsOfAccumulation: 10,
        drawdownYears: 20,
        seriesId: "sp500",
      }),
    ).toThrow();
  });
});
