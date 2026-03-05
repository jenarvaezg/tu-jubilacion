import type { ScenarioId } from "../../engine/types.ts";
import {
  SCENARIO_LABELS,
  SCENARIO_COLORS,
  nominalKey,
  realKey,
  type ChartDataPoint,
} from "../../hooks/use-chart-data.ts";
import { formatCurrency } from "../../utils/format.ts";

const SCENARIO_ORDER: readonly ScenarioId[] = [
  "current-law",
  "notional-accounts",
  "sustainability-2013",
  "eu-convergence",
  "greece-haircut",
];

interface TooltipPayloadItem {
  readonly dataKey: string;
  readonly value: number;
  readonly color: string;
  readonly payload: ChartDataPoint;
}

interface ChartTooltipProps {
  readonly active?: boolean;
  readonly payload?: readonly TooltipPayloadItem[];
  readonly label?: number;
  readonly displayMode: "real" | "nominal";
}

export function ChartTooltip({
  active,
  payload,
  label,
  displayMode,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const modeLabel =
    displayMode === "real" ? "euros reales (hoy)" : "euros nominales";
  const counterpartLabel =
    displayMode === "real" ? "equivalente nominal" : "equivalente real (hoy)";
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-gray-800">Edad {label}</p>
      <p className="mb-2 text-xs text-gray-500">En {modeLabel}</p>
      <div className="flex flex-col gap-1">
        {SCENARIO_ORDER.map((scenarioId) => {
          const item = payload.find((p) => p.dataKey === scenarioId);
          if (!item) return null;

          return (
            <div key={scenarioId} className="mb-1">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: SCENARIO_COLORS[scenarioId] }}
                  />
                  <span className="text-xs text-gray-600">
                    {SCENARIO_LABELS[scenarioId]}
                  </span>
                </div>
                <span className="text-xs font-semibold tabular-nums text-gray-800">
                  {formatCurrency(item.value)}
                </span>
              </div>
              {point !== undefined && (
                <div className="flex justify-end">
                  <span className="text-[11px] text-gray-500 tabular-nums">
                    {counterpartLabel}:{" "}
                    {formatCurrency(
                      displayMode === "real"
                        ? (point[nominalKey(scenarioId)] ?? item.value)
                        : (point[realKey(scenarioId)] ?? item.value),
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
        {(() => {
          const combined = payload.find(
            (p) => p.dataKey === "pension-plus-savings",
          );
          if (!combined) return null;
          return (
            <>
              <div className="my-1.5 border-t border-gray-200" />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: "#059669" }}
                  />
                  <span className="text-xs font-semibold text-emerald-700">
                    Ingreso total
                  </span>
                </div>
                <span className="text-xs font-semibold tabular-nums text-gray-800">
                  {formatCurrency(combined.value)}
                </span>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
