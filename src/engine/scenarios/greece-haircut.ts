// Scenario 5: Recorte Grecia (Greece-style Haircut)
// Applies a parametric haircut to the current-law pension.
import type { UserProfile, ScenarioResult } from "../types";
import { calculateCurrentLaw } from "./current-law";
import { generateTimeline } from "../pension-timeline";

interface GreeceHaircutConfig {
  readonly haircutRate: number;
  readonly ipcRate: number;
  readonly salaryGrowthRate: number;
  readonly currentYear: number;
}

const DEFAULT_CONFIG: GreeceHaircutConfig = {
  haircutRate: 0.3,
  ipcRate: 0.02,
  salaryGrowthRate: 0,
  currentYear: 2025,
};

/**
 * Calculate pension with a Greece-style haircut.
 *
 * Pipeline:
 * 1. Calculate current-law pension
 * 2. Apply haircut: pension * (1 - haircutRate)
 * 3. Same IPC revalorization after retirement
 */
export function calculateGreeceHaircut(
  profile: UserProfile,
  config: Partial<GreeceHaircutConfig> = {},
): ScenarioResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const currentLaw = calculateCurrentLaw(profile, {
    ipcRate: cfg.ipcRate,
    salaryGrowthRate: cfg.salaryGrowthRate,
    currentYear: cfg.currentYear,
  });

  const monthlyPension = currentLaw.monthlyPension * (1 - cfg.haircutRate);
  const annualPension = monthlyPension * 14;

  const timeline = generateTimeline({
    retirementAge: profile.desiredRetirementAge,
    initialMonthlyPension: monthlyPension,
    revalorizationRate: cfg.ipcRate,
    ipcRate: cfg.ipcRate,
    currentYear: cfg.currentYear,
    currentAge: profile.age,
    maxAge: 90,
  });

  return {
    scenarioId: "greece-haircut",
    scenarioName: "Recorte Grecia (-30%)",
    monthlyPension,
    annualPension,
    baseReguladora: currentLaw.baseReguladora,
    replacementRate: currentLaw.replacementRate * (1 - cfg.haircutRate),
    replacementRateNet: currentLaw.replacementRateNet * (1 - cfg.haircutRate),
    timeline,
  };
}
