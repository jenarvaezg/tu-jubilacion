import { useMemo } from "react";
import type { ScenarioResult, ScenarioId } from "../engine/types.ts";

export interface ChartDataPoint {
  readonly age: number;
  readonly year: number;
  readonly [key: string]: number | undefined;
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
  "notional-accounts": "Cuentas nocionales",
  "sustainability-2013": "Factor sostenibilidad 2013",
  "eu-convergence": "Convergencia UE (60%)",
  "greece-haircut": "Recorte tipo Grecia",
};

const MAX_CHART_AGE = 90;
const SCENARIO_IDS: readonly ScenarioId[] = [
  "current-law",
  "notional-accounts",
  "sustainability-2013",
  "eu-convergence",
  "greece-haircut",
];

export function realKey(scenarioId: ScenarioId): string {
  return `${scenarioId}__real`;
}

export function nominalKey(scenarioId: ScenarioId): string {
  return `${scenarioId}__nominal`;
}

interface UseChartDataParams {
  readonly results: readonly ScenarioResult[];
  readonly displayMode: "real" | "nominal";
  readonly currentAge: number;
}

export function buildChartData({
  results,
  displayMode,
  currentAge,
}: UseChartDataParams): readonly ChartDataPoint[] {
  if (results.length === 0) return [];

  const chartStartAge = Math.max(18, Math.min(currentAge, MAX_CHART_AGE));
  const ages = Array.from(
    { length: MAX_CHART_AGE - chartStartAge + 1 },
    (_, i) => chartStartAge + i,
  );

  const lookups = new Map<ScenarioId, Map<number, { real: number; nominal: number; year: number }>>();
  for (const result of results) {
    const map = new Map<number, { real: number; nominal: number; year: number }>();
    for (const entry of result.timeline) {
      map.set(entry.age, {
        real: entry.monthlyPensionReal,
        nominal: entry.monthlyPensionNominal,
        year: entry.year,
      });
    }
    lookups.set(result.scenarioId, map);
  }

  return ages.map((age) => {
    const point: Record<string, number | undefined> = { age, year: 0 };
    for (const scenarioId of SCENARIO_IDS) {
      const entry = lookups.get(scenarioId)?.get(age);
      if (entry !== undefined) {
        point[scenarioId] = displayMode === "real" ? entry.real : entry.nominal;
        point[realKey(scenarioId)] = entry.real;
        point[nominalKey(scenarioId)] = entry.nominal;
        point.year = entry.year;
      }
    }
    return point as ChartDataPoint;
  });
}

export function useChartData(params: UseChartDataParams): readonly ChartDataPoint[] {
  const { results, displayMode, currentAge } = params;
  return useMemo(
    () => buildChartData({ results, displayMode, currentAge }),
    [results, displayMode, currentAge],
  );
}
