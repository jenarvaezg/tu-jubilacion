// Salary and contribution base projection over time.
// All functions are pure with zero side effects.
import type { ProjectedBase } from "./types";
import { SS_RULES } from "../data/ss-tables";

/**
 * Project contribution bases from current age to retirement age.
 * Base limits (max/min) grow at the IPC rate each year, matching
 * how the Spanish government adjusts SS limits annually.
 *
 * @param currentBase - Current monthly contribution base
 * @param currentAge - Current age of the worker
 * @param retirementAge - Desired retirement age
 * @param realSalaryGrowthRate - Annual real salary growth rate
 * @param currentYear - Current calendar year
 * @param ipcRate - Annual IPC rate for projecting base limits (default 0)
 * @returns Array of projected yearly bases from current age to retirement
 */
export function projectBases(params: {
  readonly currentBase: number;
  readonly currentAge: number;
  readonly retirementAge: number;
  readonly realSalaryGrowthRate: number;
  readonly currentYear: number;
  readonly ipcRate?: number;
}): readonly ProjectedBase[] {
  const {
    currentBase,
    currentAge,
    retirementAge,
    realSalaryGrowthRate,
    currentYear,
    ipcRate = 0,
  } = params;

  const yearsToRetirement = retirementAge - currentAge;
  if (yearsToRetirement <= 0) return [];

  const projections: ProjectedBase[] = [];

  for (let i = 0; i <= yearsToRetirement; i++) {
    const year = currentYear + i;
    // Salary grows at real rate each year (compounding)
    const growthFactor = Math.pow(1 + realSalaryGrowthRate, i);
    const projectedGrossMonthly = currentBase * growthFactor;
    // Base max ceiling grows at IPC rate each year (government adjusts annually).
    // Base min stays at current value since our projection is in real terms.
    const yearBaseMax = SS_RULES.baseMaxMonthly * Math.pow(1 + ipcRate, i);
    const monthlyBase = Math.min(
      Math.max(projectedGrossMonthly, SS_RULES.baseMinMonthly),
      yearBaseMax,
    );
    // projectedGrossMonthly is already on a 12-month contribution basis
    // (extras prorated when needed), so annual is x12.
    const annualGrossSalary = projectedGrossMonthly * 12;

    projections.push({
      year,
      monthlyBase,
      annualGrossSalary,
    });
  }

  return projections;
}

/**
 * Get the last N monthly bases from projected bases.
 * Used to compute base reguladora (348 month window in current calibration).
 *
 * @param projectedBases - All projected yearly bases
 * @param yearsWorked - Total years already worked
 * @param monthsNeeded - Number of months needed (window size, e.g. 348)
 * @returns Array of monthly base values for the last N months
 */
export function getLastNMonthlyBases(
  projectedBases: readonly ProjectedBase[],
  yearsWorked: number,
  monthsNeeded: number,
): readonly number[] {
  // Each projected year represents 12 months of contributions at that base
  const allMonthlyBases: number[] = [];

  // Past contributions: approximate using earliest projected base
  // (we don't have actual historical bases, so we extrapolate backwards)
  const firstBase =
    projectedBases.length > 0 ? projectedBases[0].monthlyBase : 0;
  const pastMonths = yearsWorked * 12;
  for (let i = 0; i < pastMonths; i++) {
    allMonthlyBases.push(firstBase);
  }

  // Future contributions from projections
  for (const proj of projectedBases) {
    for (let m = 0; m < 12; m++) {
      allMonthlyBases.push(proj.monthlyBase);
    }
  }

  // Take the last N months
  const startIdx = Math.max(0, allMonthlyBases.length - monthsNeeded);
  return allMonthlyBases.slice(startIdx);
}

/**
 * Apply CPI actualization to monthly bases and select the best N.
 *
 * The SS calculator multiplies each historical base by cumulative CPI
 * to bring it to retirement-year euros, then selects the best N bases
 * from the M-month window.
 *
 * @param monthlyBases - Raw monthly bases (last M months before retirement)
 * @param ipcRate - Annual IPC rate (e.g. 0.02 for 2%)
 * @param selectBest - Number of best bases to select (e.g. 324)
 * @returns The selected actualized bases, sorted descending
 */
export function actualizeBases(
  monthlyBases: readonly number[],
  ipcRate: number,
  selectBest: number,
): readonly number[] {
  const totalMonths = monthlyBases.length;
  const monthlyIpc = Math.pow(1 + ipcRate, 1 / 12);

  // Actualize: multiply each base by CPI factor from its month to retirement.
  // monthlyBases[0] is the oldest (furthest from retirement), gets highest factor.
  // monthlyBases[totalMonths-1] is the most recent (closest to retirement).
  const actualized = monthlyBases.map((base, idx) => {
    const monthsUntilRetirement = totalMonths - idx;
    const factor = Math.pow(monthlyIpc, monthsUntilRetirement);
    return base * factor;
  });

  // Select best N (highest actualized values)
  const sorted = [...actualized].sort((a, b) => b - a);
  return sorted.slice(0, selectBest);
}
