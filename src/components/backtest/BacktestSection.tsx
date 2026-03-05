import { useState } from "react";
import type { HistoricalSeriesId } from "../../engine/backtest/types";
import { useBacktestCalculation } from "../../hooks/use-backtest-calculation";
import { AssetClassSelector } from "./AssetClassSelector";
import { SpaghettiChart } from "./SpaghettiChart";
import { BacktestSummaryCard } from "./BacktestSummaryCard";

interface BacktestSectionProps {
  readonly monthlyContribution: number;
  readonly yearsOfAccumulation: number;
  readonly drawdownYears: number;
}

export function BacktestSection({
  monthlyContribution,
  yearsOfAccumulation,
  drawdownYears,
}: BacktestSectionProps) {
  const [seriesId, setSeriesId] = useState<HistoricalSeriesId>("sp500");

  const { summary } = useBacktestCalculation({
    monthlyContribution,
    yearsOfAccumulation,
    drawdownYears,
    seriesId,
  });

  if (summary === null) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">
          Como Habria Ido Historicamente
        </h2>
        <span className="text-[10px] font-bold text-gray-400 uppercase">
          Fase 3: Backtest
        </span>
      </div>

      <AssetClassSelector
        selectedSeriesId={seriesId}
        onSelect={setSeriesId}
      />

      <SpaghettiChart summary={summary} />

      <BacktestSummaryCard summary={summary} />

      <p className="text-xs text-gray-500 leading-relaxed">
        Datos historicos reales (ajustados por inflacion) en USD de Damodaran
        (NYU Stern). Rendimientos pasados no garantizan resultados futuros. Los
        retornos no incluyen comisiones ni impuestos.
      </p>
    </div>
  );
}
