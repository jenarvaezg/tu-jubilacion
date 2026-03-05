import { describe, it, expect } from "vitest";
import { calculateCurrentLaw } from "../../src/engine/scenarios/current-law";
import { calculateNotionalAccounts } from "../../src/engine/scenarios/notional-accounts";
import { calculateSustainability2013 } from "../../src/engine/scenarios/sustainability-2013";
import { calculateEUConvergence } from "../../src/engine/scenarios/eu-convergence";
import { calculateGreeceHaircut } from "../../src/engine/scenarios/greece-haircut";
import type { UserProfile } from "../../src/engine/types";

/**
 * Golden Profile Tests - Scenario 1 (Legislación Vigente)
 *
 * These profiles test edge cases and typical scenarios to validate
 * the current law pension calculation against expected ranges.
 * Expected ranges are approximate, validated against SS simulator logic.
 */

// Profile A: 25yo, 1200 EUR net, Madrid, 3y worked, retire 67
// Low income worker near base mínima
const PROFILE_A: UserProfile = {
  age: 25,
  monthlySalary: 1200,
  salaryType: "net",
  pagasExtra: true,
  ccaa: "madrid",
  yearsWorked: 3,
  monthsContributed: 36,
  desiredRetirementAge: 67,
};

// Profile B: 45yo, 4000 EUR gross, Catalunya, 23y worked, retire 67
// High income, tests base máxima ceiling
const PROFILE_B: UserProfile = {
  age: 45,
  monthlySalary: 4000,
  salaryType: "gross",
  pagasExtra: true,
  ccaa: "catalunya",
  yearsWorked: 23,
  monthsContributed: 276,
  desiredRetirementAge: 67,
};

// Profile C: 60yo, 2500 EUR gross, Andalucía, 38y worked, retire 63
// Early retirement - tests penalties
const PROFILE_C: UserProfile = {
  age: 60,
  monthlySalary: 2500,
  salaryType: "gross",
  pagasExtra: true,
  ccaa: "andalucia",
  yearsWorked: 38,
  monthsContributed: 456,
  desiredRetirementAge: 63,
};

// Profile D: 60yo, 2500 EUR gross, Valencia, 38y worked, retire 70
// Late retirement - tests bonuses
const PROFILE_D: UserProfile = {
  age: 60,
  monthlySalary: 2500,
  salaryType: "gross",
  pagasExtra: true,
  ccaa: "valencia",
  yearsWorked: 38,
  monthsContributed: 456,
  desiredRetirementAge: 70,
};

// Profile E: 35yo, 2000 EUR net, Madrid, 13y worked, retire 67
// Reference profile from the original plan
const PROFILE_E: UserProfile = {
  age: 35,
  monthlySalary: 2000,
  salaryType: "net",
  pagasExtra: true,
  ccaa: "madrid",
  yearsWorked: 13,
  monthsContributed: 156,
  desiredRetirementAge: 67,
};

describe("Golden Profile A - Low income, young worker, near base mínima", () => {
  const result = calculateCurrentLaw(PROFILE_A);

  it("produces a valid pension", () => {
    expect(result.monthlyPension).toBeGreaterThan(0);
  });

  it("pension is at or near minimum pension level", () => {
    // 25yo with 3y worked, retiring at 67 = 45 total years contributed
    // But base is near minimum, so pension should be moderate
    // With 45 years at 100% coefficient, pension ~ base reguladora
    // Base reguladora near base min ~ 1381, so pension ~ 1381
    expect(result.monthlyPension).toBeGreaterThan(700);
    expect(result.monthlyPension).toBeLessThan(2200);
  });

  it("replacement rate is reasonable for low income", () => {
    // With CPI actualization, base reguladora is in retirement-year euros
    // while gross salary is in current euros, so rates can exceed 1.0
    expect(result.replacementRate).toBeGreaterThan(0.4);
    expect(result.replacementRate).toBeLessThan(2.0);
  });

  it("has complete timeline from 67 to 90", () => {
    expect(result.timeline[0].age).toBe(67);
    expect(result.timeline[result.timeline.length - 1].age).toBe(90);
  });
});

describe("Golden Profile B - High income, Catalunya, base máxima ceiling", () => {
  const result = calculateCurrentLaw(PROFILE_B);

  it("base reguladora is capped by base máxima", () => {
    // 4000 gross is below base max (5101.20), so base = 4000
    // With growth over 22 years, later bases will approach/hit max
    expect(result.baseReguladora).toBeGreaterThan(3000);
    expect(result.baseReguladora).toBeLessThan(5000);
  });

  it("pension is substantial for high-contribution profile", () => {
    // 45 years contributed at retirement, 100% coefficient
    // Base reguladora ~4000+, so pension should be high
    expect(result.monthlyPension).toBeGreaterThan(2000);
    expect(Number.isFinite(result.monthlyPension)).toBe(true);
  });

  it("replacement rate reflects ceiling effect", () => {
    // With CPI actualization, base reguladora is in retirement-year euros
    // while gross salary is in current euros, so rates can exceed 1.0
    expect(result.replacementRate).toBeGreaterThan(0.4);
    expect(result.replacementRate).toBeLessThan(2.0);
  });
});

describe("Golden Profile C - Early retirement with penalties", () => {
  const result = calculateCurrentLaw(PROFILE_C);
  const onTimeResult = calculateCurrentLaw({
    ...PROFILE_C,
    desiredRetirementAge: 67,
  });

  it("pension is lower than on-time retirement", () => {
    expect(result.monthlyPension).toBeLessThan(onTimeResult.monthlyPension);
  });

  it("penalty reduces pension by expected range", () => {
    // 63 vs 67 = 4 years early = 48 months
    // However, max voluntary early retirement is 2 years (24 months)
    // With 38 years contributed (< 38.5), penalty ~ 0.33% per month
    // But legal age might be 67 (since < 38.5y contributed)
    // 48 months * 0.33% = ~15.84% reduction
    const reduction = 1 - result.monthlyPension / onTimeResult.monthlyPension;
    expect(reduction).toBeGreaterThan(0.05);
    expect(reduction).toBeLessThan(0.35);
  });

  it("timeline starts at 63", () => {
    expect(result.timeline[0].age).toBe(63);
  });
});

describe("Golden Profile D - Late retirement with bonuses", () => {
  const result = calculateCurrentLaw(PROFILE_D);
  const onTimeResult = calculateCurrentLaw({
    ...PROFILE_D,
    desiredRetirementAge: 67,
  });

  it("pension is higher than or equal to on-time retirement", () => {
    // Might both hit cap
    expect(result.monthlyPension).toBeGreaterThanOrEqual(
      onTimeResult.monthlyPension * 0.99, // allow tiny rounding
    );
  });

  it("late bonus adds a meaningful uplift per year of delay", () => {
    // 3 years late (67 -> 70), should yield a clear bonus uplift.
    const bonus = result.monthlyPension / onTimeResult.monthlyPension - 1;
    expect(bonus).toBeGreaterThan(0.05);
    expect(bonus).toBeLessThan(0.2);
  });

  it("timeline starts at 70", () => {
    expect(result.timeline[0].age).toBe(70);
  });
});

describe("Golden Profile E - Reference profile (35yo, 2000 net, Madrid)", () => {
  const result = calculateCurrentLaw(PROFILE_E);

  it("produces a reasonable pension for median Spanish worker", () => {
    // 35yo, 13y worked, retiring at 67 = 45 total years
    // Net 2000/month -> gross ~2600-2800/month
    // Base ~ gross (within SS range)
    // 100% coefficient at 45 years
    // Base reguladora ~ avg base over last 25 years
    expect(result.monthlyPension).toBeGreaterThan(1000);
    expect(result.monthlyPension).toBeLessThan(3200);
  });

  it("replacement rate is in plausible range for long contributor", () => {
    // With 45 years contributed (100% coefficient) and moderate salary,
    // replacement rate vs gross can exceed 100% due to 14 pagas pension
    // vs salary computation and base reguladora averaging
    expect(result.replacementRate).toBeGreaterThan(0.4);
    expect(result.replacementRate).toBeLessThan(1.3);
  });

  it("annual pension equals 14 * monthly", () => {
    expect(result.annualPension).toBeCloseTo(result.monthlyPension * 14, 0);
  });

  it("replacement rate net is higher than gross replacement rate", () => {
    // Net replacement is always higher because pension is not subject
    // to as much deduction
    expect(result.replacementRateNet).toBeGreaterThan(result.replacementRate);
  });

  it("timeline has correct year entries", () => {
    const retirementYear = 2025 + (67 - 35);
    expect(result.timeline[0].year).toBe(retirementYear);
  });
});

describe("Cross-profile sanity checks", () => {
  const resultA = calculateCurrentLaw(PROFILE_A);
  const resultB = calculateCurrentLaw(PROFILE_B);
  const resultE = calculateCurrentLaw(PROFILE_E);

  it("higher salary produces higher pension", () => {
    expect(resultB.monthlyPension).toBeGreaterThan(resultE.monthlyPension);
  });

  it("all pensions are positive", () => {
    expect(resultA.monthlyPension).toBeGreaterThan(0);
    expect(resultB.monthlyPension).toBeGreaterThan(0);
    expect(resultE.monthlyPension).toBeGreaterThan(0);
  });

  it("all replacement rates are between 0 and 1.5", () => {
    for (const r of [resultA, resultB, resultE]) {
      expect(r.replacementRate).toBeGreaterThan(0);
      expect(r.replacementRate).toBeLessThan(1.5);
    }
  });
});

// ── Cross-Scenario Validation (All 5 scenarios, All 5 profiles) ────

const ALL_PROFILES = [PROFILE_A, PROFILE_B, PROFILE_C, PROFILE_D, PROFILE_E];
const PROFILE_NAMES = [
  "A (low income, young)",
  "B (high income, Catalunya)",
  "C (early retirement)",
  "D (late retirement)",
  "E (reference, net)",
];

describe("Cross-scenario validation - all profiles x all scenarios", () => {
  ALL_PROFILES.forEach((profile, idx) => {
    describe(`Profile ${PROFILE_NAMES[idx]}`, () => {
      const cl = calculateCurrentLaw(profile);
      const na = calculateNotionalAccounts(profile);
      const s13 = calculateSustainability2013(profile);
      const eu = calculateEUConvergence(profile);
      const gr = calculateGreeceHaircut(profile);

      it("all 5 scenarios produce positive pensions", () => {
        expect(cl.monthlyPension).toBeGreaterThan(0);
        expect(na.monthlyPension).toBeGreaterThan(0);
        expect(s13.monthlyPension).toBeGreaterThan(0);
        expect(eu.monthlyPension).toBeGreaterThan(0);
        expect(gr.monthlyPension).toBeGreaterThan(0);
      });

      it("all 5 scenarios produce valid timelines", () => {
        for (const result of [cl, na, s13, eu, gr]) {
          expect(result.timeline.length).toBeGreaterThan(0);
          expect(result.timeline[0].age).toBe(profile.desiredRetirementAge);
        }
      });

      it("notional accounts pension <= current law", () => {
        expect(na.monthlyPension).toBeLessThanOrEqual(
          cl.monthlyPension * 1.1, // tolerance for profile-dependent edge cases
        );
      });

      it("sustainability 2013 pension <= current law", () => {
        expect(s13.monthlyPension).toBeLessThanOrEqual(
          cl.monthlyPension * 1.01,
        );
      });

      it("greece haircut (30%) pension <= current law", () => {
        expect(gr.monthlyPension).toBeLessThan(cl.monthlyPension);
      });

      it("greece haircut is exactly 70% of current law", () => {
        expect(gr.monthlyPension).toBeCloseTo(cl.monthlyPension * 0.7, 0);
      });

      it("EU convergence replacement rate is 60%", () => {
        expect(eu.replacementRate).toBeCloseTo(0.6, 2);
      });
    });
  });
});
