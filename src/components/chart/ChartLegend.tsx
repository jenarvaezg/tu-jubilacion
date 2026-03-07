import type { ScenarioId } from "../../engine/types.ts";
import {
  SCENARIO_LABELS,
  SCENARIO_COLORS,
  SCENARIO_DASH_PATTERNS,
} from "../../hooks/use-chart-data.ts";

const SCENARIO_ORDER: readonly ScenarioId[] = [
  "current-law",
  "fedea-transition",
  "notional-accounts",
  "sustainability-2013",
  "eu-convergence",
  "greece-haircut",
];

export function ChartLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {SCENARIO_ORDER.map((id) => (
        <div key={id} className="flex items-center gap-1.5">
          <svg width="24" height="12" className="shrink-0">
            <line
              x1="0"
              y1="6"
              x2="24"
              y2="6"
              stroke={SCENARIO_COLORS[id]}
              strokeWidth="2.5"
              strokeDasharray={SCENARIO_DASH_PATTERNS[id] || ""}
            />
          </svg>
          <span className="text-xs text-gray-600">{SCENARIO_LABELS[id]}</span>
        </div>
      ))}
    </div>
  );
}
