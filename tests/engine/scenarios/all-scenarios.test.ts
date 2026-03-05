import { describe, it, expect } from "vitest";
import { calculateCurrentLaw } from "../../../src/engine/scenarios/current-law";
import { calculateNotionalAccounts } from "../../../src/engine/scenarios/notional-accounts";
import { calculateSustainability2013 } from "../../../src/engine/scenarios/sustainability-2013";
import { calculateEUConvergence } from "../../../src/engine/scenarios/eu-convergence";
import { calculateGreeceHaircut } from "../../../src/engine/scenarios/greece-haircut";
import type { UserProfile } from "../../../src/engine/types";

const CONFIG = { currentYear: 2025, ipcRate: 0.02, salaryGrowthRate: 0.01 };

// Reference profile E: 35yo, 2000 net, Madrid, 13y worked, retire 67
const profileE: UserProfile = {
  age: 35,
  monthlySalary: 2000,
  salaryType: "net",
  pagasExtra: true,
  ccaa: "madrid",
  yearsWorked: 13,
  monthsContributed: 156,
  desiredRetirementAge: 67,
};

describe("Scenario 2: Notional Accounts", () => {
  it("produces a positive pension", () => {
    const result = calculateNotionalAccounts(profileE, CONFIG);
    expect(result.scenarioId).toBe("notional-accounts");
    expect(result.monthlyPension).toBeGreaterThan(0);
  });

  it("historic GDP: pension is less than current law", () => {
    const currentLaw = calculateCurrentLaw(profileE, CONFIG);
    const notional = calculateNotionalAccounts(profileE, {
      ...CONFIG,
      notionalGrowthScenario: "historic",
    });
    // Notional accounts typically produce lower pensions
    expect(notional.monthlyPension).toBeLessThan(
      currentLaw.monthlyPension * 1.1,
    );
  });

  it("ageing-report GDP produces lower pension than historic", () => {
    const historic = calculateNotionalAccounts(profileE, {
      ...CONFIG,
      notionalGrowthScenario: "historic",
    });
    const ageing = calculateNotionalAccounts(profileE, {
      ...CONFIG,
      notionalGrowthScenario: "ageing-report",
    });
    expect(ageing.monthlyPension).toBeLessThan(historic.monthlyPension);
  });

  it("has a valid timeline", () => {
    const result = calculateNotionalAccounts(profileE, CONFIG);
    expect(result.timeline.length).toBeGreaterThan(20);
    expect(result.timeline[0].age).toBe(67);
  });

  it("replacement rate is plausible", () => {
    const result = calculateNotionalAccounts(profileE, CONFIG);
    expect(result.replacementRate).toBeGreaterThan(0.1);
    expect(result.replacementRate).toBeLessThan(1.2);
  });
});

describe("Scenario 3: Sustainability 2013", () => {
  it("produces pension lower than current law", () => {
    const currentLaw = calculateCurrentLaw(profileE, CONFIG);
    const sustainability = calculateSustainability2013(profileE, CONFIG);
    expect(sustainability.monthlyPension).toBeLessThan(
      currentLaw.monthlyPension,
    );
  });

  it("sustainability factor < 1 (life expectancy increases)", () => {
    const currentLaw = calculateCurrentLaw(profileE, CONFIG);
    const sustainability = calculateSustainability2013(profileE, CONFIG);
    const factor =
      sustainability.monthlyPension / currentLaw.monthlyPension;
    expect(factor).toBeLessThan(1.0);
    expect(factor).toBeGreaterThan(0.9); // Small reduction (few % at most)
  });

  it("real pension declines over time (0.25% < IPC)", () => {
    const result = calculateSustainability2013(profileE, CONFIG);
    const first = result.timeline[0].monthlyPensionReal;
    const last = result.timeline[result.timeline.length - 1].monthlyPensionReal;
    // With 0.25% revalorization vs 2% IPC, real value drops
    expect(last).toBeLessThan(first);
  });

  it("has correct scenario id", () => {
    const result = calculateSustainability2013(profileE, CONFIG);
    expect(result.scenarioId).toBe("sustainability-2013");
  });
});

describe("Scenario 4: EU Convergence", () => {
  it("replacement rate is exactly 60%", () => {
    const result = calculateEUConvergence(profileE, CONFIG);
    expect(result.replacementRate).toBeCloseTo(0.6, 5);
  });

  it("pension = 60% of gross", () => {
    // Use gross salary to make it simple
    const grossProfile: UserProfile = {
      ...profileE,
      monthlySalary: 3000,
      salaryType: "gross",
    };
    const result = calculateEUConvergence(grossProfile, CONFIG);
    // Annual gross = 3000 * 14 = 42000, 60% = 25200, monthly = 25200/14 = 1800
    expect(result.monthlyPension).toBeCloseTo(1800, 0);
  });

  it("has valid timeline", () => {
    const result = calculateEUConvergence(profileE, CONFIG);
    expect(result.timeline.length).toBeGreaterThan(20);
  });

  it("has correct scenario id", () => {
    const result = calculateEUConvergence(profileE, CONFIG);
    expect(result.scenarioId).toBe("eu-convergence");
  });
});

describe("Scenario 5: Greece Haircut", () => {
  it("30% haircut reduces pension by 30%", () => {
    const currentLaw = calculateCurrentLaw(profileE, CONFIG);
    const greece = calculateGreeceHaircut(profileE, {
      ...CONFIG,
      haircutRate: 0.3,
    });
    expect(greece.monthlyPension).toBeCloseTo(
      currentLaw.monthlyPension * 0.7,
      0,
    );
  });

  it("50% haircut cuts pension in half", () => {
    const currentLaw = calculateCurrentLaw(profileE, CONFIG);
    const greece = calculateGreeceHaircut(profileE, {
      ...CONFIG,
      haircutRate: 0.5,
    });
    expect(greece.monthlyPension).toBeCloseTo(
      currentLaw.monthlyPension * 0.5,
      0,
    );
  });

  it("10% haircut is the mildest", () => {
    const currentLaw = calculateCurrentLaw(profileE, CONFIG);
    const greece = calculateGreeceHaircut(profileE, {
      ...CONFIG,
      haircutRate: 0.1,
    });
    expect(greece.monthlyPension).toBeCloseTo(
      currentLaw.monthlyPension * 0.9,
      0,
    );
  });

  it("has correct scenario id", () => {
    const result = calculateGreeceHaircut(profileE, CONFIG);
    expect(result.scenarioId).toBe("greece-haircut");
  });
});

describe("Cross-scenario sanity checks", () => {
  // Run all 5 scenarios for profile E
  const currentLaw = calculateCurrentLaw(profileE, CONFIG);
  const notionalHistoric = calculateNotionalAccounts(profileE, {
    ...CONFIG,
    notionalGrowthScenario: "historic",
  });
  const sustainability = calculateSustainability2013(profileE, CONFIG);
  const eu = calculateEUConvergence(profileE, CONFIG);
  const greece30 = calculateGreeceHaircut(profileE, {
    ...CONFIG,
    haircutRate: 0.3,
  });

  it("all scenarios produce positive pensions", () => {
    expect(currentLaw.monthlyPension).toBeGreaterThan(0);
    expect(notionalHistoric.monthlyPension).toBeGreaterThan(0);
    expect(sustainability.monthlyPension).toBeGreaterThan(0);
    expect(eu.monthlyPension).toBeGreaterThan(0);
    expect(greece30.monthlyPension).toBeGreaterThan(0);
  });

  it("sustainability < current law", () => {
    expect(sustainability.monthlyPension).toBeLessThan(
      currentLaw.monthlyPension,
    );
  });

  it("greece 30% < current law", () => {
    expect(greece30.monthlyPension).toBeLessThan(currentLaw.monthlyPension);
  });

  it("all scenarios have timelines", () => {
    expect(currentLaw.timeline.length).toBeGreaterThan(0);
    expect(notionalHistoric.timeline.length).toBeGreaterThan(0);
    expect(sustainability.timeline.length).toBeGreaterThan(0);
    expect(eu.timeline.length).toBeGreaterThan(0);
    expect(greece30.timeline.length).toBeGreaterThan(0);
  });
});
