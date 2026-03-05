import { describe, it, expect } from "vitest";
import { SS_RULES } from "../../src/data/ss-tables";
import { IRPF_TABLES } from "../../src/data/irpf-tables";
import { MORTALITY_TABLE_2023 } from "../../src/data/mortality-tables";
import { LIFE_EXPECTANCY_65 } from "../../src/data/life-expectancy";
import { FEDEA_PARAMS } from "../../src/data/fedea-params";

describe("SS Tables spot-checks", () => {
  it("base mínima mensual is 1381.20", () => {
    expect(SS_RULES.baseMinMonthly).toBe(1381.2);
  });

  it("base máxima mensual is 5101.20", () => {
    expect(SS_RULES.baseMaxMonthly).toBe(5101.2);
  });

  it("worker contribution rate is 6.47%", () => {
    expect(SS_RULES.workerContributionRate).toBe(0.0647);
  });

  it("payments per year is 14", () => {
    expect(SS_RULES.paymentsPerYear).toBe(14);
  });

  it("regulatory base is 324 months / 378", () => {
    expect(SS_RULES.regulatoryBaseMonths).toBe(324);
    expect(SS_RULES.regulatoryBaseDivisor).toBe(378);
  });

  it("legal retirement age is 67", () => {
    expect(SS_RULES.legalRetirementAge).toBe(67);
  });

  it("pension max monthly is 3175.04", () => {
    expect(SS_RULES.pensionMaxMonthly).toBe(3175.04);
  });

  it("early retirement 12-month penalties match official anchors", () => {
    expect(SS_RULES.earlyRetirementPenalties[0].penaltyAt12Months).toBe(0.055);
    expect(SS_RULES.earlyRetirementPenalties[1].penaltyAt12Months).toBe(0.0525);
    expect(SS_RULES.earlyRetirementPenalties[2].penaltyAt12Months).toBe(0.05);
    expect(SS_RULES.earlyRetirementPenalties[3].penaltyAt12Months).toBe(0.0475);
  });

  it("early retirement 24-month penalties match official anchors", () => {
    expect(SS_RULES.earlyRetirementPenalties[0].penaltyAt24Months).toBe(0.21);
    expect(SS_RULES.earlyRetirementPenalties[1].penaltyAt24Months).toBe(0.19);
    expect(SS_RULES.earlyRetirementPenalties[2].penaltyAt24Months).toBe(0.17);
    expect(SS_RULES.earlyRetirementPenalties[3].penaltyAt24Months).toBe(0.13);
  });
});

describe("IRPF Tables spot-checks", () => {
  it("Madrid has brackets defined", () => {
    const madrid = IRPF_TABLES["madrid"];
    expect(madrid.brackets.length).toBeGreaterThan(5);
  });

  it("Madrid lowest bracket starts at 0", () => {
    expect(IRPF_TABLES["madrid"].brackets[0].from).toBe(0);
  });

  it("Madrid top marginal rate is around 45%", () => {
    const madridBrackets = IRPF_TABLES["madrid"].brackets;
    const topRate = madridBrackets[madridBrackets.length - 1].marginalRate;
    expect(topRate).toBeCloseTo(0.45, 2);
  });

  it("work income deduction has brackets", () => {
    const deduction = IRPF_TABLES["madrid"].workIncomeDeduction;
    expect(deduction.brackets.length).toBe(3);
    expect(deduction.brackets[0].deduction).toBeGreaterThan(
      deduction.brackets[2].deduction,
    );
  });

  it("all CCAA tables exist", () => {
    const codes = [
      "madrid",
      "catalunya",
      "andalucia",
      "valencia",
      "pais-vasco",
      "other",
    ] as const;
    for (const code of codes) {
      expect(IRPF_TABLES[code]).toBeDefined();
      expect(IRPF_TABLES[code].brackets.length).toBeGreaterThan(0);
    }
  });
});

describe("Mortality Table spot-checks", () => {
  it("has 121 entries (ages 0-120)", () => {
    expect(MORTALITY_TABLE_2023.qx.length).toBe(121);
  });

  it("qx at age 0 is around 0.27%", () => {
    expect(MORTALITY_TABLE_2023.qx[0]).toBeCloseTo(0.00268, 4);
  });

  it("qx at age 65 is around 2.2%", () => {
    expect(MORTALITY_TABLE_2023.qx[65]).toBeCloseTo(0.02196, 3);
  });

  it("qx at age 75 is around 7.1%", () => {
    expect(MORTALITY_TABLE_2023.qx[75]).toBeCloseTo(0.07144, 3);
  });

  it("qx at age 85 is around 23.3%", () => {
    expect(MORTALITY_TABLE_2023.qx[85]).toBeCloseTo(0.23317, 3);
  });

  it("qx increases monotonically after age 30", () => {
    for (let age = 31; age < 121; age++) {
      expect(MORTALITY_TABLE_2023.qx[age]).toBeGreaterThanOrEqual(
        MORTALITY_TABLE_2023.qx[age - 1],
      );
    }
  });

  it("qx at age 120 is 1.0 (certain death)", () => {
    expect(MORTALITY_TABLE_2023.qx[120]).toBe(1.0);
  });
});

describe("Life Expectancy spot-checks", () => {
  it("life expectancy at 65 in 2024 is around 21.68", () => {
    const proj2024 = LIFE_EXPECTANCY_65.projections.find(
      (p) => p.year === 2024,
    );
    expect(proj2024).toBeDefined();
    expect(proj2024!.lifeExpectancy).toBeCloseTo(21.68, 1);
  });

  it("life expectancy increases over time", () => {
    const projections = LIFE_EXPECTANCY_65.projections;
    for (let i = 1; i < projections.length; i++) {
      expect(projections[i].lifeExpectancy).toBeGreaterThanOrEqual(
        projections[i - 1].lifeExpectancy,
      );
    }
  });
});

describe("FEDEA Params spot-checks", () => {
  it("contribution rate is 21%", () => {
    expect(FEDEA_PARAMS.contributionRate).toBe(0.21);
  });

  it("historic GDP growth is 2.24%", () => {
    expect(FEDEA_PARAMS.gdpGrowthHistoric).toBe(0.0224);
  });

  it("Ageing Report GDP growth is 1.23%", () => {
    expect(FEDEA_PARAMS.gdpGrowthAgeingReport).toBe(0.0123);
  });
});
