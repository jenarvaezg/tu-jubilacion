import { describe, it, expect } from "vitest";
import { calculateGreeceHaircut } from "../../../src/engine/scenarios/greece-haircut";
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

describe("calculateGreeceHaircut", () => {
  it("returns a valid ScenarioResult", () => {
    const result = calculateGreeceHaircut(REFERENCE_PROFILE);
    expect(result.scenarioId).toBe("greece-haircut");
    expect(result.scenarioName).toContain("Grecia");
    expect(result.monthlyPension).toBeGreaterThan(0);
    expect(result.annualPension).toBeCloseTo(result.monthlyPension * 14, 0);
  });

  it("default 30% haircut reduces pension by exactly 30%", () => {
    const currentLaw = calculateCurrentLaw(REFERENCE_PROFILE);
    const haircut = calculateGreeceHaircut(REFERENCE_PROFILE);
    expect(haircut.monthlyPension).toBeCloseTo(
      currentLaw.monthlyPension * 0.7,
      0,
    );
  });

  it("custom haircut rate is applied correctly", () => {
    const currentLaw = calculateCurrentLaw(REFERENCE_PROFILE);
    const haircut10 = calculateGreeceHaircut(REFERENCE_PROFILE, {
      haircutRate: 0.1,
    });
    const haircut50 = calculateGreeceHaircut(REFERENCE_PROFILE, {
      haircutRate: 0.5,
    });
    expect(haircut10.monthlyPension).toBeCloseTo(
      currentLaw.monthlyPension * 0.9,
      0,
    );
    expect(haircut50.monthlyPension).toBeCloseTo(
      currentLaw.monthlyPension * 0.5,
      0,
    );
  });

  it("replacement rate is reduced proportionally", () => {
    const currentLaw = calculateCurrentLaw(REFERENCE_PROFILE);
    const haircut = calculateGreeceHaircut(REFERENCE_PROFILE, {
      haircutRate: 0.3,
    });
    expect(haircut.replacementRate).toBeCloseTo(
      currentLaw.replacementRate * 0.7,
      3,
    );
  });

  it("larger haircut produces lower pension", () => {
    const small = calculateGreeceHaircut(REFERENCE_PROFILE, {
      haircutRate: 0.1,
    });
    const large = calculateGreeceHaircut(REFERENCE_PROFILE, {
      haircutRate: 0.5,
    });
    expect(large.monthlyPension).toBeLessThan(small.monthlyPension);
  });

  it("timeline has frozen pensions (0% revalorization in crisis)", () => {
    const result = calculateGreeceHaircut(REFERENCE_PROFILE);
    const tl = result.timeline;
    if (tl.length > 1) {
      // Nominal pension stays constant (frozen)
      expect(tl[1].monthlyPensionNominal).toBeCloseTo(
        tl[0].monthlyPensionNominal,
        2,
      );
      // Real pension decreases (inflation erodes purchasing power)
      expect(tl[1].monthlyPensionReal).toBeLessThan(tl[0].monthlyPensionReal);
    }
  });

  it("timeline starts at retirement age", () => {
    const result = calculateGreeceHaircut(REFERENCE_PROFILE);
    expect(result.timeline[0].age).toBe(67);
  });
});
