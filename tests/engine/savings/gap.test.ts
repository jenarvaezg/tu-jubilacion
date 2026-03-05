import { describe, it, expect } from "vitest";
import { calculatePensionGap } from "../../../src/engine/savings/gap";
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

describe("calculatePensionGap", () => {
  const results: ScenarioResult[] = [
    makeResult("current-law", 1500),
    makeResult("notional-accounts", 1300),
    makeResult("eu-convergence", 1100),
    makeResult("greece-haircut", 1050),
  ];

  it("calculates gap between current-law and notional-accounts", () => {
    const gap = calculatePensionGap(results, "notional-accounts");
    expect(gap).not.toBeNull();
    expect(gap!.baselineMonthly).toBe(1500);
    expect(gap!.comparisonMonthly).toBe(1300);
    expect(gap!.gapMonthly).toBe(200);
    expect(gap!.gapAnnual).toBe(200 * 14);
    expect(gap!.gapPercent).toBeCloseTo(200 / 1500, 4);
  });

  it("calculates gap against eu-convergence", () => {
    const gap = calculatePensionGap(results, "eu-convergence");
    expect(gap).not.toBeNull();
    expect(gap!.gapMonthly).toBe(400);
    expect(gap!.comparisonScenarioId).toBe("eu-convergence");
  });

  it("returns zero gap when comparing current-law to itself", () => {
    const gap = calculatePensionGap(results, "current-law");
    expect(gap).not.toBeNull();
    expect(gap!.gapMonthly).toBe(0);
    expect(gap!.gapPercent).toBe(0);
  });

  it("returns null when baseline is missing", () => {
    const noBaseline = results.filter((r) => r.scenarioId !== "current-law");
    const gap = calculatePensionGap(noBaseline, "notional-accounts");
    expect(gap).toBeNull();
  });

  it("returns null when comparison scenario is missing", () => {
    const gap = calculatePensionGap(results, "sustainability-2013");
    expect(gap).toBeNull();
  });

  it("handles negative gap (comparison higher than baseline)", () => {
    const highComparison = [
      makeResult("current-law", 1000),
      makeResult("notional-accounts", 1200),
    ];
    const gap = calculatePensionGap(highComparison, "notional-accounts");
    expect(gap).not.toBeNull();
    expect(gap!.gapMonthly).toBe(-200);
    expect(gap!.gapPercent).toBeCloseTo(-0.2, 4);
  });
});
