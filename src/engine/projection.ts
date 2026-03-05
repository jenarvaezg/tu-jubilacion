// Salary and contribution base projection over time.
// All functions are pure with zero side effects.
import type { ProjectedBase } from "./types";
import { grossToBaseCotizacion } from "./salary";

/**
 * Project contribution bases from current age to retirement age.
 * Uses monthly precision internally (monthsContributed derived from yearsWorked * 12).
 *
 * @param currentBase - Current monthly contribution base
 * @param currentAge - Current age of the worker
 * @param retirementAge - Desired retirement age
 * @param realSalaryGrowthRate - Annual real salary growth rate (default 1%)
 * @param currentYear - Current calendar year (default 2025)
 * @returns Array of projected yearly bases from current age to retirement
 */
export function projectBases(params: {
  readonly currentBase: number;
  readonly currentAge: number;
  readonly retirementAge: number;
  readonly realSalaryGrowthRate: number;
  readonly currentYear: number;
}): readonly ProjectedBase[] {
  const {
    currentBase,
    currentAge,
    retirementAge,
    realSalaryGrowthRate,
    currentYear,
  } = params;

  const yearsToRetirement = retirementAge - currentAge;
  if (yearsToRetirement <= 0) return [];

  const projections: ProjectedBase[] = [];

  for (let i = 0; i <= yearsToRetirement; i++) {
    const year = currentYear + i;
    // Salary grows at real rate each year (compounding)
    const growthFactor = Math.pow(1 + realSalaryGrowthRate, i);
    const projectedGrossMonthly = currentBase * growthFactor;
    // Clamp to SS base limits (in real terms, bases also grow but we simplify)
    const monthlyBase = grossToBaseCotizacion(projectedGrossMonthly);
    const annualGrossSalary = projectedGrossMonthly * 14; // 14 pagas

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
 * Used to compute base reguladora (324 months in current calibration).
 *
 * @param projectedBases - All projected yearly bases
 * @param yearsWorked - Total years already worked
 * @param monthsNeeded - Number of months needed for regulatory base (300)
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
