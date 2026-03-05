import { describe, it, expect } from "vitest";
import {
  futureValueMonthly,
  monthlyIncomeFromPortfolio,
  requiredMonthlySavings,
  deriveDrawdownYears,
  calculateSavings,
  generatePortfolioTimeline,
} from "../../../src/engine/savings/portfolio";

describe("futureValueMonthly", () => {
  it("returns 0 for 0 contribution", () => {
    expect(futureValueMonthly(0, 0.05, 30)).toBe(0);
  });

  it("returns 0 for 0 years", () => {
    expect(futureValueMonthly(100, 0.05, 0)).toBe(0);
  });

  it("returns simple sum for 0% return", () => {
    expect(futureValueMonthly(100, 0, 10)).toBeCloseTo(12000, 0);
  });

  it("matches known FV for 100 EUR/month at 5% for 30 years", () => {
    // Known value: ~83,226 EUR (FV of ordinary annuity)
    const fv = futureValueMonthly(100, 0.05, 30);
    expect(fv).toBeGreaterThan(80000);
    expect(fv).toBeLessThan(86000);
  });

  it("matches known FV for 200 EUR/month at 5% for 20 years", () => {
    const fv = futureValueMonthly(200, 0.05, 20);
    // ~82,207 EUR
    expect(fv).toBeGreaterThan(79000);
    expect(fv).toBeLessThan(85000);
  });

  it("scales linearly with contribution", () => {
    const fv100 = futureValueMonthly(100, 0.05, 20);
    const fv200 = futureValueMonthly(200, 0.05, 20);
    expect(fv200).toBeCloseTo(fv100 * 2, 0);
  });
});

describe("monthlyIncomeFromPortfolio", () => {
  it("returns 0 for 0 portfolio", () => {
    expect(monthlyIncomeFromPortfolio(0, 25, 0.02)).toBe(0);
  });

  it("returns 0 for 0 drawdown years", () => {
    expect(monthlyIncomeFromPortfolio(100000, 0, 0.02)).toBe(0);
  });

  it("returns simple division for 0% return", () => {
    const income = monthlyIncomeFromPortfolio(120000, 10, 0);
    expect(income).toBeCloseTo(1000, 0);
  });

  it("returns higher income with return than without", () => {
    const noReturn = monthlyIncomeFromPortfolio(100000, 20, 0);
    const withReturn = monthlyIncomeFromPortfolio(100000, 20, 0.02);
    expect(withReturn).toBeGreaterThan(noReturn);
  });
});

describe("requiredMonthlySavings", () => {
  it("returns 0 for 0 target income", () => {
    expect(requiredMonthlySavings(0, 30, 25, 0.05, 0.02)).toBe(0);
  });

  it("returns 0 for 0 accumulation years", () => {
    expect(requiredMonthlySavings(500, 0, 25, 0.05, 0.02)).toBe(0);
  });

  it("round-trips: savings -> portfolio -> income matches target", () => {
    const targetIncome = 500;
    const accYears = 30;
    const drawdownYears = 25;
    const accReturn = 0.04;
    const drawdownReturn = 0.02;

    const savings = requiredMonthlySavings(
      targetIncome,
      accYears,
      drawdownYears,
      accReturn,
      drawdownReturn,
    );

    const portfolio = futureValueMonthly(savings, accReturn, accYears);
    const income = monthlyIncomeFromPortfolio(
      portfolio,
      drawdownYears,
      drawdownReturn,
    );

    expect(income).toBeCloseTo(targetIncome, 0);
  });

  it("higher target requires more savings", () => {
    const low = requiredMonthlySavings(200, 30, 25, 0.04, 0.02);
    const high = requiredMonthlySavings(400, 30, 25, 0.04, 0.02);
    expect(high).toBeGreaterThan(low);
    expect(high).toBeCloseTo(low * 2, 0);
  });

  it("more accumulation years means less savings needed", () => {
    const short = requiredMonthlySavings(500, 20, 25, 0.04, 0.02);
    const long = requiredMonthlySavings(500, 35, 25, 0.04, 0.02);
    expect(long).toBeLessThan(short);
  });
});

describe("deriveDrawdownYears", () => {
  it("derives reasonable drawdown for 35yo retiring at 67", () => {
    const years = deriveDrawdownYears(67, 35, 2026);
    // Retirement in 2058, LE65 ~ 23.55, drawdown = 23.55 + (65-67) = 21.55 -> 22
    expect(years).toBeGreaterThanOrEqual(19);
    expect(years).toBeLessThanOrEqual(25);
  });

  it("early retirement (63) gives more drawdown years than late (70)", () => {
    const early = deriveDrawdownYears(63, 35, 2026);
    const late = deriveDrawdownYears(70, 35, 2026);
    expect(early).toBeGreaterThan(late);
  });

  it("returns at least 5 years", () => {
    const years = deriveDrawdownYears(70, 68, 2026);
    expect(years).toBeGreaterThanOrEqual(5);
  });
});

describe("calculateSavings", () => {
  it("auto-calculates contribution when override is null", () => {
    const result = calculateSavings({
      gapMonthly: 300,
      weightedRealReturn: 0.04,
      currentAge: 35,
      retirementAge: 67,
      drawdownYears: 22,
      profileId: "moderate",
      monthlyContributionOverride: null,
    });

    expect(result.monthlyContribution).toBeGreaterThan(0);
    expect(result.portfolioAtRetirement).toBeGreaterThan(0);
    expect(result.monthlyIncomeFromPortfolio).toBeGreaterThan(0);
    expect(result.yearsOfAccumulation).toBe(32);
    expect(result.profileId).toBe("moderate");
  });

  it("uses override when provided", () => {
    const result = calculateSavings({
      gapMonthly: 300,
      weightedRealReturn: 0.04,
      currentAge: 35,
      retirementAge: 67,
      drawdownYears: 22,
      profileId: "moderate",
      monthlyContributionOverride: 150,
    });

    expect(result.monthlyContribution).toBe(150);
  });

  it("handles zero gap", () => {
    const result = calculateSavings({
      gapMonthly: 0,
      weightedRealReturn: 0.04,
      currentAge: 35,
      retirementAge: 67,
      drawdownYears: 22,
      profileId: "moderate",
      monthlyContributionOverride: null,
    });

    expect(result.monthlyContribution).toBe(0);
  });
});

describe("generatePortfolioTimeline", () => {
  const params = {
    monthlyContribution: 200,
    weightedRealReturn: 0.04,
    currentAge: 35,
    retirementAge: 67,
    drawdownYears: 22,
    ipcRate: 0.02,
    currentYear: 2026,
  };

  it("starts at current age and ends at retirement + drawdown", () => {
    const timeline = generatePortfolioTimeline(params);
    expect(timeline[0].age).toBe(35);
    expect(timeline[timeline.length - 1].age).toBe(67 + 22);
  });

  it("portfolio grows during accumulation phase", () => {
    const timeline = generatePortfolioTimeline(params);
    const atAge40 = timeline.find((p) => p.age === 40)!;
    const atAge60 = timeline.find((p) => p.age === 60)!;
    expect(atAge60.portfolioValueReal).toBeGreaterThan(
      atAge40.portfolioValueReal,
    );
  });

  it("has zero income during accumulation", () => {
    const timeline = generatePortfolioTimeline(params);
    const atAge40 = timeline.find((p) => p.age === 40)!;
    expect(atAge40.monthlyIncomeReal).toBe(0);
  });

  it("has positive income during drawdown", () => {
    const timeline = generatePortfolioTimeline(params);
    const atAge70 = timeline.find((p) => p.age === 70)!;
    expect(atAge70.monthlyIncomeReal).toBeGreaterThan(0);
  });

  it("portfolio depletes at end of drawdown", () => {
    const timeline = generatePortfolioTimeline(params);
    const last = timeline[timeline.length - 1];
    expect(last.portfolioValueReal).toBeCloseTo(0, 0);
  });

  it("nominal values are higher than real values for future years", () => {
    const timeline = generatePortfolioTimeline(params);
    const atAge50 = timeline.find((p) => p.age === 50)!;
    expect(atAge50.portfolioValueNominal).toBeGreaterThan(
      atAge50.portfolioValueReal,
    );
  });
});
