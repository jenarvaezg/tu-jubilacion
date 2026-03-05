import { useMemo } from "react";
import type { ScenarioResult, ScenarioId } from "../engine/types.ts";
import type { PortfolioYearlyProjection } from "../engine/savings/types.ts";

export interface CombinedChartDataPoint {
  readonly age: number;
  readonly year: number;
  readonly [key: string]: number | undefined;
}

const MAX_CHART_AGE = 90;

const SCENARIO_IDS: readonly ScenarioId[] = [
  "current-law",
  "notional-accounts",
  "sustainability-2013",
  "eu-convergence",
  "greece-haircut",
];

interface UseCombinedChartDataParams {
  readonly results: readonly ScenarioResult[];
  readonly portfolioTimeline: readonly PortfolioYearlyProjection[];
  readonly comparisonScenarioId: ScenarioId;
  readonly displayMode: "real" | "nominal";
  readonly currentAge: number;
}

export function buildCombinedChartData(
  params: UseCombinedChartDataParams,
): readonly CombinedChartDataPoint[] {
  const {
    results,
    portfolioTimeline,
    comparisonScenarioId,
    displayMode,
    currentAge,
  } = params;

  if (results.length === 0) return [];

  const chartStartAge = Math.max(18, Math.min(currentAge, MAX_CHART_AGE));
  const ages = Array.from(
    { length: MAX_CHART_AGE - chartStartAge + 1 },
    (_, i) => chartStartAge + i,
  );

  // Build pension lookup
  const pensionLookups = new Map<
    ScenarioId,
    Map<number, { real: number; nominal: number; year: number }>
  >();
  for (const result of results) {
    const map = new Map<
      number,
      { real: number; nominal: number; year: number }
    >();
    for (const entry of result.timeline) {
      map.set(entry.age, {
        real: entry.monthlyPensionReal,
        nominal: entry.monthlyPensionNominal,
        year: entry.year,
      });
    }
    pensionLookups.set(result.scenarioId, map);
  }

  // Build portfolio lookup
  const portfolioLookup = new Map<
    number,
    { incomeReal: number; incomeNominal: number }
  >();
  for (const entry of portfolioTimeline) {
    portfolioLookup.set(entry.age, {
      incomeReal: entry.monthlyIncomeReal,
      incomeNominal: entry.monthlyIncomeNominal,
    });
  }

  return ages.map((age) => {
    const point: Record<string, number | undefined> = { age, year: 0 };

    for (const scenarioId of SCENARIO_IDS) {
      const entry = pensionLookups.get(scenarioId)?.get(age);
      if (entry !== undefined) {
        point[scenarioId] =
          displayMode === "real" ? entry.real : entry.nominal;
        point.year = entry.year;
      }
    }

    // Add "pension + portfolio" total line for the comparison scenario
    const compPension = pensionLookups
      .get(comparisonScenarioId)
      ?.get(age);
    const portfolio = portfolioLookup.get(age);

    if (compPension !== undefined) {
      const pensionValue =
        displayMode === "real" ? compPension.real : compPension.nominal;
      const portfolioIncome = portfolio
        ? displayMode === "real"
          ? portfolio.incomeReal
          : portfolio.incomeNominal
        : 0;
      point["pension-plus-savings"] = pensionValue + portfolioIncome;
    }

    return point as CombinedChartDataPoint;
  });
}

export function useCombinedChartData(
  params: UseCombinedChartDataParams,
): readonly CombinedChartDataPoint[] {
  const {
    results,
    portfolioTimeline,
    comparisonScenarioId,
    displayMode,
    currentAge,
  } = params;
  return useMemo(
    () =>
      buildCombinedChartData({
        results,
        portfolioTimeline,
        comparisonScenarioId,
        displayMode,
        currentAge,
      }),
    [results, portfolioTimeline, comparisonScenarioId, displayMode, currentAge],
  );
}
