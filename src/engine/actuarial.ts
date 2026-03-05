// FEDEA Annex exact actuarial factor calculation.
// Two-step formula from Devesa, Doménech & Meneu (2025), FEDEA EEE 2025/22.
// All functions are pure with zero side effects.
import type { MortalityTable } from "./types";

/**
 * Compute curtate life expectancy at a given age from qx values.
 * e_x = sum_{t=1}^{omega-x} of t_p_x
 */
function curtateLifeExpectancy(fromAge: number, qx: readonly number[]): number {
  let le = 0;
  let pSurv = 1.0;
  for (let age = fromAge; age < qx.length; age++) {
    pSurv *= 1 - qx[age];
    le += pSurv;
  }
  return le;
}

/**
 * Build a generational mortality table by calibrating period qx values
 * so that curtate life expectancy at `calibrationAge` matches `targetLE`.
 *
 * Uses bisection to find a uniform scaling factor k such that:
 *   curtateLE(calibrationAge, qx_period * k) = targetLE
 *
 * This approximates projected/cohort mortality from a period table,
 * accounting for future mortality improvements that the period table ignores.
 */
export function buildGenerationalTable(
  periodTable: MortalityTable,
  calibrationAge: number,
  targetLE: number,
): MortalityTable {
  let lo = 0.01;
  let hi = 2.0;
  let bestK = 1.0;

  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    const scaledQx = periodTable.qx.map((q) => Math.min(q * mid, 1.0));
    const le = curtateLifeExpectancy(calibrationAge, scaledQx);

    bestK = mid;
    if (Math.abs(le - targetLE) < 0.001) break;

    if (le < targetLE) {
      hi = mid; // LE too low → reduce qx (lower k)
    } else {
      lo = mid; // LE too high → increase qx (higher k)
    }
  }

  return {
    ...periodTable,
    source: `${periodTable.source} (generational, k=${bestK.toFixed(4)})`,
    qx: periodTable.qx.map((q) => Math.min(q * bestK, 1.0)),
  };
}

/**
 * Compute survival probability from fromAge to toAge.
 * (toAge - fromAge)_p_{fromAge} = product of (1 - qx[k]) for k in [fromAge, toAge-1]
 */
export function survivalProbability(
  fromAge: number,
  toAge: number,
  mortalityTable: MortalityTable,
): number {
  if (toAge <= fromAge) return 1.0;

  let prob = 1.0;
  for (let k = fromAge; k < toAge; k++) {
    if (k >= mortalityTable.qx.length) return 0;
    prob *= 1 - mortalityTable.qx[k];
  }
  return prob;
}

/**
 * Step A: Base annuity factor (annual payments).
 *
 * alpha_a_{x_j} = SUM from t=x_j+1 to omega of [
 *   (1 + alpha)^(t - x_j - 1) / (1 + r)^(t - x_j) * (t - x_j)_p_{x_j}
 * ]
 *
 * where:
 * - r = nominal notional rate (real GDP growth + IPC)
 * - alpha = IPC revalorization rate
 * - (t - x_j)_p_{x_j} = survival probability from x_j to t
 * - omega = maximum age in mortality table
 */
export function calculateBaseAnnuityFactor(params: {
  readonly retirementAge: number;
  readonly mortalityTable: MortalityTable;
  readonly nominalNotionalRate: number;
  readonly ipcRevalorization: number;
  readonly maxAge: number;
}): number {
  const {
    retirementAge,
    mortalityTable,
    nominalNotionalRate,
    ipcRevalorization,
    maxAge,
  } = params;

  const xj = retirementAge;
  const r = nominalNotionalRate;
  const alpha = ipcRevalorization;

  let sum = 0;

  for (let t = xj + 1; t <= maxAge; t++) {
    const n = t - xj; // years from retirement

    // (1 + alpha)^(n - 1) — pension grows with IPC each year after first
    const numerator = Math.pow(1 + alpha, n - 1);

    // (1 + r)^n — discount factor
    const denominator = Math.pow(1 + r, n);

    // Survival probability from retirement age to age t
    const pSurv = survivalProbability(xj, t, mortalityTable);

    sum += (numerator / denominator) * pSurv;
  }

  return sum;
}

/**
 * Step B: Monthly-corrected annuity factor.
 *
 * alpha_a^(m)_{x_j} = alpha_a_{x_j} * (1 + (m-1)/(2m) * alpha) + (m-1)/(2m)
 *
 * where m = number of payments per year (12 for monthly).
 */
export function calculateActuarialFactor(params: {
  readonly retirementAge: number;
  readonly mortalityTable: MortalityTable;
  readonly nominalNotionalRate: number;
  readonly ipcRevalorization: number;
  readonly maxAge: number;
  readonly monthlyPayments: number;
}): number {
  const { monthlyPayments, ipcRevalorization, ...baseParams } = params;

  const baseAF = calculateBaseAnnuityFactor({
    ...baseParams,
    ipcRevalorization,
  });

  const m = monthlyPayments;
  const alpha = ipcRevalorization;
  const correction = (m - 1) / (2 * m);

  return baseAF * (1 + correction * alpha) + correction;
}
