// Scenario 2: Cuentas Nocionales (Notional Accounts) - FEDEA model
// Source: Devesa, Doménech & Meneu (2025), FEDEA EEE 2025/22
import type { UserProfile, ScenarioResult } from "../types";
import { FEDEA_PARAMS } from "../../data/fedea-params";
import { MORTALITY_TABLE_2023 } from "../../data/mortality-tables";
import { getLifeExpectancy65 } from "../../data/life-expectancy";
import { calculateActuarialFactor, buildGenerationalTable } from "../actuarial";
import {
  netToGross,
  grossToBaseCotizacion,
  monthlyToAnnualGross,
  calculateIRPF,
} from "../salary";
import { projectBases } from "../projection";
import { generateTimeline } from "../pension-timeline";
import { SS_RULES } from "../../data/ss-tables";

interface NotionalConfig {
  readonly contributionRate: number;
  readonly notionalGrowthScenario: "historic" | "ageing-report";
  readonly ipcRate: number;
  readonly salaryGrowthRate: number;
  readonly currentYear: number;
}

const DEFAULT_CONFIG: NotionalConfig = {
  contributionRate: FEDEA_PARAMS.contributionRate,
  notionalGrowthScenario: "historic",
  ipcRate: 0.02,
  salaryGrowthRate: 0.01,
  currentYear: 2025,
};

/**
 * Calculate pension under a notional accounts system (FEDEA model).
 *
 * Pipeline:
 * 1. Derive gross salary and contribution base
 * 2. Project bases forward to retirement
 * 3. Accumulate notional capital with compound growth
 * 4. Compute actuarial factor (FEDEA exact two-step formula)
 * 5. pension_annual = notional_capital / actuarial_factor
 * 6. pension_monthly = pension_annual / 14
 */
export function calculateNotionalAccounts(
  profile: UserProfile,
  config: Partial<NotionalConfig> = {},
): ScenarioResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const gdpGrowthReal =
    cfg.notionalGrowthScenario === "historic"
      ? FEDEA_PARAMS.gdpGrowthHistoric
      : FEDEA_PARAMS.gdpGrowthAgeingReport;

  // Step 1: Get monthly gross salary
  const monthlyGross =
    profile.salaryType === "net"
      ? netToGross(profile.monthlySalary, profile.ccaa, profile.pagasExtra)
      : profile.monthlySalary;

  const currentBase = grossToBaseCotizacion(monthlyGross);

  // Step 2: Project bases
  const projected = projectBases({
    currentBase,
    currentAge: profile.age,
    retirementAge: profile.desiredRetirementAge,
    realSalaryGrowthRate: cfg.salaryGrowthRate,
    currentYear: cfg.currentYear,
  });

  // Step 3: Accumulate notional capital (all in REAL terms)
  //
  // Bases are in real (current-year) euros, so we work entirely in real terms:
  // - Capital accumulation: compound at real GDP growth (not nominal)
  // - Actuarial factor: use real notional rate with alpha=0
  //   (IPC-indexed pension has 0% real growth)
  //
  // This is mathematically equivalent to the FEDEA nominal formula but avoids
  // the need to inflate/deflate bases between real and nominal.
  const realNotionalRate = gdpGrowthReal;
  const yearsToRetirement = profile.desiredRetirementAge - profile.age;
  let notionalCapital = 0;

  // Past contributions: estimate past bases by deflating current base backwards
  // at the salary growth rate (worker earned less in the past)
  for (let y = 0; y < profile.yearsWorked; y++) {
    const yearsAgo = profile.yearsWorked - y; // how many years ago this contribution was made
    const yearsUntilRetirement = yearsToRetirement + yearsAgo;
    // Deflate current base to estimate what it was yearsAgo
    const pastBase = currentBase / Math.pow(1 + cfg.salaryGrowthRate, yearsAgo);
    const pastBaseClamped = Math.min(
      Math.max(pastBase, SS_RULES.baseMinMonthly),
      SS_RULES.baseMaxMonthly,
    );
    const annualContribution = pastBaseClamped * 12 * cfg.contributionRate;
    notionalCapital +=
      annualContribution * Math.pow(1 + realNotionalRate, yearsUntilRetirement);
  }

  // Future contributions from projections
  for (let i = 0; i < projected.length; i++) {
    const yearsUntilRetirement = yearsToRetirement - i;
    if (yearsUntilRetirement <= 0) break;
    const annualContribution =
      projected[i].monthlyBase * 12 * cfg.contributionRate;
    notionalCapital +=
      annualContribution * Math.pow(1 + realNotionalRate, yearsUntilRetirement);
  }

  // Step 4: Actuarial factor (in real terms)
  // Build generational mortality table calibrated to INE projected LE at 65
  // for the cohort's retirement year. The period table underestimates survival
  // because it ignores future mortality improvements.
  const retirementYear =
    cfg.currentYear + (profile.desiredRetirementAge - profile.age);
  const targetLE65 = getLifeExpectancy65(retirementYear);
  const generationalTable = buildGenerationalTable(
    MORTALITY_TABLE_2023,
    65,
    targetLE65,
  );

  // Since capital is in real euros, use real notional rate and alpha=0.
  // An IPC-indexed pension has 0% real growth rate, so alpha_real = 0.
  const actuarialFactor = calculateActuarialFactor({
    retirementAge: profile.desiredRetirementAge,
    mortalityTable: generationalTable,
    nominalNotionalRate: realNotionalRate,
    ipcRevalorization: 0,
    maxAge: 120,
    monthlyPayments: 12,
  });

  // Step 5: Annual pension
  const annualPension =
    actuarialFactor > 0 ? notionalCapital / actuarialFactor : 0;

  // Step 6: Monthly pension (14 pagas)
  const monthlyPension = annualPension / 14;

  // Replacement rates
  const annualGross = monthlyToAnnualGross(monthlyGross, profile.pagasExtra);
  const replacementRate = annualGross > 0 ? annualPension / annualGross : 0;

  const irpfResult = calculateIRPF(annualGross, profile.ccaa);
  const annualNet =
    annualGross -
    annualGross * SS_RULES.workerContributionRate -
    irpfResult.tax;
  const replacementRateNet = annualNet > 0 ? annualPension / annualNet : 0;

  // Timeline
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
    scenarioId: "notional-accounts",
    scenarioName: "Cuentas Nocionales (FEDEA)",
    monthlyPension,
    annualPension,
    baseReguladora: actuarialFactor, // Store AF for reference
    replacementRate,
    replacementRateNet,
    timeline,
  };
}
