// Salary pipeline: net-to-gross conversion, IRPF calculation, base cotización
// All functions are pure with zero side effects.
import type { CcaaCode, IRPFResult, UserProfile } from "./types";
import { IRPF_TABLES } from "../data/irpf-tables";
import { SS_RULES } from "../data/ss-tables";

/**
 * Calculate IRPF tax for a given annual gross income in a specific CCAA.
 * Applies work income deduction (reducción por rendimientos del trabajo)
 * before computing tax from brackets.
 * Returns tax amount, effective rate, and work income deduction applied.
 */
export function calculateIRPF(
  grossAnnual: number,
  ccaa: CcaaCode,
): IRPFResult {
  const table = IRPF_TABLES[ccaa];

  // Step 1: Calculate SS worker contribution (deductible from IRPF base)
  const ssWorkerAnnual = grossAnnual * SS_RULES.workerContributionRate;

  // Step 2: Rendimiento neto del trabajo = gross - SS worker contribution
  const netWorkIncome = grossAnnual - ssWorkerAnnual;

  // Step 3: Apply work income deduction (reducción por rendimientos del trabajo)
  const workDeduction = computeWorkIncomeDeduction(
    netWorkIncome,
    table.workIncomeDeduction.brackets,
  );

  // Step 4: Base liquidable = rendimiento neto - reducción - mínimo personal
  const baseLiquidable = Math.max(
    0,
    netWorkIncome - workDeduction - table.personalMinimum,
  );

  // Step 5: Apply tax brackets to base liquidable
  const tax = applyBrackets(baseLiquidable, table.brackets);

  // Step 6: Subtract tax credit from personal minimum
  const personalMinTax = applyBrackets(table.personalMinimum, table.brackets);
  const finalTax = Math.max(0, tax - personalMinTax);

  const effectiveRate = grossAnnual > 0 ? finalTax / grossAnnual : 0;

  return {
    tax: finalTax,
    effectiveRate,
    workIncomeDeduction: workDeduction,
  };
}

/**
 * Compute work income deduction based on net work income.
 * Art. 20 LIRPF:
 * - Income <= 14,047.50: deduction = 7,302
 * - 14,047.50 < income <= 19,747.50: 7,302 - 1.14 * (income - 14,047.50)
 * - Income > 19,747.50: deduction = 2,000
 */
function computeWorkIncomeDeduction(
  netWorkIncome: number,
  brackets: readonly {
    readonly upTo: number;
    readonly deduction: number;
    readonly marginalReduction: number;
  }[],
): number {
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    if (netWorkIncome <= bracket.upTo) {
      if (bracket.marginalReduction === 0) {
        return bracket.deduction;
      }
      // Interpolated deduction
      const prevUpTo = i > 0 ? brackets[i - 1].upTo : 0;
      const excess = netWorkIncome - prevUpTo;
      return Math.max(
        0,
        bracket.deduction - bracket.marginalReduction * excess,
      );
    }
  }
  // Fallback: last bracket deduction
  return brackets[brackets.length - 1].deduction;
}

/**
 * Apply marginal tax brackets to a taxable amount.
 * Returns total tax.
 */
function applyBrackets(
  amount: number,
  brackets: readonly {
    readonly from: number;
    readonly to: number;
    readonly marginalRate: number;
  }[],
): number {
  let tax = 0;
  let remaining = amount;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const bracketWidth = bracket.to - bracket.from;
    const taxableInBracket = Math.min(remaining, bracketWidth);
    tax += taxableInBracket * bracket.marginalRate;
    remaining -= taxableInBracket;
  }

  return tax;
}

/**
 * Convert gross monthly salary to base de cotización.
 * Clamps to [baseMin, baseMax].
 */
export function grossToBaseCotizacion(grossMonthly: number): number {
  return Math.min(
    Math.max(grossMonthly, SS_RULES.baseMinMonthly),
    SS_RULES.baseMaxMonthly,
  );
}

/**
 * Normalize a per-payment gross salary to the monthly amount used as
 * contribution base input (12-month basis with extras prorated).
 *
 * - 14 payments (extras aparte): annual = monthly * 14 -> contribution monthly = annual / 12
 * - 12 payments (prorrateadas): annual = monthly * 12 -> contribution monthly = annual / 12 (= monthly)
 */
export function grossMonthlyToContributionMonthly(
  grossMonthly: number,
  pagasExtra: boolean,
): number {
  const annualGross = monthlyToAnnualGross(grossMonthly, pagasExtra);
  return annualGross / 12;
}

/**
 * Convert net monthly salary to gross using bisection method.
 * Bisection is preferred over Newton-Raphson because IRPF bracket
 * discontinuities create non-smooth derivatives.
 *
 * @param netMonthly - Net monthly salary (what the worker receives)
 * @param ccaa - Autonomous community for IRPF calculation
 * @param pagasExtra - true if pagas extra are separate (14 payments)
 * @returns Gross monthly salary
 */
export function netToGross(
  netMonthly: number,
  ccaa: CcaaCode,
  pagasExtra: boolean,
): number {
  const paymentsPerYear = pagasExtra ? 14 : 12;
  const netAnnual = netMonthly * paymentsPerYear;

  // Bisection bounds: gross is always >= net, and realistically <= 3x net
  let lo = netAnnual;
  let hi = netAnnual * 3;
  const maxIterations = 100;
  const tolerance = 0.01;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (lo + hi) / 2;
    const computedNet = grossToNetAnnual(mid, ccaa);
    const diff = computedNet - netAnnual;

    if (Math.abs(diff) < tolerance) {
      return mid / paymentsPerYear;
    }

    if (diff > 0) {
      // mid is too high (produces too much net)
      hi = mid;
    } else {
      // mid is too low
      lo = mid;
    }
  }

  // Return best approximation
  return (lo + hi) / 2 / paymentsPerYear;
}

/**
 * Given annual gross, compute annual net (after IRPF and SS worker contribution).
 */
export function grossToNetAnnual(grossAnnual: number, ccaa: CcaaCode): number {
  const ssWorker = grossAnnual * SS_RULES.workerContributionRate;
  const irpf = calculateIRPF(grossAnnual, ccaa);
  return grossAnnual - ssWorker - irpf.tax;
}

/**
 * Derive the user's current monthly lifestyle budget on a 12-month basis.
 * This normalizes both 12- and 14-payment salaries to a comparable monthly
 * spending target for retirement planning.
 */
export function deriveMonthlyLifestyleTarget(
  profile: Pick<UserProfile, "monthlySalary" | "salaryType" | "ccaa" | "pagasExtra">,
): number {
  const annualNet =
    profile.salaryType === "net"
      ? profile.monthlySalary * (profile.pagasExtra ? 14 : 12)
      : grossToNetAnnual(
          monthlyToAnnualGross(profile.monthlySalary, profile.pagasExtra),
          profile.ccaa,
        );

  return Math.round((annualNet / 12) * 100) / 100;
}

/**
 * Compute the annual gross salary from monthly salary and payment type.
 */
export function monthlyToAnnualGross(
  monthlySalary: number,
  pagasExtra: boolean,
): number {
  return monthlySalary * (pagasExtra ? 14 : 12);
}
