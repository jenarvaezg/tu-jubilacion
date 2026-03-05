import { describe, expect, it } from "vitest";
import { calculateCurrentLaw } from "../../../src/engine/scenarios/current-law";
import type { UserProfile } from "../../../src/engine/types";

// Engine regression tests for current-law scenario.
// Divisor: 378 (Ley 27/2011, confirmed by SS calculator ACBR0001)
// CPI actualization: applied to contribution bases before best-N-of-M selection
// Reference: official SS anonymous calculator at w6.seg-social.es

const BASE_PROFILE: UserProfile = {
  age: 32,
  monthlySalary: 5101,
  salaryType: "gross",
  // Official simulator reference cases are interpreted on a 12-month basis
  // (extras already prorated in the reported monthly gross amount).
  pagasExtra: false,
  ccaa: "madrid",
  yearsWorked: 10,
  monthsContributed: 123,
  desiredRetirementAge: 65,
};

const OFFICIAL_CONFIG = {
  currentYear: 2026,
  ipcRate: 0.02,
  salaryGrowthRate: 0,
};

function expectClosePct(
  actual: number,
  expected: number,
  maxPctError: number,
): void {
  const pctError = Math.abs(actual - expected) / expected;
  expect(pctError).toBeLessThanOrEqual(maxPctError);
}

const STRICT_MAX_PCT_ERROR = 0.003; // 0.3%

describe("Current-law engine regression (CPI actualized, divisor 378)", () => {
  it("base maxima + edad ordinaria", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 5101, desiredRetirementAge: 65 },
      OFFICIAL_CONFIG,
    );
    expectClosePct(result.monthlyPension, 6019.08, STRICT_MAX_PCT_ERROR);
  });

  it("base intermedia + edad ordinaria", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 3000, desiredRetirementAge: 65 },
      OFFICIAL_CONFIG,
    );
    expectClosePct(result.monthlyPension, 3539.94, STRICT_MAX_PCT_ERROR);
  });

  it("base baja + edad ordinaria", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 1599.6, desiredRetirementAge: 65 },
      OFFICIAL_CONFIG,
    );
    expectClosePct(result.monthlyPension, 1887.5, STRICT_MAX_PCT_ERROR);
  });

  it("base maxima + 1 ano de demora", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 5101, desiredRetirementAge: 66 },
      OFFICIAL_CONFIG,
    );
    // Capped by projected pension max (3175.04 × 1.02^34)
    expectClosePct(result.monthlyPension, 6225.22, STRICT_MAX_PCT_ERROR);
  });

  it("base maxima + 1 ano de anticipada", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 5101, desiredRetirementAge: 64 },
      OFFICIAL_CONFIG,
    );
    expectClosePct(result.monthlyPension, 5718.13, STRICT_MAX_PCT_ERROR);
  });

  it("base maxima + 2 anos de demora (edad ordinaria 67)", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 5101, desiredRetirementAge: 67 },
      OFFICIAL_CONFIG,
    );
    // Capped by projected pension max (3175.04 × 1.02^35)
    expectClosePct(result.monthlyPension, 6349.73, STRICT_MAX_PCT_ERROR);
  });

  it("base maxima + 2 anos de anticipada", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 5101, desiredRetirementAge: 63 },
      OFFICIAL_CONFIG,
    );
    expectClosePct(result.monthlyPension, 4875.46, STRICT_MAX_PCT_ERROR);
  });
});
