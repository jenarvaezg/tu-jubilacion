import type { HistoricalSeriesId } from "../../engine/backtest/types";
import { HISTORICAL_SERIES } from "../../data/historical-returns";

const SERIES_ORDER: readonly HistoricalSeriesId[] = [
  "sp500",
  "msci-world",
  "tbond",
  "tbill",
];

const SERIES_COLORS: Record<HistoricalSeriesId, string> = {
  sp500: "border-green-500 bg-green-50",
  "msci-world": "border-indigo-500 bg-indigo-50",
  tbond: "border-blue-500 bg-blue-50",
  tbill: "border-gray-500 bg-gray-50",
};

const SERIES_ACTIVE_COLORS: Record<HistoricalSeriesId, string> = {
  sp500: "border-green-600 bg-green-100 ring-2 ring-green-300",
  "msci-world": "border-indigo-600 bg-indigo-100 ring-2 ring-indigo-300",
  tbond: "border-blue-600 bg-blue-100 ring-2 ring-blue-300",
  tbill: "border-gray-600 bg-gray-100 ring-2 ring-gray-300",
};

const SERIES_DESCRIPTIONS: Record<HistoricalSeriesId, string> = {
  sp500: "Renta variable EEUU, 1928-2024",
  "msci-world": "Renta variable global, 1970-2024",
  tbond: "Bonos 10 años EEUU, 1928-2024",
  tbill: "Letras 3 meses EEUU, 1928-2024",
};

interface AssetClassSelectorProps {
  readonly selectedSeriesId: HistoricalSeriesId;
  readonly onSelect: (id: HistoricalSeriesId) => void;
}

export function AssetClassSelector({
  selectedSeriesId,
  onSelect,
}: AssetClassSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
        Clase de activo historica
      </h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SERIES_ORDER.map((id) => {
          const series = HISTORICAL_SERIES[id];
          const isActive = id === selectedSeriesId;
          const colorClass = isActive
            ? SERIES_ACTIVE_COLORS[id]
            : SERIES_COLORS[id];

          return (
            <button
              key={id}
              type="button"
              className={`rounded-lg border-2 p-3 text-left transition-all hover:shadow-md ${colorClass}`}
              onClick={() => onSelect(id)}
            >
              <p className="text-sm font-bold text-gray-900">{series.label}</p>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                {SERIES_DESCRIPTIONS[id]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
