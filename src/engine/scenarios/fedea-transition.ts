import type { UserProfile, ScenarioResult } from "../types";
import { calculateCurrentLaw } from "./current-law";
import { calculateNotionalAccounts } from "./notional-accounts";
import { blendTimelines } from "../scenario-utils";

interface FEDEATransitionConfig {
  readonly ipcRate: number;
  readonly salaryGrowthRate: number;
  readonly notionalGrowthScenario: "historic" | "ageing-report";
  readonly currentYear: number;
}

const DEFAULT_CONFIG: FEDEATransitionConfig = {
  ipcRate: 0.02,
  salaryGrowthRate: 0,
  notionalGrowthScenario: "historic",
  currentYear: 2025,
};

function getNotionalWeight(profile: UserProfile, currentYear: number): number {
  const birthYear = currentYear - profile.age;
  return Math.max(0, Math.min(1, (birthYear - 1970) * 0.05));
}

export function calculateFEDEATransition(
  profile: UserProfile,
  config: Partial<FEDEATransitionConfig> = {},
): ScenarioResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const currentLaw = calculateCurrentLaw(profile, cfg);
  const notional = calculateNotionalAccounts(profile, cfg);
  const notionalWeight = getNotionalWeight(profile, cfg.currentYear);
  const currentLawWeight = 1 - notionalWeight;

  return {
    scenarioId: "fedea-transition",
    scenarioName: `Transicion FEDEA (${Math.round(notionalWeight * 100)}% nocional)`,
    monthlyPension:
      currentLaw.monthlyPension * currentLawWeight +
      notional.monthlyPension * notionalWeight,
    annualPension:
      currentLaw.annualPension * currentLawWeight +
      notional.annualPension * notionalWeight,
    baseReguladora:
      currentLaw.baseReguladora * currentLawWeight +
      notional.baseReguladora * notionalWeight,
    replacementRate:
      currentLaw.replacementRate * currentLawWeight +
      notional.replacementRate * notionalWeight,
    replacementRateNet:
      currentLaw.replacementRateNet * currentLawWeight +
      notional.replacementRateNet * notionalWeight,
    timeline: blendTimelines(currentLaw.timeline, notional.timeline, notionalWeight),
  };
}
