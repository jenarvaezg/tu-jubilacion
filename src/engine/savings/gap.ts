// Calculate pension gap between current-law baseline and a comparison scenario.
import type { ScenarioResult, ScenarioId } from "../types";
import type { PensionGap } from "./types";

export function calculatePensionGap(
  results: readonly ScenarioResult[],
  comparisonScenarioId: ScenarioId,
): PensionGap | null {
  const baseline = results.find((r) => r.scenarioId === "current-law");
  const comparison = results.find(
    (r) => r.scenarioId === comparisonScenarioId,
  );

  if (baseline === undefined || comparison === undefined) return null;

  const gapMonthly = baseline.monthlyPension - comparison.monthlyPension;

  return {
    baselineMonthly: baseline.monthlyPension,
    comparisonMonthly: comparison.monthlyPension,
    gapMonthly,
    gapAnnual: gapMonthly * 14,
    gapPercent:
      baseline.monthlyPension > 0
        ? gapMonthly / baseline.monthlyPension
        : 0,
    comparisonScenarioId,
  };
}
