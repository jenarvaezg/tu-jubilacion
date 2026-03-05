import { useMemo } from "react";
import type { ComparisonYearlyPoint } from "../engine/savings/types.ts";

export interface ComparisonChartDataPoint {
  readonly age: number;
  readonly year: number;
  readonly equity: number;
  readonly bonds: number;
  readonly deposits: number;
}

interface UseComparisonChartDataParams {
  readonly comparisonTimeline: readonly ComparisonYearlyPoint[];
  readonly displayMode: "real" | "nominal";
}

export function buildComparisonChartData(
  params: UseComparisonChartDataParams,
): readonly ComparisonChartDataPoint[] {
  const { comparisonTimeline, displayMode } = params;

  return comparisonTimeline.map((point) => ({
    age: point.age,
    year: point.year,
    equity:
      displayMode === "real"
        ? point.equityPortfolioReal
        : point.equityPortfolioNominal,
    bonds:
      displayMode === "real"
        ? point.bondsPortfolioReal
        : point.bondsPortfolioNominal,
    deposits:
      displayMode === "real"
        ? point.depositsPortfolioReal
        : point.depositsPortfolioNominal,
  }));
}

export function useComparisonChartData(
  params: UseComparisonChartDataParams,
): readonly ComparisonChartDataPoint[] {
  const { comparisonTimeline, displayMode } = params;
  return useMemo(
    () => buildComparisonChartData({ comparisonTimeline, displayMode }),
    [comparisonTimeline, displayMode],
  );
}
