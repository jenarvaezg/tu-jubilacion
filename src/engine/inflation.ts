// IPC / inflation utility functions for real-nominal conversions.
// All functions are pure with zero side effects.

/**
 * Convert a real (today's money) amount to nominal (future money).
 * @param realAmount - Amount in today's euros
 * @param years - Number of years into the future
 * @param ipcRate - Annual inflation rate (e.g., 0.02 for 2%)
 */
export function realToNominal(
  realAmount: number,
  years: number,
  ipcRate: number,
): number {
  return realAmount * Math.pow(1 + ipcRate, years);
}

/**
 * Convert a nominal (future money) amount to real (today's money).
 * @param nominalAmount - Amount in future euros
 * @param years - Number of years from now
 * @param ipcRate - Annual inflation rate
 */
export function nominalToReal(
  nominalAmount: number,
  years: number,
  ipcRate: number,
): number {
  return nominalAmount / Math.pow(1 + ipcRate, years);
}

/**
 * Apply annual revalorization to a pension amount.
 * @param initialMonthly - Initial monthly pension at retirement
 * @param yearsFromRetirement - Years elapsed since retirement
 * @param revalorizationRate - Annual revalorization rate (e.g., IPC rate)
 */
export function revalorizePension(
  initialMonthly: number,
  yearsFromRetirement: number,
  revalorizationRate: number,
): number {
  return initialMonthly * Math.pow(1 + revalorizationRate, yearsFromRetirement);
}
