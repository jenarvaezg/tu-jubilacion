// Scenario 3: Factor de Sostenibilidad 2013 (Rajoy reform, derogated)
// The 2013 sustainability factor + 0.25% revalorization (instead of IPC)
import type { UserProfile, ScenarioResult } from "../types";
import { getLifeExpectancy65 } from "../../data/life-expectancy";
import { calculateCurrentLaw } from "./current-law";
import { generateTimeline } from "../pension-timeline";

interface SustainabilityConfig {
  readonly ipcRate: number;
  readonly salaryGrowthRate: number;
  readonly currentYear: number;
  readonly referenceYear: number;
  readonly revalorizationRate: number;
}

const DEFAULT_CONFIG: SustainabilityConfig = {
  ipcRate: 0.02,
  salaryGrowthRate: 0.01,
  currentYear: 2025,
  referenceYear: 2024,
  revalorizationRate: 0.0025, // Fixed 0.25% annual revalorization
};

/**
 * Calculate pension with 2013 sustainability factor.
 *
 * Pipeline:
 * 1. Calculate current-law pension at retirement
 * 2. Apply sustainability factor: pension * (LE_reference / LE_retirement)
 * 3. Apply fixed 0.25% annual revalorization (not IPC)
 */
export function calculateSustainability2013(
  profile: UserProfile,
  config: Partial<SustainabilityConfig> = {},
): ScenarioResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Step 1: Get current-law pension
  const currentLaw = calculateCurrentLaw(profile, {
    ipcRate: cfg.ipcRate,
    salaryGrowthRate: cfg.salaryGrowthRate,
    currentYear: cfg.currentYear,
  });

  // Step 2: Sustainability factor
  const retirementYear =
    cfg.currentYear + (profile.desiredRetirementAge - profile.age);
  const leReference = getLifeExpectancy65(cfg.referenceYear);
  const leRetirement = getLifeExpectancy65(retirementYear);

  // Factor < 1 if life expectancy increases (which it always does)
  const sustainabilityFactor =
    leRetirement > 0 ? leReference / leRetirement : 1;

  const monthlyPension = currentLaw.monthlyPension * sustainabilityFactor;
  const annualPension = monthlyPension * 14;

  // Step 3: Timeline with 0.25% revalorization (NOT IPC)
  const timeline = generateTimeline({
    retirementAge: profile.desiredRetirementAge,
    initialMonthlyPension: monthlyPension,
    revalorizationRate: cfg.revalorizationRate,
    ipcRate: cfg.ipcRate,
    currentYear: cfg.currentYear,
    currentAge: profile.age,
    maxAge: 90,
  });

  // Replacement rates use the adjusted pension
  const replacementRate =
    currentLaw.replacementRate * sustainabilityFactor;
  const replacementRateNet =
    currentLaw.replacementRateNet * sustainabilityFactor;

  return {
    scenarioId: "sustainability-2013",
    scenarioName: "Sostenibilidad 2013 (Rajoy)",
    monthlyPension,
    annualPension,
    baseReguladora: currentLaw.baseReguladora,
    replacementRate,
    replacementRateNet,
    timeline,
  };
}
