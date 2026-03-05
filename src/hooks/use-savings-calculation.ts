import { useMemo } from "react";
import type { ScenarioResult } from "../engine/types.ts";
import type { CalculationInputs } from "../state/types.ts";
import type {
  PensionGap,
  SavingsResult,
  PortfolioYearlyProjection,
  ComparisonYearlyPoint,
} from "../engine/savings/types.ts";
import { calculatePensionGap } from "../engine/savings/gap.ts";
import {
  calculateSavings,
  deriveDrawdownYears,
  generatePortfolioTimeline,
} from "../engine/savings/portfolio.ts";
import { generateComparisonTimeline } from "../engine/savings/comparison.ts";
import {
  ASSET_CLASS_RETURNS,
  INVESTMENT_PROFILES,
  getGlidePathAllocation,
  getWeightedReturn,
} from "../data/investment-profiles.ts";

export interface SavingsCalculationResult {
  readonly gap: PensionGap | null;
  readonly savings: SavingsResult | null;
  readonly portfolioTimeline: readonly PortfolioYearlyProjection[];
  readonly comparisonTimeline: readonly ComparisonYearlyPoint[];
  readonly drawdownYears: number;
  readonly derivedDrawdownYears: number;
  readonly error: string | null;
}

export function useSavingsCalculation(params: {
  readonly pensionResults: readonly ScenarioResult[];
  readonly inputs: CalculationInputs;
}): SavingsCalculationResult {
  const { pensionResults, inputs } = params;

  return useMemo(() => {
    try {
      if (pensionResults.length === 0) {
        return {
          gap: null,
          savings: null,
          portfolioTimeline: [],
          comparisonTimeline: [],
          drawdownYears: 0,
          derivedDrawdownYears: 0,
          error: null,
        };
      }

      const gap = calculatePensionGap(
        pensionResults,
        inputs.comparisonScenarioId,
      );

      const currentYear = new Date().getFullYear();
      const { profile, ipcRate, investmentProfileId } = inputs;

      const derivedDrawdownYears = deriveDrawdownYears(
        profile.desiredRetirementAge,
        profile.age,
        currentYear,
      );

      if (gap === null) {
        return {
          gap: null,
          savings: null,
          portfolioTimeline: [],
          comparisonTimeline: [],
          drawdownYears: 0,
          derivedDrawdownYears,
          error: null,
        };
      }

      const drawdownYears = inputs.drawdownYears ?? derivedDrawdownYears;

      const investmentProfile = INVESTMENT_PROFILES[investmentProfileId];
      const allocation = investmentProfile.isGlidePath
        ? getGlidePathAllocation(profile.desiredRetirementAge - profile.age)
        : investmentProfile.allocation;
      const weightedReturn = getWeightedReturn(allocation);

      const savings = calculateSavings({
        gapMonthly: gap.gapMonthly,
        weightedRealReturn: weightedReturn,
        currentAge: profile.age,
        retirementAge: profile.desiredRetirementAge,
        drawdownYears,
        profileId: investmentProfileId,
        monthlyContributionOverride: inputs.monthlyContributionOverride,
      });

      const portfolioTimeline = generatePortfolioTimeline({
        monthlyContribution: savings.monthlyContribution,
        weightedRealReturn: weightedReturn,
        currentAge: profile.age,
        retirementAge: profile.desiredRetirementAge,
        drawdownYears,
        ipcRate,
        currentYear,
      });

      const comparisonTimeline = generateComparisonTimeline({
        monthlyContribution: savings.monthlyContribution,
        currentAge: profile.age,
        retirementAge: profile.desiredRetirementAge,
        assetReturns: ASSET_CLASS_RETURNS,
        ipcRate,
        currentYear,
      });

      return {
        gap,
        savings,
        portfolioTimeline,
        comparisonTimeline,
        drawdownYears,
        derivedDrawdownYears,
        error: null,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error en el calculo de ahorro";
      return {
        gap: null,
        savings: null,
        portfolioTimeline: [],
        comparisonTimeline: [],
        drawdownYears: 0,
        derivedDrawdownYears: 0,
        error: message,
      };
    }
  }, [pensionResults, inputs]);
}
