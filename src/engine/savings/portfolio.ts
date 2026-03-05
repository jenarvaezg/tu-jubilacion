// Portfolio math: future value, drawdown income, required savings, timeline.
// All functions are pure with zero side effects.
import type { SavingsResult, PortfolioYearlyProjection } from "./types";
import type { InvestmentProfileId } from "./types";
import { realToNominal } from "../inflation";
import { getLifeExpectancy65 } from "../../data/life-expectancy";

/**
 * Future value of monthly contributions at a fixed annual real return.
 * Standard FV of ordinary annuity: PMT * [((1+r)^n - 1) / r]
 * where r = monthly rate, n = total months.
 */
export function futureValueMonthly(
  monthlyContribution: number,
  annualRealReturn: number,
  years: number,
): number {
  if (years <= 0 || monthlyContribution <= 0) return 0;
  if (annualRealReturn === 0) return monthlyContribution * years * 12;

  const monthlyRate = Math.pow(1 + annualRealReturn, 1 / 12) - 1;
  const months = Math.round(years * 12);
  return (
    monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  );
}

/**
 * Monthly income from a portfolio using PMT annuity formula.
 * Computes the level monthly payment that exhausts the portfolio over drawdownYears
 * at realReturnDuringDrawdown.
 *
 * PMT = PV * r / (1 - (1+r)^-n)
 */
export function monthlyIncomeFromPortfolio(
  portfolioValue: number,
  drawdownYears: number,
  realReturnDuringDrawdown: number,
): number {
  if (portfolioValue <= 0 || drawdownYears <= 0) return 0;
  if (realReturnDuringDrawdown === 0)
    return portfolioValue / (drawdownYears * 12);

  const monthlyRate = Math.pow(1 + realReturnDuringDrawdown, 1 / 12) - 1;
  const months = Math.round(drawdownYears * 12);
  return (
    (portfolioValue * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
  );
}

/**
 * Required monthly savings to generate a target monthly income during drawdown.
 * Inverts: find the contribution that accumulates enough to fund targetMonthlyIncome
 * over drawdownYears at drawdownReturn, given yearsOfAccumulation at accumulationReturn.
 */
export function requiredMonthlySavings(
  targetMonthlyIncome: number,
  yearsOfAccumulation: number,
  drawdownYears: number,
  annualRealReturn: number,
  drawdownRealReturn: number,
): number {
  if (
    targetMonthlyIncome <= 0 ||
    yearsOfAccumulation <= 0 ||
    drawdownYears <= 0
  ) {
    return 0;
  }

  // Step 1: How much portfolio is needed to produce targetMonthlyIncome?
  // PV = PMT * (1 - (1+r)^-n) / r
  let requiredPortfolio: number;
  if (drawdownRealReturn === 0) {
    requiredPortfolio = targetMonthlyIncome * drawdownYears * 12;
  } else {
    const monthlyDrawdownRate = Math.pow(1 + drawdownRealReturn, 1 / 12) - 1;
    const drawdownMonths = Math.round(drawdownYears * 12);
    requiredPortfolio =
      (targetMonthlyIncome *
        (1 - Math.pow(1 + monthlyDrawdownRate, -drawdownMonths))) /
      monthlyDrawdownRate;
  }

  // Step 2: What monthly contribution produces that portfolio?
  if (annualRealReturn === 0) {
    return requiredPortfolio / (yearsOfAccumulation * 12);
  }

  const monthlyAccRate = Math.pow(1 + annualRealReturn, 1 / 12) - 1;
  const accMonths = Math.round(yearsOfAccumulation * 12);
  return (
    requiredPortfolio *
    (monthlyAccRate / (Math.pow(1 + monthlyAccRate, accMonths) - 1))
  );
}

/**
 * Derive drawdown years from life expectancy data.
 * If retirementAge < 65, adds extra years; if > 65, subtracts.
 */
export function deriveDrawdownYears(
  retirementAge: number,
  currentAge: number,
  currentYear: number,
): number {
  const retirementYear = currentYear + (retirementAge - currentAge);
  const le65 = getLifeExpectancy65(retirementYear);
  // Life expectancy at 65 + adjustment for retirement age
  const drawdown = le65 + (65 - retirementAge);
  return Math.max(5, Math.round(drawdown));
}

/**
 * Full savings calculation for a given gap and investment profile.
 */
export function calculateSavings(params: {
  readonly gapMonthly: number;
  readonly weightedRealReturn: number;
  readonly currentAge: number;
  readonly retirementAge: number;
  readonly drawdownYears: number;
  readonly profileId: InvestmentProfileId;
  readonly monthlyContributionOverride: number | null;
}): SavingsResult {
  const {
    gapMonthly,
    weightedRealReturn,
    currentAge,
    retirementAge,
    drawdownYears,
    profileId,
    monthlyContributionOverride,
  } = params;

  const yearsOfAccumulation = Math.max(0, retirementAge - currentAge);
  // Use a more conservative return during drawdown (closer to bonds)
  const drawdownReturn = Math.max(0, weightedRealReturn * 0.5);

  const autoContribution = requiredMonthlySavings(
    Math.max(0, gapMonthly),
    yearsOfAccumulation,
    drawdownYears,
    weightedRealReturn,
    drawdownReturn,
  );

  const monthlyContribution =
    monthlyContributionOverride !== null
      ? monthlyContributionOverride
      : autoContribution;

  const portfolioAtRetirement = futureValueMonthly(
    monthlyContribution,
    weightedRealReturn,
    yearsOfAccumulation,
  );

  const monthlyIncome = monthlyIncomeFromPortfolio(
    portfolioAtRetirement,
    drawdownYears,
    drawdownReturn,
  );

  return {
    monthlyContribution: Math.round(monthlyContribution * 100) / 100,
    totalContributed:
      Math.round(monthlyContribution * yearsOfAccumulation * 12 * 100) / 100,
    portfolioAtRetirement: Math.round(portfolioAtRetirement * 100) / 100,
    monthlyIncomeFromPortfolio: Math.round(monthlyIncome * 100) / 100,
    yearsOfAccumulation,
    weightedRealReturn,
    profileId,
  };
}

/**
 * Generate portfolio timeline from current age to retirement + drawdown.
 * During accumulation: portfolio grows via contributions + returns.
 * During drawdown: portfolio is consumed via monthly withdrawals.
 */
export function generatePortfolioTimeline(params: {
  readonly monthlyContribution: number;
  readonly weightedRealReturn: number;
  readonly currentAge: number;
  readonly retirementAge: number;
  readonly drawdownYears: number;
  readonly ipcRate: number;
  readonly currentYear: number;
}): readonly PortfolioYearlyProjection[] {
  const {
    monthlyContribution,
    weightedRealReturn,
    currentAge,
    retirementAge,
    drawdownYears,
    ipcRate,
    currentYear,
  } = params;

  const maxAge = retirementAge + drawdownYears;
  const drawdownReturn = Math.max(0, weightedRealReturn * 0.5);
  const projections: PortfolioYearlyProjection[] = [];

  // Portfolio at retirement (in real terms)
  const portfolioAtRetirement = futureValueMonthly(
    monthlyContribution,
    weightedRealReturn,
    Math.max(0, retirementAge - currentAge),
  );

  const monthlyDrawdown = monthlyIncomeFromPortfolio(
    portfolioAtRetirement,
    drawdownYears,
    drawdownReturn,
  );

  for (let age = currentAge; age <= maxAge; age++) {
    const year = currentYear + (age - currentAge);
    const yearsFromNow = age - currentAge;

    let portfolioReal: number;
    let monthlyIncomeReal: number;

    if (age < retirementAge) {
      // Accumulation phase
      portfolioReal = futureValueMonthly(
        monthlyContribution,
        weightedRealReturn,
        age - currentAge,
      );
      monthlyIncomeReal = 0;
    } else {
      // Drawdown phase
      const yearsIntoDrawdown = age - retirementAge;
      if (yearsIntoDrawdown >= drawdownYears) {
        portfolioReal = 0;
        monthlyIncomeReal = 0;
      } else {
        // Remaining portfolio = PV of remaining annuity payments
        const remainingYears = drawdownYears - yearsIntoDrawdown;
        if (drawdownReturn === 0) {
          portfolioReal = monthlyDrawdown * remainingYears * 12;
        } else {
          const monthlyRate = Math.pow(1 + drawdownReturn, 1 / 12) - 1;
          const remainingMonths = Math.round(remainingYears * 12);
          portfolioReal =
            (monthlyDrawdown *
              (1 - Math.pow(1 + monthlyRate, -remainingMonths))) /
            monthlyRate;
        }
        monthlyIncomeReal = monthlyDrawdown;
      }
    }

    projections.push({
      age,
      year,
      portfolioValueReal: Math.round(portfolioReal * 100) / 100,
      portfolioValueNominal:
        Math.round(realToNominal(portfolioReal, yearsFromNow, ipcRate) * 100) /
        100,
      monthlyIncomeReal: Math.round(monthlyIncomeReal * 100) / 100,
      monthlyIncomeNominal:
        Math.round(
          realToNominal(monthlyIncomeReal, yearsFromNow, ipcRate) * 100,
        ) / 100,
    });
  }

  return projections;
}
