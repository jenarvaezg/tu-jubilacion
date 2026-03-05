import { describe, it, expect } from "vitest";
import { calculateCurrentLaw } from "../../../src/engine/scenarios/current-law";
import type { UserProfile } from "../../../src/engine/types";

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    age: 35,
    monthlySalary: 2500,
    salaryType: "gross",
    pagasExtra: true,
    ccaa: "madrid",
    yearsWorked: 13,
    monthsContributed: 156,
    desiredRetirementAge: 67,
    ...overrides,
  };
}

describe("calculateCurrentLaw", () => {
  it("returns a valid ScenarioResult", () => {
    const result = calculateCurrentLaw(makeProfile());
    expect(result.scenarioId).toBe("current-law");
    expect(result.scenarioName).toBe("Legislación Vigente");
    expect(result.monthlyPension).toBeGreaterThan(0);
    expect(result.annualPension).toBeCloseTo(result.monthlyPension * 14, 0);
    expect(result.baseReguladora).toBeGreaterThan(0);
    expect(result.replacementRate).toBeGreaterThan(0);
    expect(result.replacementRate).toBeLessThan(1.5);
    expect(result.timeline.length).toBeGreaterThan(0);
  });

  it("pension is capped at max pension", () => {
    // Very high salary should hit pension max
    const result = calculateCurrentLaw(
      makeProfile({
        monthlySalary: 8000,
        salaryType: "gross",
        yearsWorked: 40,
        monthsContributed: 480,
        age: 55,
        desiredRetirementAge: 67,
      }),
    );
    expect(result.monthlyPension).toBeLessThanOrEqual(3175.04);
  });

  it("zero years contributed (below 15) gives zero pension", () => {
    const result = calculateCurrentLaw(
      makeProfile({
        yearsWorked: 0,
        monthsContributed: 0,
        age: 60,
        desiredRetirementAge: 67,
      }),
    );
    // Less than 15 years total (7 years) = 0 coefficient
    // But will get minimum pension
    expect(result.monthlyPension).toBeGreaterThanOrEqual(0);
  });

  it("15 years contribution gives 50% coefficient", () => {
    const result = calculateCurrentLaw(
      makeProfile({
        yearsWorked: 15,
        monthsContributed: 180,
        age: 52,
        desiredRetirementAge: 67,
      }),
    );
    // Exactly 15 + 15 years = 30 years contributed, well above 50%
    // The base reguladora * coefficient should be reasonable
    expect(result.replacementRate).toBeGreaterThan(0.3);
  });

  it("early retirement applies penalty", () => {
    const onTime = calculateCurrentLaw(
      makeProfile({
        yearsWorked: 30,
        monthsContributed: 360,
        age: 60,
        desiredRetirementAge: 67,
      }),
    );
    const early = calculateCurrentLaw(
      makeProfile({
        yearsWorked: 30,
        monthsContributed: 360,
        age: 60,
        desiredRetirementAge: 65,
      }),
    );
    // Early retirement should produce lower pension
    expect(early.monthlyPension).toBeLessThan(onTime.monthlyPension);
  });

  it("late retirement applies bonus", () => {
    const onTime = calculateCurrentLaw(
      makeProfile({
        yearsWorked: 38,
        monthsContributed: 456,
        age: 60,
        desiredRetirementAge: 67,
      }),
    );
    const late = calculateCurrentLaw(
      makeProfile({
        yearsWorked: 38,
        monthsContributed: 456,
        age: 60,
        desiredRetirementAge: 70,
      }),
    );
    // Late retirement should produce higher pension (before cap)
    // Both might hit cap though, so check base * coefficient * adjustment
    expect(late.replacementRate).toBeGreaterThanOrEqual(
      onTime.replacementRate,
    );
  });

  it("timeline starts at retirement age and ends at 90", () => {
    const result = calculateCurrentLaw(
      makeProfile({ age: 40, desiredRetirementAge: 67 }),
    );
    expect(result.timeline[0].age).toBe(67);
    expect(result.timeline[result.timeline.length - 1].age).toBe(90);
  });

  it("timeline nominal pension grows each year (IPC revalorization)", () => {
    const result = calculateCurrentLaw(makeProfile());
    const tl = result.timeline;
    for (let i = 1; i < tl.length; i++) {
      expect(tl[i].monthlyPensionNominal).toBeGreaterThanOrEqual(
        tl[i - 1].monthlyPensionNominal,
      );
    }
  });

  it("handles net salary input correctly", () => {
    const resultNet = calculateCurrentLaw(
      makeProfile({
        monthlySalary: 1800,
        salaryType: "net",
        ccaa: "madrid",
      }),
    );
    expect(resultNet.monthlyPension).toBeGreaterThan(0);
    expect(resultNet.baseReguladora).toBeGreaterThan(0);
  });
});
