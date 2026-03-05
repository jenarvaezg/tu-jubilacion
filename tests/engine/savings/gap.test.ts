import { describe, it, expect } from "vitest";
import { calculateRetirementIncomeGap } from "../../../src/engine/savings/gap";
import type { ScenarioResult } from "../../../src/engine/types";

function makeResult(
  scenarioId: string,
  monthlyPension: number,
): ScenarioResult {
  return {
    scenarioId: scenarioId as ScenarioResult["scenarioId"],
    scenarioName: scenarioId,
    monthlyPension,
    annualPension: monthlyPension * 14,
    baseReguladora: monthlyPension * 1.2,
    replacementRate: 0.7,
    replacementRateNet: 0.8,
    timeline: [],
  };
}

describe("calculateRetirementIncomeGap", () => {
  const results: ScenarioResult[] = [
    makeResult("current-law", 1500),
    makeResult("notional-accounts", 1300),
    makeResult("eu-convergence", 1100),
    makeResult("greece-haircut", 1050),
  ];

  it("calculates the lifestyle gap under current law and reform", () => {
    const gap = calculateRetirementIncomeGap(results, "notional-accounts", 2000);

    expect(gap).not.toBeNull();
    expect(gap!.targetMonthlyIncome).toBe(2000);
    expect(gap!.currentLawMonthly).toBe(1500);
    expect(gap!.comparisonMonthly).toBe(1300);
    expect(gap!.currentLawGapMonthly).toBe(500);
    expect(gap!.comparisonGapMonthly).toBe(700);
    expect(gap!.additionalGapMonthly).toBe(200);
    expect(gap!.currentLawCoverageRate).toBeCloseTo(0.75, 4);
    expect(gap!.comparisonCoverageRate).toBeCloseTo(0.65, 4);
  });

  it("returns zero additional gap when comparing current law to itself", () => {
    const gap = calculateRetirementIncomeGap(results, "current-law", 2000);

    expect(gap).not.toBeNull();
    expect(gap!.currentLawGapMonthly).toBe(500);
    expect(gap!.comparisonGapMonthly).toBe(500);
    expect(gap!.additionalGapMonthly).toBe(0);
  });

  it("caps gaps at zero when the pension already covers the target", () => {
    const gap = calculateRetirementIncomeGap(results, "notional-accounts", 1200);

    expect(gap).not.toBeNull();
    expect(gap!.currentLawGapMonthly).toBe(0);
    expect(gap!.comparisonGapMonthly).toBe(0);
    expect(gap!.currentLawCoverageRate).toBe(1);
    expect(gap!.comparisonCoverageRate).toBe(1);
  });

  it("returns null when current law is missing", () => {
    const noBaseline = results.filter((r) => r.scenarioId !== "current-law");
    const gap = calculateRetirementIncomeGap(noBaseline, "notional-accounts", 2000);
    expect(gap).toBeNull();
  });

  it("returns null when the comparison scenario is missing", () => {
    const gap = calculateRetirementIncomeGap(
      results,
      "sustainability-2013",
      2000,
    );
    expect(gap).toBeNull();
  });
});
