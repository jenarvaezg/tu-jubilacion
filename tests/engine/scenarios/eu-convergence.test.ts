import { describe, it, expect } from "vitest";
import { calculateEUConvergence } from "../../../src/engine/scenarios/eu-convergence";
import { calculateCurrentLaw } from "../../../src/engine/scenarios/current-law";
import type { UserProfile } from "../../../src/engine/types";

const REFERENCE_PROFILE: UserProfile = {
  age: 35,
  monthlySalary: 2500,
  salaryType: "gross",
  pagasExtra: true,
  ccaa: "madrid",
  yearsWorked: 13,
  monthsContributed: 156,
  desiredRetirementAge: 67,
};

describe("calculateEUConvergence", () => {
  it("returns a valid ScenarioResult", () => {
    const result = calculateEUConvergence(REFERENCE_PROFILE);
    expect(result.scenarioId).toBe("eu-convergence");
    expect(result.scenarioName).toContain("Convergencia");
    expect(result.monthlyPension).toBeGreaterThan(0);
    expect(result.annualPension).toBeCloseTo(result.monthlyPension * 14, 0);
  });

  it("replacement rate equals target (60%)", () => {
    const result = calculateEUConvergence(REFERENCE_PROFILE);
    expect(result.replacementRate).toBeCloseTo(0.6, 2);
  });

  it("EU convergence pension is lower than current law for typical worker", () => {
    const currentLaw = calculateCurrentLaw(REFERENCE_PROFILE);
    const eu = calculateEUConvergence(REFERENCE_PROFILE);
    // Spain's current replacement rate (~74%) is higher than EU average (~60%)
    expect(eu.monthlyPension).toBeLessThan(currentLaw.monthlyPension);
  });

  it("pension scales linearly with salary", () => {
    const low = calculateEUConvergence({
      ...REFERENCE_PROFILE,
      monthlySalary: 2000,
    });
    const high = calculateEUConvergence({
      ...REFERENCE_PROFILE,
      monthlySalary: 4000,
    });
    // Pension should approximately double
    expect(high.monthlyPension / low.monthlyPension).toBeCloseTo(2, 0);
  });

  it("custom replacement rate works", () => {
    const result = calculateEUConvergence(REFERENCE_PROFILE, {
      targetReplacementRate: 0.5,
    });
    expect(result.replacementRate).toBeCloseTo(0.5, 2);
  });

  it("timeline starts at retirement age", () => {
    const result = calculateEUConvergence(REFERENCE_PROFILE);
    expect(result.timeline[0].age).toBe(67);
  });

  it("handles net salary input", () => {
    const result = calculateEUConvergence({
      ...REFERENCE_PROFILE,
      monthlySalary: 1800,
      salaryType: "net",
    });
    expect(result.monthlyPension).toBeGreaterThan(0);
    expect(result.replacementRate).toBeCloseTo(0.6, 2);
  });
});
