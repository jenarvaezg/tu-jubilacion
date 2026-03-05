import { describe, expect, it } from "vitest";
import { calculateCurrentLaw } from "../../../src/engine/scenarios/current-law";
import {
  DEFAULT_PERSONAL_SITUATIONS,
  type UserProfile,
} from "../../../src/engine/types";

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    age: 62,
    monthlySalary: 3000,
    salaryType: "gross",
    pagasExtra: true,
    ccaa: "madrid",
    yearsWorked: 30,
    monthsContributed: 360,
    desiredRetirementAge: 65,
    personalSituations: DEFAULT_PERSONAL_SITUATIONS,
    ...overrides,
  };
}

describe("current law - special situations", () => {
  it("children complement increases pension by fixed amount per child", () => {
    const base = calculateCurrentLaw(makeProfile());
    const withChildren = calculateCurrentLaw(
      makeProfile({
        personalSituations: {
          ...DEFAULT_PERSONAL_SITUATIONS,
          childrenCount: 2,
        },
      }),
    );
    expect(withChildren.monthlyPension - base.monthlyPension).toBeCloseTo(71.8, 2);
  });

  it("recognized foreign years can improve retirement conditions", () => {
    const withoutForeign = calculateCurrentLaw(makeProfile());
    const withForeign = calculateCurrentLaw(
      makeProfile({
        personalSituations: {
          ...DEFAULT_PERSONAL_SITUATIONS,
          foreignContributionYears: 3,
        },
      }),
    );
    expect(withForeign.monthlyPension).toBeGreaterThan(withoutForeign.monthlyPension);
  });

  it("involuntary early retirement softens the penalty", () => {
    const voluntary = calculateCurrentLaw(makeProfile());
    const involuntary = calculateCurrentLaw(
      makeProfile({
        personalSituations: {
          ...DEFAULT_PERSONAL_SITUATIONS,
          involuntaryEarlyRetirement: true,
        },
      }),
    );
    expect(involuntary.monthlyPension).toBeGreaterThan(voluntary.monthlyPension);
  });

  it("disability plus hazardous job can reduce legal age up to 4 years", () => {
    const baseline = calculateCurrentLaw(
      makeProfile({
        desiredRetirementAge: 63,
      }),
    );
    const reducedLegalAge = calculateCurrentLaw(
      makeProfile({
        desiredRetirementAge: 63,
        personalSituations: {
          ...DEFAULT_PERSONAL_SITUATIONS,
          disabilityLevel: "65",
          hazardousJob: true,
        },
      }),
    );
    expect(reducedLegalAge.monthlyPension).toBeGreaterThan(baseline.monthlyPension);
  });
});
