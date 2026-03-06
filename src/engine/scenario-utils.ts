import type { ScenarioResult, YearlyProjection } from "./types";

export function getRetirementMonthlyPensionReal(result: ScenarioResult): number {
  return result.timeline[0]?.monthlyPensionReal ?? result.monthlyPension;
}

export function blendTimelines(
  currentLaw: readonly YearlyProjection[],
  notional: readonly YearlyProjection[],
  notionalWeight: number,
): readonly YearlyProjection[] {
  return currentLaw.map((currentPoint, index) => {
    const notionalPoint = notional[index];
    if (!notionalPoint || notionalPoint.age !== currentPoint.age) {
      return currentPoint;
    }

    return {
      age: currentPoint.age,
      year: currentPoint.year,
      monthlyPensionReal:
        currentPoint.monthlyPensionReal * (1 - notionalWeight) +
        notionalPoint.monthlyPensionReal * notionalWeight,
      monthlyPensionNominal:
        currentPoint.monthlyPensionNominal * (1 - notionalWeight) +
        notionalPoint.monthlyPensionNominal * notionalWeight,
    };
  });
}
