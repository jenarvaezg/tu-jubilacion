import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { ScenarioId } from "../../engine/types.ts";
import type { CombinedChartDataPoint } from "../../hooks/use-combined-chart-data.ts";
import { SCENARIO_COLORS } from "../../hooks/use-chart-data.ts";
import { ChartTooltip } from "../chart/ChartTooltip.tsx";

const SCENARIO_ORDER: readonly ScenarioId[] = [
  "current-law",
  "notional-accounts",
  "sustainability-2013",
  "eu-convergence",
  "greece-haircut",
];

const REFERENCE_LABEL_FONT_SIZE = 10;

interface CombinedHeroChartProps {
  readonly data: readonly CombinedChartDataPoint[];
  readonly retirementAge: number;
  readonly displayMode: "real" | "nominal";
}

export function CombinedHeroChart({
  data,
  retirementAge,
  displayMode,
}: CombinedHeroChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Pension + ahorro = ingreso total
        </h3>
        <span className="text-[10px] text-gray-400 uppercase">
          Proyeccion combinada
        </span>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart
            data={data as CombinedChartDataPoint[]}
            margin={{ top: 56, right: 18, left: 20, bottom: 26 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="age"
              label={{
                value: "Edad",
                position: "insideBottom",
                offset: -8,
                fontSize: 12,
              }}
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              tickFormatter={(v: number) => `${Math.round(v)}`}
              label={{
                value: "EUR/mes",
                angle: -90,
                position: "insideLeft",
                offset: -2,
                fontSize: 12,
              }}
            />
            <Tooltip content={<ChartTooltip displayMode={displayMode} />} />
            <ReferenceLine
              x={retirementAge}
              stroke="#1e40af"
              strokeDasharray="4 4"
              label={{
                value: `${retirementAge} (jubilacion)`,
                position: "insideTop",
                dy: 2,
                fontSize: REFERENCE_LABEL_FONT_SIZE,
                fill: "#1e40af",
              }}
            />
            {SCENARIO_ORDER.map((scenarioId) => (
              <Line
                key={scenarioId}
                type="monotone"
                dataKey={scenarioId}
                stroke={SCENARIO_COLORS[scenarioId]}
                strokeWidth={scenarioId === "current-law" ? 2.5 : 1.5}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls={false}
              />
            ))}
            <Line
              type="monotone"
              dataKey="pension-plus-savings"
              stroke="#059669"
              strokeWidth={3}
              strokeDasharray="8 4"
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls={false}
              name="Pension + ahorro"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {SCENARIO_ORDER.map((id) => (
          <div key={id} className="flex items-center gap-1.5">
            <span
              className="h-2 w-4 rounded-sm"
              style={{ backgroundColor: SCENARIO_COLORS[id] }}
            />
            <span>
              {id === "current-law"
                ? "Ley actual"
                : id === "notional-accounts"
                  ? "FEDEA"
                  : id === "sustainability-2013"
                    ? "Sost. 2013"
                    : id === "eu-convergence"
                      ? "Conv. UE"
                      : "Grecia"}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-emerald-600" />
          <span className="font-semibold text-emerald-700">
            Pension + ahorro
          </span>
        </div>
      </div>
    </div>
  );
}
