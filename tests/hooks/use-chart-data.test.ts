import { describe, expect, it } from "vitest";
import { calculateCurrentLaw } from "../../src/engine/scenarios/current-law";
import { calculateFEDEATransition } from "../../src/engine/scenarios/fedea-transition";
import { calculateNotionalAccounts } from "../../src/engine/scenarios/notional-accounts";
import { calculateSustainability2013 } from "../../src/engine/scenarios/sustainability-2013";
import { calculateEUConvergence } from "../../src/engine/scenarios/eu-convergence";
import { calculateGreeceHaircut } from "../../src/engine/scenarios/greece-haircut";
import { DEFAULT_STATE } from "../../src/state/defaults";
import {
  buildChartData,
  getChartStartAge,
  nominalKey,
  realKey,
} from "../../src/hooks/use-chart-data";
import type { ScenarioId } from "../../src/engine/types";

const SCENARIOS: readonly ScenarioId[] = [
  "current-law",
  "fedea-transition",
  "notional-accounts",
  "sustainability-2013",
  "eu-convergence",
  "greece-haircut",
];

function buildDefaultResults() {
  const profile = DEFAULT_STATE.calculation.profile;
  const sharedConfig = {
    ipcRate: DEFAULT_STATE.calculation.ipcRate,
    salaryGrowthRate: DEFAULT_STATE.calculation.salaryGrowthRate,
  };

  return [
    calculateCurrentLaw(profile, sharedConfig),
    calculateFEDEATransition(profile, {
      ...sharedConfig,
      notionalGrowthScenario: DEFAULT_STATE.calculation.notionalGrowthScenario,
    }),
    calculateNotionalAccounts(profile, {
      ...sharedConfig,
      notionalGrowthScenario: DEFAULT_STATE.calculation.notionalGrowthScenario,
    }),
    calculateSustainability2013(profile, sharedConfig),
    calculateEUConvergence(profile, sharedConfig),
    calculateGreeceHaircut(profile, {
      ...sharedConfig,
      haircutRate: DEFAULT_STATE.calculation.greeceHaircutRate,
    }),
  ] as const;
}

describe("buildChartData", () => {
  it("focuses the chart on the years close to retirement", () => {
    const profile = DEFAULT_STATE.calculation.profile;
    const chartData = buildChartData({
      results: buildDefaultResults(),
      displayMode: "real",
      currentAge: profile.age,
    });
    const expectedStartAge = getChartStartAge(
      profile.age,
      profile.desiredRetirementAge,
    );

    expect(chartData.length).toBe(90 - expectedStartAge + 1);
    expect(chartData[0].age).toBe(expectedStartAge);
    expect(chartData[chartData.length - 1].age).toBe(90);
  });

  it("keeps pension values undefined before retirement and fills them at retirement", () => {
    const profile = DEFAULT_STATE.calculation.profile;
    const chartData = buildChartData({
      results: buildDefaultResults(),
      displayMode: "real",
      currentAge: profile.age,
    });

    const beforeRetirement = chartData.find(
      (p) => p.age === profile.desiredRetirementAge - 1,
    );
    const atRetirement = chartData.find(
      (p) => p.age === profile.desiredRetirementAge,
    );

    expect(beforeRetirement).toBeDefined();
    expect(atRetirement).toBeDefined();

    for (const scenarioId of SCENARIOS) {
      expect(beforeRetirement?.[scenarioId]).toBeUndefined();
      expect(atRetirement?.[scenarioId]).toBeTypeOf("number");
      expect(atRetirement?.[realKey(scenarioId)]).toBeTypeOf("number");
      expect(atRetirement?.[nominalKey(scenarioId)]).toBeTypeOf("number");
    }
  });
});
