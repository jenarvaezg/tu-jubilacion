// Scenario 1: Legislación Vigente (Current Law)
// Calculates pension under current Spanish SS legislation.
// Source: LGSS art. 205-215, reformed by Ley 21/2021 and RD-ley 2/2023
import {
  DEFAULT_PERSONAL_SITUATIONS,
  type PersonalSituations,
  type UserProfile,
  type ScenarioResult,
} from "../types";
import { SS_RULES } from "../../data/ss-tables";
import {
  netToGross,
  grossToBaseCotizacion,
  calculateIRPF,
  monthlyToAnnualGross,
} from "../salary";
import { projectBases, getLastNMonthlyBases } from "../projection";
import { generateTimeline } from "../pension-timeline";

interface CurrentLawConfig {
  readonly ipcRate: number;
  readonly salaryGrowthRate: number;
  readonly currentYear: number;
}

const DEFAULT_CONFIG: CurrentLawConfig = {
  ipcRate: 0.02,
  salaryGrowthRate: 0,
  currentYear: 2025,
};

/**
 * Calculate pension under current Spanish legislation (Legislación Vigente).
 *
 * Pipeline:
 * 1. Derive gross salary (if net provided)
 * 2. Compute base de cotización
 * 3. Project bases forward to retirement
 * 4. Compute base reguladora (324 months / 396, calibrated for future cohorts)
 * 5. Apply coefficient scale based on years contributed
 * 6. Apply early/late retirement adjustments
 * 7. Cap at pension max/min
 * 8. Generate timeline with IPC revalorization
 */
export function calculateCurrentLaw(
  profile: UserProfile,
  config: Partial<CurrentLawConfig> = {},
): ScenarioResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const personalSituations = getPersonalSituations(profile);

  // Step 1: Get monthly gross salary
  const monthlyGross =
    profile.salaryType === "net"
      ? netToGross(profile.monthlySalary, profile.ccaa, profile.pagasExtra)
      : profile.monthlySalary;

  // Step 2: Base de cotización
  const currentBase = grossToBaseCotizacion(monthlyGross);

  // Step 3: Project bases forward
  const projected = projectBases({
    currentBase,
    currentAge: profile.age,
    retirementAge: profile.desiredRetirementAge,
    realSalaryGrowthRate: cfg.salaryGrowthRate,
    currentYear: cfg.currentYear,
  });

  // Total months contributed at retirement
  const yearsToRetirement = profile.desiredRetirementAge - profile.age;
  const totalYearsContributed =
    profile.yearsWorked +
    yearsToRetirement +
    personalSituations.foreignContributionYears;
  const totalMonthsContributed = totalYearsContributed * 12;

  // Step 4: Base reguladora
  const lastMonthlyBases = getLastNMonthlyBases(
    projected,
    profile.yearsWorked,
    SS_RULES.regulatoryBaseMonths,
  );
  const sumBases = lastMonthlyBases.reduce((acc, b) => acc + b, 0);
  const baseReguladora = sumBases / SS_RULES.regulatoryBaseDivisor;

  // Step 5: Coefficient by years contributed
  const coefficient = computeCoefficient(totalMonthsContributed);

  // Step 6: Early/late retirement adjustment
  const legalAge = getLegalRetirementAge(totalYearsContributed, personalSituations);
  const ageAdjustment = computeAgeAdjustment(
    profile.desiredRetirementAge,
    legalAge,
    totalYearsContributed,
    personalSituations,
  );

  // Step 7: Monthly pension (one of 14 pagas)
  let monthlyPension = baseReguladora * coefficient * ageAdjustment;

  // Keep legal minimum floor.
  // We intentionally do not apply a static max cap here because using
  // today's cap for cohorts retiring in 2050+ severely underestimates
  // results versus the official simulator.
  monthlyPension = Math.max(monthlyPension, SS_RULES.pensionMinMonthly);

  // Complemento por hijos (modelo simplificado del complemento por brecha de genero).
  monthlyPension += computeChildrenComplement(
    personalSituations.childrenCount,
  );

  // Annual pension (14 pagas)
  const annualPension = monthlyPension * SS_RULES.paymentsPerYear;

  // Replacement rate vs last gross salary
  const annualGross = monthlyToAnnualGross(monthlyGross, profile.pagasExtra);
  const replacementRate = annualGross > 0 ? annualPension / annualGross : 0;

  // Replacement rate vs net salary
  const irpfResult = calculateIRPF(annualGross, profile.ccaa);
  const annualNet =
    annualGross -
    annualGross * SS_RULES.workerContributionRate -
    irpfResult.tax;
  const replacementRateNet = annualNet > 0 ? annualPension / annualNet : 0;

  // Step 8: Generate timeline (IPC revalorization)
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
    scenarioId: "current-law",
    scenarioName: "Legislación Vigente",
    monthlyPension,
    annualPension,
    baseReguladora,
    replacementRate,
    replacementRateNet,
    timeline,
  };
}

/**
 * Determine legal retirement age based on years contributed.
 * - 65 with >= 38.5 years contributed
 * - 67 otherwise
 */
function getLegalRetirementAge(
  yearsContributed: number,
  situations: PersonalSituations,
): number {
  const baseAge =
    yearsContributed >= SS_RULES.reducedRetirementYearsRequired
    ? SS_RULES.reducedRetirementAge
    : SS_RULES.legalRetirementAge;

  const reduction = getSpecialLegalAgeReduction(situations);
  return Math.max(60, baseAge - reduction);
}

/**
 * Compute the percentage of base reguladora based on months contributed.
 * Scale (LGSS art. 210):
 * - First 180 months (15 years): 50%
 * - Months 181-229 (49 months): +0.21% per month
 * - Months 230-389 (160 months): +0.19% per month
 * - Max 438 months (36.5 years): 100%
 */
function computeCoefficient(totalMonthsContributed: number): number {
  if (totalMonthsContributed < 180) {
    // Less than 15 years: no pension right (but we return proportional for display)
    return 0;
  }

  let percentage = 0.5; // 50% at 180 months

  const { coefficientScale } = SS_RULES;

  for (const bracket of coefficientScale) {
    if (bracket.ratePerMonth === 0) continue; // Skip the base bracket

    const monthsInBracket = Math.min(
      Math.max(0, totalMonthsContributed - bracket.fromMonth + 1),
      bracket.toMonth - bracket.fromMonth + 1,
    );

    percentage += monthsInBracket * bracket.ratePerMonth;
  }

  return Math.min(1.0, percentage);
}

/**
 * Compute age adjustment factor for early/late retirement.
 * - Early retirement: penalty per month of anticipation
 * - On-time: factor = 1.0
 * - Late retirement: bonus per year of delay
 */
function computeAgeAdjustment(
  desiredAge: number,
  legalAge: number,
  yearsContributed: number,
  situations: PersonalSituations,
): number {
  if (desiredAge === legalAge) {
    return 1.0;
  }

  if (desiredAge < legalAge) {
    // Early retirement penalty
    const monthsEarly = Math.min(24, Math.round((legalAge - desiredAge) * 12));
    let penalty = computeEarlyPenalty(monthsEarly, yearsContributed);
    if (situations.involuntaryEarlyRetirement) {
      penalty *= SS_RULES.involuntaryEarlyPenaltyRelief;
    }
    return Math.max(0, 1.0 - penalty);
  }

  // Late retirement bonus
  const yearsLate = desiredAge - legalAge;
  const bonusRow = findBonusRate(yearsContributed);
  return 1.0 + yearsLate * bonusRow;
}

/**
 * Compute early retirement penalty using 12/24 month anchors.
 * - 0..12 months: linear interpolation from 0 to penaltyAt12Months
 * - 13..24 months: linear interpolation from penaltyAt12Months to penaltyAt24Months
 */
function computeEarlyPenalty(
  monthsEarly: number,
  yearsContributed: number,
): number {
  const penalties = SS_RULES.earlyRetirementPenalties;
  const months = Math.max(0, Math.min(24, monthsEarly));
  if (months === 0) return 0;

  for (const row of penalties) {
    if (
      yearsContributed >= row.minYearsContributed &&
      yearsContributed < row.maxYearsContributed
    ) {
      if (months <= 12) {
        return (row.penaltyAt12Months * months) / 12;
      }
      return (
        row.penaltyAt12Months +
        ((row.penaltyAt24Months - row.penaltyAt12Months) * (months - 12)) / 12
      );
    }
  }

  // Default to highest-penalty row if no bracket matches.
  const fallback = penalties[0];
  if (months <= 12) {
    return (fallback.penaltyAt12Months * months) / 12;
  }
  return (
    fallback.penaltyAt12Months +
    ((fallback.penaltyAt24Months - fallback.penaltyAt12Months) *
      (months - 12)) /
      12
  );
}

/**
 * Find the applicable annual bonus rate based on years contributed.
 */
function findBonusRate(yearsContributed: number): number {
  const bonuses = SS_RULES.lateRetirementBonus;
  let rate = bonuses[0].bonusPerYear;
  for (const row of bonuses) {
    if (yearsContributed >= row.minYearsContributed) {
      rate = row.bonusPerYear;
    }
  }
  return rate;
}

function getPersonalSituations(profile: UserProfile): PersonalSituations {
  return {
    ...DEFAULT_PERSONAL_SITUATIONS,
    ...(profile.personalSituations ?? {}),
  };
}

function getSpecialLegalAgeReduction(situations: PersonalSituations): number {
  let reduction = 0;
  if (situations.hazardousJob) {
    reduction += 2;
  }
  if (situations.disabilityLevel === "33") {
    reduction += 1;
  } else if (situations.disabilityLevel === "65") {
    reduction += 2;
  }
  return Math.min(4, reduction);
}

function computeChildrenComplement(childrenCount: number): number {
  const children = Math.max(
    0,
    Math.min(SS_RULES.childComplementMaxChildren, Math.round(childrenCount)),
  );
  return children * SS_RULES.childComplementPerMonth;
}
