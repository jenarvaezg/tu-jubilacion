import { describe, it, expect } from "vitest";
import { generateComparisonTimeline } from "../../../src/engine/savings/comparison";
import { ASSET_CLASS_RETURNS } from "../../../src/data/investment-profiles";

describe("generateComparisonTimeline", () => {
  const params = {
    monthlyContribution: 200,
    currentSavingsBalance: 10000,
    currentAge: 35,
    retirementAge: 67,
    assetReturns: ASSET_CLASS_RETURNS,
    ipcRate: 0.02,
    currentYear: 2026,
  };

  it("spans from current age to retirement age", () => {
    const timeline = generateComparisonTimeline(params);
    expect(timeline[0].age).toBe(35);
    expect(timeline[timeline.length - 1].age).toBe(67);
    expect(timeline.length).toBe(67 - 35 + 1);
  });

  it("starts with current savings balance in all asset classes", () => {
    const timeline = generateComparisonTimeline(params);
    const first = timeline[0];
    expect(first.equityPortfolioReal).toBe(10000);
    expect(first.bondsPortfolioReal).toBe(10000);
    expect(first.depositsPortfolioReal).toBe(10000);
  });

  it("equity ends higher than bonds which ends higher than deposits", () => {
    const timeline = generateComparisonTimeline(params);
    const last = timeline[timeline.length - 1];
    expect(last.equityPortfolioReal).toBeGreaterThan(last.bondsPortfolioReal);
    expect(last.bondsPortfolioReal).toBeGreaterThanOrEqual(
      last.depositsPortfolioReal,
    );
  });

  it("deposits equal initial savings plus simple contribution sum", () => {
    const timeline = generateComparisonTimeline(params);
    const last = timeline[timeline.length - 1];
    const totalContributed = 10000 + 200 * 32 * 12;
    expect(last.depositsPortfolioReal).toBeCloseTo(totalContributed, 0);
  });

  it("includes nominal values that are higher than real", () => {
    const timeline = generateComparisonTimeline(params);
    const atAge50 = timeline.find((point) => point.age === 50)!;
    expect(atAge50.equityPortfolioNominal).toBeGreaterThan(
      atAge50.equityPortfolioReal,
    );
    expect(atAge50.bondsPortfolioNominal).toBeGreaterThan(
      atAge50.bondsPortfolioReal,
    );
  });

  it("handles zero contribution with only initial savings", () => {
    const timeline = generateComparisonTimeline({
      ...params,
      monthlyContribution: 0,
    });
    expect(timeline[0].equityPortfolioReal).toBe(10000);
    expect(
      timeline[timeline.length - 1].equityPortfolioReal,
    ).toBeGreaterThan(10000);
  });
});
