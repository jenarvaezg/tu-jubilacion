import { useMemo } from "react";
import type { ScenarioResult, ScenarioId } from "../engine/types.ts";

export interface ChartDataPoint {
  readonly age: number;
  readonly year: number;
  readonly "current-law"?: number;
  readonly "notional-accounts"?: number;
  readonly "sustainability-2013"?: number;
  readonly "eu-convergence"?: number;
  readonly "greece-haircut"?: number;
}

export const SCENARIO_COLORS: Record<ScenarioId, string> = {
  "current-law": "var(--color-scenario-current)",
  "notional-accounts": "var(--color-scenario-notional)",
  "sustainability-2013": "var(--color-scenario-sustainability)",
  "eu-convergence": "var(--color-scenario-eu)",
  "greece-haircut": "var(--color-scenario-greece)",
};

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  "current-law": "Legislacion vigente",
  "notional-accounts": "Cuentas nocionales (FEDEA)",
  "sustainability-2013": "Factor sostenibilidad 2013",
  "eu-convergence": "Convergencia UE (60%)",
  "greece-haircut": "Recorte tipo Grecia",
};

interface UseChartDataParams {
  readonly results: readonly ScenarioResult[];
  readonly displayMode: "real" | "nominal";
}

export function useChartData({
  results,
  displayMode,
}: UseChartDataParams): readonly ChartDataPoint[] {
  return useMemo(() => {
    if (results.length === 0) return [];

    // Collect all unique ages across all timelines
    const ageSet = new Set<number>();
    for (const result of results) {
      for (const point of result.timeline) {
        ageSet.add(point.age);
      }
    }

    const ages = Array.from(ageSet).sort((a, b) => a - b);

    // Build lookup maps for each scenario
    const lookups = new Map<
      ScenarioId,
      Map<number, { real: number; nominal: number }>
    >();
    for (const result of results) {
      const map = new Map<number, { real: number; nominal: number }>();
      for (const point of result.timeline) {
        map.set(point.age, {
          real: point.monthlyPensionReal,
          nominal: point.monthlyPensionNominal,
        });
      }
      lookups.set(result.scenarioId, map);
    }

    return ages.map((age) => {
      const point: Record<string, number | undefined> = { age, year: 0 };

      for (const result of results) {
        const lookup = lookups.get(result.scenarioId);
        const entry = lookup?.get(age);
        if (entry !== undefined) {
          point[result.scenarioId] =
            displayMode === "real" ? entry.real : entry.nominal;
          if (point.year === 0) {
            const timelineEntry = result.timeline.find((t) => t.age === age);
            if (timelineEntry) {
              point.year = timelineEntry.year;
            }
          }
        }
      }

      return point as unknown as ChartDataPoint;
    });
  }, [results, displayMode]);
}
