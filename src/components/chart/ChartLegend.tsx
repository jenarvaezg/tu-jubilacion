import type { ScenarioId } from '../../engine/types.ts';
import { SCENARIO_LABELS, SCENARIO_COLORS } from '../../hooks/use-chart-data.ts';

const SCENARIO_ORDER: readonly ScenarioId[] = [
  'current-law',
  'fedea-transition',
  'notional-accounts',
  'sustainability-2013',
  'eu-convergence',
  'greece-haircut',
];

export function ChartLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {SCENARIO_ORDER.map((id) => (
        <div key={id} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: SCENARIO_COLORS[id] }}
          />
          <span className="text-xs text-gray-600">{SCENARIO_LABELS[id]}</span>
        </div>
      ))}
    </div>
  );
}
