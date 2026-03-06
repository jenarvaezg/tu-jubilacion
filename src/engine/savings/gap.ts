// Calculate the private retirement-income complement needed to preserve
// today's lifestyle under different public-pension scenarios.
import type { ScenarioResult, ScenarioId } from "../types";
import type { RetirementIncomeGap } from "./types";
import { getRetirementMonthlyPensionReal } from "../scenario-utils";

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

  const currentLawPlanningIncome = getRetirementMonthlyPensionReal(currentLaw);
  const comparisonPlanningIncome = getRetirementMonthlyPensionReal(comparison);

  const currentLawGapMonthly = Math.max(
    0,
    targetMonthlyIncome - currentLawPlanningIncome,
  );
  const comparisonGapMonthly = Math.max(
    0,
    targetMonthlyIncome - comparisonPlanningIncome,
  );

  return {
    targetMonthlyIncome,
    currentLawMonthly: currentLawPlanningIncome,
    comparisonMonthly: comparisonPlanningIncome,
    currentLawGapMonthly,
    comparisonGapMonthly,
    additionalGapMonthly: Math.max(
      0,
      comparisonGapMonthly - currentLawGapMonthly,
    ),
    currentLawCoverageRate:
      targetMonthlyIncome > 0
        ? Math.min(1, currentLawPlanningIncome / targetMonthlyIncome)
        : 1,
    comparisonCoverageRate:
      targetMonthlyIncome > 0
        ? Math.min(1, comparisonPlanningIncome / targetMonthlyIncome)
        : 1,
    comparisonScenarioId,
  };
}
