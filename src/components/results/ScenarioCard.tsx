import type { ScenarioResult, ScenarioId } from '../../engine/types.ts';
import { CurrencyDisplay } from '../shared/CurrencyDisplay.tsx';
import { SCENARIO_LABELS, SCENARIO_COLORS } from '../../hooks/use-chart-data.ts';
import { formatPercent } from '../../utils/format.ts';

interface ScenarioCardProps {
  readonly result: ScenarioResult;
  readonly baselinePension: number;
  readonly showDetail: boolean;
}

export function ScenarioCard({ result, baselinePension, showDetail }: ScenarioCardProps) {
  const diff = baselinePension > 0
    ? (result.monthlyPension - baselinePension) / baselinePension
    : 0;
  const isBaseline = result.scenarioId === 'current-law';
  const isLower = diff < -0.005;
  const isHigher = diff > 0.005;

  return (
    <div
      className="rounded-lg border p-4 transition-shadow hover:shadow-md"
      style={{ borderLeftColor: SCENARIO_COLORS[result.scenarioId as ScenarioId], borderLeftWidth: '4px' }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800">
          {SCENARIO_LABELS[result.scenarioId as ScenarioId]}
        </h3>
        {!isBaseline && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              isLower ? 'bg-red-100 text-red-700' : isHigher ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {diff > 0 ? '+' : ''}{formatPercent(diff)}
          </span>
        )}
        {isBaseline && (
          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            Referencia
          </span>
        )}
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-600">Tu pension sera de</p>
        <CurrencyDisplay amount={result.monthlyPension} className="text-xl text-gray-900" />
      </div>

      {showDetail && (
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Base reguladora</span>
            <span className="font-medium tabular-nums">{result.baseReguladora.toFixed(2)} EUR</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tasa de reemplazo (bruto)</span>
            <span className="font-medium tabular-nums">{formatPercent(result.replacementRate)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
