import { useState } from "react";
import type { HistoricalSeriesId } from "../../engine/backtest/types";
import { useBacktestCalculation } from "../../hooks/use-backtest-calculation";
import { AssetClassSelector } from "./AssetClassSelector";
import { SpaghettiChart } from "./SpaghettiChart";
import { BacktestSummaryCard } from "./BacktestSummaryCard";

const SERIES_ATTRIBUTION: Record<HistoricalSeriesId, string> = {
  sp500:
    "Fuente: Aswath Damodaran (NYU Stern), datos 1928-2024, retornos reales ajustados por inflacion USA (CPI)",
  "msci-world":
    "Fuente: MSCI World Gross Total Return Index (USD), 1970-2024, deflactado por CPI USA. Datos via Damodaran (NYU Stern)",
  tbond:
    "Fuente: Aswath Damodaran (NYU Stern), datos 1928-2024, retornos reales ajustados por inflacion USA (CPI)",
  tbill:
    "Fuente: Aswath Damodaran (NYU Stern), datos 1928-2024, retornos reales ajustados por inflacion USA (CPI)",
};

interface BacktestSectionProps {
  readonly currentSavingsBalance: number;
  readonly monthlyContribution: number;
  readonly yearsOfAccumulation: number;
  readonly drawdownYears: number;
}

export function BacktestSection({
  currentSavingsBalance,
  monthlyContribution,
  yearsOfAccumulation,
  drawdownYears,
}: BacktestSectionProps) {
  const [seriesId, setSeriesId] = useState<HistoricalSeriesId>("sp500");
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const { summary, error } = useBacktestCalculation({
    initialBalance: currentSavingsBalance,
    monthlyContribution,
    yearsOfAccumulation,
    drawdownYears,
    seriesId,
  });

  if (error !== null) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (summary === null) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">
          Como Habria Ido Historicamente
        </h2>
        <span className="text-xs font-bold text-gray-400 uppercase">
          Fase 3: Backtest
        </span>
      </div>

      <AssetClassSelector selectedSeriesId={seriesId} onSelect={setSeriesId} />

      <SpaghettiChart summary={summary} />

      <BacktestSummaryCard summary={summary} />

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <div className="flex flex-col gap-2 text-xs text-amber-800 leading-relaxed">
          <p className="font-semibold text-amber-900">
            Rendimientos pasados no garantizan resultados futuros
          </p>
          <p>
            Series históricas en USD. La simulación capitaliza con
            rentabilidades anuales y no refleja volatilidad intra-anual.
          </p>
          {currentSavingsBalance > 0 && (
            <p>
              Incluye tu ahorro actual como capital inicial desde el que arranca
              cada cohorte.
            </p>
          )}
        </div>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-between border-t border-amber-200 pt-3 text-left"
          aria-expanded={disclaimerOpen}
          onClick={() => setDisclaimerOpen(!disclaimerOpen)}
        >
          <p className="text-xs font-semibold text-amber-800">
            Ver fuentes y límites
          </p>
          <span className="ml-2 text-xs text-amber-600">
            {disclaimerOpen ? "▲" : "▼"}
          </span>
        </button>
        {disclaimerOpen && (
          <div className="mt-3 flex flex-col gap-2 text-xs text-amber-800 leading-relaxed">
            <p>{SERIES_ATTRIBUTION[seriesId]}</p>
            <p>
              No mostramos Letras del Tesoro de Espana en este backtest hasta
              incorporar una serie historica homogenea y comparable.
            </p>
            <p>
              No incluye comisiones, impuestos ni conversion de divisa EUR/USD.
            </p>
            <p className="text-xs italic text-amber-700">
              Se muestra el patrimonio en euros reales para compararlo con el
              resto de la app, pero la serie subyacente es siempre USD real.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
