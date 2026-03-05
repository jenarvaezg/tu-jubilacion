// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSavingsCalculation } from "../../src/hooks/use-savings-calculation";
import { DEFAULT_STATE } from "../../src/state/defaults";
import type { ScenarioResult } from "../../src/engine/types";

function makeResult(
  scenarioId: ScenarioResult["scenarioId"],
  monthlyPension: number,
): ScenarioResult {
  return {
    scenarioId,
    scenarioName: scenarioId,
    monthlyPension,
    annualPension: monthlyPension * 14,
    baseReguladora: monthlyPension * 1.1,
    replacementRate: 0.7,
    replacementRateNet: 0.75,
    timeline: [],
  };
}

describe("useSavingsCalculation", () => {
  const pensionResults: ScenarioResult[] = [
    makeResult("current-law", 1500),
    makeResult("notional-accounts", 1200),
    makeResult("sustainability-2013", 1300),
    makeResult("eu-convergence", 1250),
    makeResult("greece-haircut", 1100),
  ];

  it("derives the lifestyle target from the current salary", () => {
    const { result } = renderHook(() =>
      useSavingsCalculation({
        pensionResults,
        inputs: DEFAULT_STATE.calculation,
      }),
    );

    expect(result.current.error).toBeNull();
    expect(result.current.gap).not.toBeNull();
    expect(result.current.gap?.targetMonthlyIncome).toBeCloseTo(
      (2000 * 14) / 12,
      2,
    );
    expect(result.current.gap?.comparisonGapMonthly).toBeGreaterThan(
      result.current.gap?.currentLawGapMonthly ?? 0,
    );
  });

  it("reduces the required contribution when current savings exist", () => {
    const { result: noBase } = renderHook(() =>
      useSavingsCalculation({
        pensionResults,
        inputs: {
          ...DEFAULT_STATE.calculation,
          currentSavingsBalance: 0,
        },
      }),
    );

    const { result: withBase } = renderHook(() =>
      useSavingsCalculation({
        pensionResults,
        inputs: {
          ...DEFAULT_STATE.calculation,
          currentSavingsBalance: 100000,
        },
      }),
    );

    expect(withBase.current.savings?.monthlyContribution).toBeLessThan(
      noBase.current.savings?.monthlyContribution ?? Number.POSITIVE_INFINITY,
    );
    expect(withBase.current.portfolioTimeline[0]?.portfolioValueReal).toBe(100000);
  });

  it("respects a manual monthly contribution override", () => {
    const { result } = renderHook(() =>
      useSavingsCalculation({
        pensionResults,
        inputs: {
          ...DEFAULT_STATE.calculation,
          monthlyContributionOverride: 450,
        },
      }),
    );

    expect(result.current.savings?.monthlyContribution).toBe(450);
  });
});
