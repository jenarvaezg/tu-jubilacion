// Generate yearly pension projections from retirement to max age.
// Supports both real and nominal euro values.
import type { YearlyProjection } from "./types";
import { revalorizePension } from "./inflation";

interface TimelineParams {
  readonly retirementAge: number;
  readonly initialMonthlyPension: number;
  readonly revalorizationRate: number;
  readonly ipcRate: number;
  readonly currentYear: number;
  readonly currentAge: number;
  readonly maxAge: number;
}

/**
 * Generate yearly pension projections from retirement age to max age.
 * Each year shows both real (constant euros) and nominal (actual euros) values.
 *
 * @param params - Timeline generation parameters
 * @returns Array of yearly projections
 */
export function generateTimeline(
  params: TimelineParams,
): readonly YearlyProjection[] {
  const {
    retirementAge,
    initialMonthlyPension,
    revalorizationRate,
    ipcRate,
    currentYear,
    currentAge,
    maxAge,
  } = params;

  const retirementYear = currentYear + (retirementAge - currentAge);
  const projections: YearlyProjection[] = [];

  for (let age = retirementAge; age <= maxAge; age++) {
    const year = retirementYear + (age - retirementAge);
    const yearsFromRetirement = age - retirementAge;
    const yearsFromNow = age - currentAge;

    // Nominal pension: grows with revalorization rate each year
    const monthlyNominal = revalorizePension(
      initialMonthlyPension,
      yearsFromRetirement,
      revalorizationRate,
    );

    // Real pension: nominal adjusted back to today's purchasing power
    // If revalorization == IPC, real pension stays constant
    // If revalorization < IPC, real pension decreases over time
    const monthlyReal = monthlyNominal / Math.pow(1 + ipcRate, yearsFromNow);

    projections.push({
      age,
      year,
      monthlyPensionReal: Math.round(monthlyReal * 100) / 100,
      monthlyPensionNominal: Math.round(monthlyNominal * 100) / 100,
    });
  }

  return projections;
}
