import { describe, it, expect } from "vitest";
import {
  futureValueLumpSum,
  futureValueMonthly,
  monthlyIncomeFromPortfolio,
  requiredMonthlySavings,
  deriveDrawdownYears,
  calculateSavings,
  generatePortfolioTimeline,
} from "../../../src/engine/savings/portfolio";

describe("futureValueLumpSum", () => {
  it("returns 0 for 0 principal", () => {
    expect(futureValueLumpSum(0, 0.05, 20)).toBe(0);
  });

  it("returns the same principal for 0 years", () => {
    expect(futureValueLumpSum(10000, 0.05, 0)).toBe(10000);
  });

  it("grows a lump sum at the annual real return", () => {
    const fv = futureValueLumpSum(10000, 0.05, 10);
    expect(fv).toBeCloseTo(10000 * Math.pow(1.05, 10), 4);
  });
});

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
    const fv = futureValueMonthly(100, 0.05, 30);
    expect(fv).toBeGreaterThan(80000);
    expect(fv).toBeLessThan(86000);
  });
});

describe("monthlyIncomeFromPortfolio", () => {
  it("returns 0 for 0 portfolio", () => {
    expect(monthlyIncomeFromPortfolio(0, 25, 0.02)).toBe(0);
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

  it("returns 0 when current savings already cover the need", () => {
    const result = requiredMonthlySavings(500, 30, 25, 0.04, 0.02, 500000);
    expect(result).toBe(0);
  });

  it("requires less monthly saving when current savings exist", () => {
    const withoutBase = requiredMonthlySavings(500, 30, 25, 0.04, 0.02, 0);
    const withBase = requiredMonthlySavings(500, 30, 25, 0.04, 0.02, 50000);
    expect(withBase).toBeLessThan(withoutBase);
  });

  it("round-trips with accumulated contributions and existing savings", () => {
    const targetIncome = 500;
    const accYears = 30;
    const drawdownYears = 25;
    const accReturn = 0.04;
    const drawdownReturn = 0.02;
    const currentSavingsBalance = 30000;

    const savings = requiredMonthlySavings(
      targetIncome,
      accYears,
      drawdownYears,
      accReturn,
      drawdownReturn,
      currentSavingsBalance,
    );

    const portfolio =
      futureValueLumpSum(currentSavingsBalance, accReturn, accYears) +
      futureValueMonthly(savings, accReturn, accYears);
    const income = monthlyIncomeFromPortfolio(
      portfolio,
      drawdownYears,
      drawdownReturn,
    );

    expect(income).toBeCloseTo(targetIncome, 0);
  });
});

describe("deriveDrawdownYears", () => {
  it("derives reasonable drawdown for 35yo retiring at 67", () => {
    const years = deriveDrawdownYears(67, 35, 2026);
    expect(years).toBeGreaterThanOrEqual(19);
    expect(years).toBeLessThanOrEqual(25);
  });

  it("early retirement gives more drawdown years than late retirement", () => {
    const early = deriveDrawdownYears(63, 35, 2026);
    const late = deriveDrawdownYears(70, 35, 2026);
    expect(early).toBeGreaterThan(late);
  });
});

describe("calculateSavings", () => {
  it("auto-calculates contribution when override is null", () => {
    const result = calculateSavings({
      requiredMonthlyIncome: 300,
      currentSavingsBalance: 20000,
      weightedRealReturn: 0.04,
      currentAge: 35,
      retirementAge: 67,
      drawdownYears: 22,
      profileId: "moderate",
      monthlyContributionOverride: null,
    });

    expect(result.monthlyContribution).toBeGreaterThanOrEqual(0);
    expect(result.currentSavingsAtRetirement).toBeGreaterThan(20000);
    expect(result.portfolioAtRetirement).toBeGreaterThanOrEqual(
      result.currentSavingsAtRetirement,
    );
    expect(result.monthlyIncomeFromPortfolio).toBeGreaterThan(0);
    expect(result.yearsOfAccumulation).toBe(32);
  });

  it("uses override when provided", () => {
    const result = calculateSavings({
      requiredMonthlyIncome: 300,
      currentSavingsBalance: 10000,
      weightedRealReturn: 0.04,
      currentAge: 35,
      retirementAge: 67,
      drawdownYears: 22,
      profileId: "moderate",
      monthlyContributionOverride: 150,
    });

    expect(result.monthlyContribution).toBe(150);
    expect(result.currentSavingsBalance).toBe(10000);
  });

  it("returns zero contribution for zero required income", () => {
    const result = calculateSavings({
      requiredMonthlyIncome: 0,
      currentSavingsBalance: 0,
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
    currentSavingsBalance: 15000,
    weightedRealReturn: 0.04,
    currentAge: 35,
    retirementAge: 67,
    drawdownYears: 22,
    ipcRate: 0.02,
    currentYear: 2026,
  };

  it("starts at current age and ends at retirement plus drawdown", () => {
    const timeline = generatePortfolioTimeline(params);
    expect(timeline[0].age).toBe(35);
    expect(timeline[timeline.length - 1].age).toBe(89);
  });

  it("starts with the current savings balance", () => {
    const timeline = generatePortfolioTimeline(params);
    expect(timeline[0].portfolioValueReal).toBe(15000);
  });

  it("portfolio grows during accumulation phase", () => {
    const timeline = generatePortfolioTimeline(params);
    const atAge40 = timeline.find((point) => point.age === 40)!;
    const atAge60 = timeline.find((point) => point.age === 60)!;
    expect(atAge60.portfolioValueReal).toBeGreaterThan(
      atAge40.portfolioValueReal,
    );
  });

  it("has positive income during drawdown", () => {
    const timeline = generatePortfolioTimeline(params);
    const atAge70 = timeline.find((point) => point.age === 70)!;
    expect(atAge70.monthlyIncomeReal).toBeGreaterThan(0);
  });

  it("portfolio depletes at end of drawdown", () => {
    const timeline = generatePortfolioTimeline(params);
    const last = timeline[timeline.length - 1];
    expect(last.portfolioValueReal).toBeCloseTo(0, 0);
  });
});
