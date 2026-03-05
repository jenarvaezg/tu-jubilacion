// Scenario 4: Convergencia UE (EU Convergence)
// Forces replacement rate to EU average (~60% of last gross salary)
import type { UserProfile, ScenarioResult } from "../types";
import {
  netToGross,
  monthlyToAnnualGross,
  calculateIRPF,
} from "../salary";
import { generateTimeline } from "../pension-timeline";
import { SS_RULES } from "../../data/ss-tables";

interface EUConvergenceConfig {
  readonly targetReplacementRate: number;
  readonly ipcRate: number;
  readonly currentYear: number;
}

const DEFAULT_CONFIG: EUConvergenceConfig = {
  targetReplacementRate: 0.6,
  ipcRate: 0.02,
  currentYear: 2025,
};

/**
 * Calculate pension under EU convergence scenario.
 *
 * Simple model: pension = lastGrossMonthly * targetReplacementRate
 * Then apply IPC revalorization for the timeline.
 */
export function calculateEUConvergence(
  profile: UserProfile,
  config: Partial<EUConvergenceConfig> = {},
): ScenarioResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const monthlyGross =
    profile.salaryType === "net"
      ? netToGross(profile.monthlySalary, profile.ccaa, profile.pagasExtra)
      : profile.monthlySalary;

  const annualGross = monthlyToAnnualGross(monthlyGross, profile.pagasExtra);
  const annualPension = annualGross * cfg.targetReplacementRate;
  const monthlyPension = annualPension / 14;

  const replacementRate = cfg.targetReplacementRate;

  const irpfResult = calculateIRPF(annualGross, profile.ccaa);
  const annualNet =
    annualGross -
    annualGross * SS_RULES.workerContributionRate -
    irpfResult.tax;
  const replacementRateNet = annualNet > 0 ? annualPension / annualNet : 0;

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
    scenarioId: "eu-convergence",
    scenarioName: "Convergencia UE (60%)",
    monthlyPension,
    annualPension,
    baseReguladora: monthlyGross,
    replacementRate,
    replacementRateNet,
    timeline,
  };
}
