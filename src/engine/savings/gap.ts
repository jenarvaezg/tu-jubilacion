// Calculate the private retirement-income complement needed to preserve
// today's lifestyle under different public-pension scenarios.
import type { ScenarioResult, ScenarioId } from "../types";
import type { RetirementIncomeGap } from "./types";

export function calculateRetirementIncomeGap(
  results: readonly ScenarioResult[],
  comparisonScenarioId: ScenarioId,
  targetMonthlyIncome: number,
): RetirementIncomeGap | null {
  const currentLaw = results.find((r) => r.scenarioId === "current-law");
  const comparison = results.find(
    (r) => r.scenarioId === comparisonScenarioId,
  );

  if (currentLaw === undefined || comparison === undefined) return null;

  const currentLawGapMonthly = Math.max(
    0,
    targetMonthlyIncome - currentLaw.monthlyPension,
  );
  const comparisonGapMonthly = Math.max(
    0,
    targetMonthlyIncome - comparison.monthlyPension,
  );

  return {
    targetMonthlyIncome,
    currentLawMonthly: currentLaw.monthlyPension,
    comparisonMonthly: comparison.monthlyPension,
    currentLawGapMonthly,
    comparisonGapMonthly,
    additionalGapMonthly: Math.max(
      0,
      comparisonGapMonthly - currentLawGapMonthly,
    ),
    currentLawCoverageRate:
      targetMonthlyIncome > 0
        ? Math.min(1, currentLaw.monthlyPension / targetMonthlyIncome)
        : 1,
    comparisonCoverageRate:
      targetMonthlyIncome > 0
        ? Math.min(1, comparison.monthlyPension / targetMonthlyIncome)
        : 1,
    comparisonScenarioId,
  };
}
