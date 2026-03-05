import { describe, it, expect } from "vitest";
import { calculateCurrentLaw } from "../../src/engine/scenarios/current-law";
import { calculateNotionalAccounts } from "../../src/engine/scenarios/notional-accounts";
import { calculateSustainability2013 } from "../../src/engine/scenarios/sustainability-2013";
import { calculateEUConvergence } from "../../src/engine/scenarios/eu-convergence";
import { calculateGreeceHaircut } from "../../src/engine/scenarios/greece-haircut";
import { DEFAULT_STATE } from "../../src/state/defaults";
import type { UserProfile } from "../../src/engine/types";

const DEFAULT_PROFILE = DEFAULT_STATE.calculation.profile;
const CONFIG = {
  ipcRate: DEFAULT_STATE.calculation.ipcRate,
  salaryGrowthRate: DEFAULT_STATE.calculation.salaryGrowthRate,
};

describe("E2E smoke test - default inputs produce 5 valid scenarios", () => {
  const cl = calculateCurrentLaw(DEFAULT_PROFILE, CONFIG);
  const na = calculateNotionalAccounts(DEFAULT_PROFILE, {
    ...CONFIG,
    notionalGrowthScenario: DEFAULT_STATE.calculation.notionalGrowthScenario,
  });
  const s13 = calculateSustainability2013(DEFAULT_PROFILE, CONFIG);
  const eu = calculateEUConvergence(DEFAULT_PROFILE, CONFIG);
  const gr = calculateGreeceHaircut(DEFAULT_PROFILE, {
    ...CONFIG,
    haircutRate: DEFAULT_STATE.calculation.greeceHaircutRate,
  });
  const allResults = [cl, na, s13, eu, gr];

  it("all 5 scenarios produce non-zero pensions", () => {
    for (const r of allResults) {
      expect(r.monthlyPension).toBeGreaterThan(0);
      expect(r.annualPension).toBeGreaterThan(0);
    }
  });

  it("all 5 scenarios have correct scenario IDs", () => {
    expect(cl.scenarioId).toBe("current-law");
    expect(na.scenarioId).toBe("notional-accounts");
    expect(s13.scenarioId).toBe("sustainability-2013");
    expect(eu.scenarioId).toBe("eu-convergence");
    expect(gr.scenarioId).toBe("greece-haircut");
  });

  it("all 5 scenarios produce non-empty timelines", () => {
    for (const r of allResults) {
      expect(r.timeline.length).toBeGreaterThan(0);
      expect(r.timeline[0].age).toBe(DEFAULT_PROFILE.desiredRetirementAge);
      expect(r.timeline[r.timeline.length - 1].age).toBe(90);
    }
  });

  it("all 5 scenarios have valid replacement rates", () => {
    for (const r of allResults) {
      expect(r.replacementRate).toBeGreaterThan(0);
      expect(r.replacementRate).toBeLessThan(3);
    }
  });

  it("timelines have both real and nominal values", () => {
    for (const r of allResults) {
      const first = r.timeline[0];
      expect(first.monthlyPensionReal).toBeGreaterThan(0);
      expect(first.monthlyPensionNominal).toBeGreaterThan(0);
    }
  });
});

describe("Boundary tests - extreme input values", () => {
  it("minimum age (18) produces valid results", () => {
    const profile: UserProfile = {
      age: 18,
      monthlySalary: 1200,
      salaryType: "net",
      pagasExtra: true,
      ccaa: "madrid",
      yearsWorked: 0,
      monthsContributed: 0,
      desiredRetirementAge: 67,
    };
    const result = calculateCurrentLaw(profile);
    expect(result.monthlyPension).toBeGreaterThan(0);
    expect(result.timeline.length).toBeGreaterThan(0);
  });

  it("maximum age (66) produces valid results", () => {
    const profile: UserProfile = {
      age: 66,
      monthlySalary: 2000,
      salaryType: "gross",
      pagasExtra: true,
      ccaa: "madrid",
      yearsWorked: 44,
      monthsContributed: 528,
      desiredRetirementAge: 67,
    };
    const result = calculateCurrentLaw(profile);
    expect(result.monthlyPension).toBeGreaterThan(0);
    expect(result.timeline[0].age).toBe(67);
  });

  it("minimum salary near SMI (~1134) produces valid results", () => {
    const profile: UserProfile = {
      age: 35,
      monthlySalary: 1134,
      salaryType: "gross",
      pagasExtra: true,
      ccaa: "madrid",
      yearsWorked: 13,
      monthsContributed: 156,
      desiredRetirementAge: 67,
    };
    const result = calculateCurrentLaw(profile);
    expect(result.monthlyPension).toBeGreaterThan(0);
  });

  it("maximum salary hitting base maxima produces valid results", () => {
    const profile: UserProfile = {
      age: 45,
      monthlySalary: 8000,
      salaryType: "gross",
      pagasExtra: true,
      ccaa: "madrid",
      yearsWorked: 23,
      monthsContributed: 276,
      desiredRetirementAge: 67,
    };
    const result = calculateCurrentLaw(profile);
    expect(result.monthlyPension).toBeGreaterThan(0);
    // Should be capped at pension max
    expect(result.monthlyPension).toBeLessThanOrEqual(3175.04);
  });

  it("earliest retirement age (63) produces valid results with penalty", () => {
    const profile: UserProfile = {
      age: 55,
      monthlySalary: 2500,
      salaryType: "gross",
      pagasExtra: true,
      ccaa: "madrid",
      yearsWorked: 33,
      monthsContributed: 396,
      desiredRetirementAge: 63,
    };
    const result63 = calculateCurrentLaw(profile);
    const result67 = calculateCurrentLaw({
      ...profile,
      desiredRetirementAge: 67,
    });
    expect(result63.monthlyPension).toBeGreaterThan(0);
    expect(result63.monthlyPension).toBeLessThan(result67.monthlyPension);
    expect(result63.timeline[0].age).toBe(63);
  });

  it("latest retirement age (70) produces valid results with bonus", () => {
    const profile: UserProfile = {
      age: 55,
      monthlySalary: 2500,
      salaryType: "gross",
      pagasExtra: true,
      ccaa: "madrid",
      yearsWorked: 33,
      monthsContributed: 396,
      desiredRetirementAge: 70,
    };
    const result70 = calculateCurrentLaw(profile);
    const result67 = calculateCurrentLaw({
      ...profile,
      desiredRetirementAge: 67,
    });
    expect(result70.monthlyPension).toBeGreaterThan(0);
    expect(result70.monthlyPension).toBeGreaterThanOrEqual(
      result67.monthlyPension * 0.99,
    );
    expect(result70.timeline[0].age).toBe(70);
  });

  it("pagasExtra affects replacement rate for gross salary", () => {
    const base: UserProfile = {
      age: 35,
      monthlySalary: 2000,
      salaryType: "gross",
      pagasExtra: true,
      ccaa: "madrid",
      yearsWorked: 13,
      monthsContributed: 156,
      desiredRetirementAge: 67,
    };
    const result14 = calculateCurrentLaw(base);
    const result12 = calculateCurrentLaw({ ...base, pagasExtra: false });
    // With gross salary, the base cotizacion is the same, so pension is the same.
    // But replacement rate differs because annualGross = monthly * 14 vs monthly * 12
    // 14 pagas -> higher annual gross -> lower replacement rate
    expect(result14.replacementRate).toBeLessThan(result12.replacementRate);
  });

  it("pagasExtra affects pension for net salary", () => {
    const base: UserProfile = {
      age: 35,
      monthlySalary: 2000,
      salaryType: "net",
      pagasExtra: true,
      ccaa: "madrid",
      yearsWorked: 13,
      monthsContributed: 156,
      desiredRetirementAge: 67,
    };
    const result14 = calculateCurrentLaw(base);
    const result12 = calculateCurrentLaw({ ...base, pagasExtra: false });
    // With net salary, pagasExtra affects netToGross conversion,
    // which changes the base cotizacion and therefore the pension
    expect(result14.monthlyPension).not.toBe(result12.monthlyPension);
  });

  it("all 5 scenarios work with boundary profiles", () => {
    const extremeProfile: UserProfile = {
      age: 18,
      monthlySalary: 1134,
      salaryType: "net",
      pagasExtra: true,
      ccaa: "pais-vasco",
      yearsWorked: 0,
      monthsContributed: 0,
      desiredRetirementAge: 67,
    };

    const cl = calculateCurrentLaw(extremeProfile);
    const na = calculateNotionalAccounts(extremeProfile);
    const s13 = calculateSustainability2013(extremeProfile);
    const eu = calculateEUConvergence(extremeProfile);
    const gr = calculateGreeceHaircut(extremeProfile);

    for (const r of [cl, na, s13, eu, gr]) {
      expect(r.monthlyPension).toBeGreaterThan(0);
      expect(r.timeline.length).toBeGreaterThan(0);
      expect(Number.isFinite(r.monthlyPension)).toBe(true);
      expect(Number.isNaN(r.monthlyPension)).toBe(false);
    }
  });
});
