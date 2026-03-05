import { describe, it, expect } from "vitest";
import { calculateSustainability2013 } from "../../../src/engine/scenarios/sustainability-2013";
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

describe("calculateSustainability2013", () => {
  it("returns a valid ScenarioResult", () => {
    const result = calculateSustainability2013(REFERENCE_PROFILE);
    expect(result.scenarioId).toBe("sustainability-2013");
    expect(result.scenarioName).toContain("Sostenibilidad");
    expect(result.monthlyPension).toBeGreaterThan(0);
    expect(result.annualPension).toBeCloseTo(result.monthlyPension * 14, 0);
  });

  it("sustainability factor reduces initial pension below current law", () => {
    const currentLaw = calculateCurrentLaw(REFERENCE_PROFILE);
    const sust = calculateSustainability2013(REFERENCE_PROFILE);
    // Life expectancy increases over time, so factor < 1
    expect(sust.monthlyPension).toBeLessThan(currentLaw.monthlyPension);
  });

  it("longer retirement horizon means larger sustainability reduction", () => {
    // Young person retires later = bigger gap between reference and retirement year
    const young = calculateSustainability2013({
      ...REFERENCE_PROFILE,
      age: 25,
    });
    const old = calculateSustainability2013({
      ...REFERENCE_PROFILE,
      age: 60,
    });
    const currentLawYoung = calculateCurrentLaw({
      ...REFERENCE_PROFILE,
      age: 25,
    });
    const currentLawOld = calculateCurrentLaw({
      ...REFERENCE_PROFILE,
      age: 60,
    });
    const reductionYoung =
      1 - young.monthlyPension / currentLawYoung.monthlyPension;
    const reductionOld =
      1 - old.monthlyPension / currentLawOld.monthlyPension;
    // Young person faces larger reduction due to more life expectancy increase
    expect(reductionYoung).toBeGreaterThan(reductionOld);
  });

  it("timeline uses 0.25% revalorization (not IPC)", () => {
    const result = calculateSustainability2013(REFERENCE_PROFILE);
    const tl = result.timeline;
    // Nominal pension still grows, but at 0.25% not 2%
    if (tl.length > 1) {
      const yearlyGrowth =
        tl[1].monthlyPensionNominal / tl[0].monthlyPensionNominal - 1;
      expect(yearlyGrowth).toBeCloseTo(0.0025, 3);
    }
  });

  it("real pension decreases over time (0.25% < IPC)", () => {
    const result = calculateSustainability2013(REFERENCE_PROFILE);
    const tl = result.timeline;
    // With 0.25% revalorization and 2% IPC, real pension should decrease
    if (tl.length > 5) {
      expect(tl[5].monthlyPensionReal).toBeLessThan(tl[0].monthlyPensionReal);
    }
  });
});
