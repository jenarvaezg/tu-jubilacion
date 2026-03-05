import { describe, it, expect } from "vitest";
import { calculatePensionGap } from "../../src/engine/savings/gap";
import {
  calculateSavings,
  deriveDrawdownYears,
} from "../../src/engine/savings/portfolio";
import type { ScenarioResult } from "../../src/engine/types";

function makeScenarioResult(
  scenarioId: string,
  monthlyPension: number,
): ScenarioResult {
  return {
    scenarioId,
    scenarioLabel: scenarioId,
    monthlyPension,
    replacementRate: monthlyPension / 2000,
    yearlyTimeline: [],
  } as ScenarioResult;
}

describe("savings hook logic", () => {
  describe("calculatePensionGap", () => {
    it("returns null when comparison scenario not found", () => {
      const results = [makeScenarioResult("current-law", 1200)];
      const gap = calculatePensionGap(results, "notional-accounts");
      expect(gap).toBeNull();
    });

    it("returns gap when baseline > comparison", () => {
      const results = [
        makeScenarioResult("current-law", 1200),
        makeScenarioResult("notional-accounts", 800),
      ];
      const gap = calculatePensionGap(results, "notional-accounts");
      expect(gap).not.toBeNull();
      expect(gap!.gapMonthly).toBe(400);
    });

    it("returns zero gap when comparison >= baseline", () => {
      const results = [
        makeScenarioResult("current-law", 800),
        makeScenarioResult("notional-accounts", 1000),
      ];
      const gap = calculatePensionGap(results, "notional-accounts");
      expect(gap).not.toBeNull();
      expect(gap!.gapMonthly).toBeLessThanOrEqual(0);
    });
  });

  describe("deriveDrawdownYears", () => {
    it("derives positive drawdown years for typical profile", () => {
      const years = deriveDrawdownYears(67, 35, 2026);
      expect(years).toBeGreaterThan(0);
    });

    it("increases with younger current age (more life expectancy)", () => {
      const young = deriveDrawdownYears(67, 25, 2026);
      const old = deriveDrawdownYears(67, 55, 2026);
      expect(young).toBeGreaterThanOrEqual(old);
    });
  });

  describe("calculateSavings", () => {
    it("returns override amount when provided", () => {
      const result = calculateSavings({
        gapMonthly: 500,
        weightedRealReturn: 0.04,
        currentAge: 35,
        retirementAge: 67,
        drawdownYears: 20,
        profileId: "moderate",
        monthlyContributionOverride: 300,
      });
      expect(result.monthlyContribution).toBe(300);
    });

    it("calculates positive contribution for positive gap", () => {
      const result = calculateSavings({
        gapMonthly: 500,
        weightedRealReturn: 0.04,
        currentAge: 35,
        retirementAge: 67,
        drawdownYears: 20,
        profileId: "moderate",
        monthlyContributionOverride: null,
      });
      expect(result.monthlyContribution).toBeGreaterThan(0);
    });

    it("returns zero contribution for zero gap", () => {
      const result = calculateSavings({
        gapMonthly: 0,
        weightedRealReturn: 0.04,
        currentAge: 35,
        retirementAge: 67,
        drawdownYears: 20,
        profileId: "moderate",
        monthlyContributionOverride: null,
      });
      expect(result.monthlyContribution).toBe(0);
    });
  });
});
