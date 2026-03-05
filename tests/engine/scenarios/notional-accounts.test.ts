import { describe, it, expect } from "vitest";
import { calculateNotionalAccounts } from "../../../src/engine/scenarios/notional-accounts";
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

describe("calculateNotionalAccounts", () => {
  it("returns a valid ScenarioResult", () => {
    const result = calculateNotionalAccounts(REFERENCE_PROFILE);
    expect(result.scenarioId).toBe("notional-accounts");
    expect(result.scenarioName).toContain("Nocional");
    expect(result.monthlyPension).toBeGreaterThan(0);
    expect(result.annualPension).toBeCloseTo(result.monthlyPension * 14, 0);
    expect(result.timeline.length).toBeGreaterThan(0);
  });

  it("notional pension is lower than current-law (historic scenario)", () => {
    const currentLaw = calculateCurrentLaw(REFERENCE_PROFILE);
    const notional = calculateNotionalAccounts(REFERENCE_PROFILE, {
      notionalGrowthScenario: "historic",
    });
    // FEDEA expects ~10-12% below current law at historic growth
    expect(notional.monthlyPension).toBeLessThan(currentLaw.monthlyPension);
  });

  it("ageing-report scenario produces lower pension than historic", () => {
    const historic = calculateNotionalAccounts(REFERENCE_PROFILE, {
      notionalGrowthScenario: "historic",
    });
    const ageing = calculateNotionalAccounts(REFERENCE_PROFILE, {
      notionalGrowthScenario: "ageing-report",
    });
    expect(ageing.monthlyPension).toBeLessThan(historic.monthlyPension);
  });

  it("higher salary produces higher notional pension", () => {
    const low = calculateNotionalAccounts({
      ...REFERENCE_PROFILE,
      monthlySalary: 1500,
    });
    const high = calculateNotionalAccounts({
      ...REFERENCE_PROFILE,
      monthlySalary: 4000,
    });
    expect(high.monthlyPension).toBeGreaterThan(low.monthlyPension);
  });

  it("more years of contribution produce higher pension", () => {
    const short = calculateNotionalAccounts({
      ...REFERENCE_PROFILE,
      age: 50,
      yearsWorked: 5,
      monthsContributed: 60,
    });
    const long = calculateNotionalAccounts({
      ...REFERENCE_PROFILE,
      age: 35,
      yearsWorked: 25,
      monthsContributed: 300,
    });
    expect(long.monthlyPension).toBeGreaterThan(short.monthlyPension);
  });

  it("timeline starts at retirement age", () => {
    const result = calculateNotionalAccounts(REFERENCE_PROFILE);
    expect(result.timeline[0].age).toBe(67);
  });

  it("replacement rate is positive and below current law", () => {
    const result = calculateNotionalAccounts(REFERENCE_PROFILE);
    expect(result.replacementRate).toBeGreaterThan(0);
    const currentLaw = calculateCurrentLaw(REFERENCE_PROFILE);
    expect(result.replacementRate).toBeLessThan(
      currentLaw.replacementRate * 1.01,
    );
  });
});
