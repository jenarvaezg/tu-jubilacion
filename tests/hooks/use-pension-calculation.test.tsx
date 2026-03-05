// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { DEFAULT_STATE } from "../../src/state/defaults";
import { usePensionCalculation } from "../../src/hooks/use-pension-calculation";

describe("usePensionCalculation", () => {
  it("keeps the memoized result when only savings fields change", () => {
    const baseInputs = DEFAULT_STATE.calculation;
    const sharedProfile = baseInputs.profile;

    const { result, rerender } = renderHook(
      (inputs: typeof baseInputs) => usePensionCalculation(inputs),
      {
        initialProps: {
          ...baseInputs,
          profile: sharedProfile,
        },
      },
    );

    const firstResult = result.current;

    rerender({
      ...baseInputs,
      profile: sharedProfile,
      comparisonScenarioId: "eu-convergence",
      investmentProfileId: "aggressive",
      currentSavingsBalance: 35000,
      monthlyContributionOverride: 450,
      drawdownYears: 30,
    });

    expect(result.current).toBe(firstResult);
    expect(result.current.results).toBe(firstResult.results);
  });

  it("recomputes when a pension input changes", () => {
    const baseInputs = DEFAULT_STATE.calculation;
    const sharedProfile = baseInputs.profile;

    const { result, rerender } = renderHook(
      (inputs: typeof baseInputs) => usePensionCalculation(inputs),
      {
        initialProps: {
          ...baseInputs,
          profile: sharedProfile,
        },
      },
    );

    const firstResult = result.current;

    rerender({
      ...baseInputs,
      profile: sharedProfile,
      ipcRate: baseInputs.ipcRate + 0.005,
    });

    expect(result.current).not.toBe(firstResult);
    expect(result.current.results).not.toBe(firstResult.results);
  });
});
