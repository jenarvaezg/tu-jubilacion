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
import {
  SCENARIO_COLORS,
  SCENARIO_DASH_PATTERNS,
  SCENARIO_LABELS,
} from "../../hooks/use-chart-data.ts";
import { ChartTooltip } from "../chart/ChartTooltip.tsx";

const SCENARIO_ORDER: readonly ScenarioId[] = [
  "current-law",
  "fedea-transition",
  "notional-accounts",
  "sustainability-2013",
  "eu-convergence",
  "greece-haircut",
];

const REFERENCE_LABEL_FONT_SIZE = 10;

interface CombinedHeroChartProps {
  readonly data: readonly CombinedChartDataPoint[];
  readonly comparisonScenarioId: ScenarioId;
  readonly retirementAge: number;
  readonly drawdownYears: number;
  readonly displayMode: "real" | "nominal";
}

export function CombinedHeroChart({
  data,
  comparisonScenarioId,
  retirementAge,
  drawdownYears,
  displayMode,
}: CombinedHeroChartProps) {
  if (data.length === 0) return null;

  const privateIncomeEndAge = retirementAge + drawdownYears;
  const showsPrivateIncomeEnd =
    privateIncomeEndAge > retirementAge &&
    privateIncomeEndAge <= data[data.length - 1].age;

  return (
    <div className="flex flex-col gap-3" data-testid="combined-income-chart">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Ingreso total planificado en jubilación
        </h3>
        <span className="text-xs text-gray-400 uppercase">
          Base pública + complemento privado
        </span>
      </div>
      <p className="text-xs leading-relaxed text-gray-500">
        La linea verde muestra tu plan total de ingresos si planificas con{" "}
        {SCENARIO_LABELS[comparisonScenarioId].toLowerCase()} y el ahorro
        privado calculado arriba.
      </p>
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div
          role="img"
          aria-label="Gráfico de ingreso total combinando pensión pública y ahorro privado"
        >
          <p className="sr-only">
            Gráfico que muestra el ingreso total planificado en jubilación,
            combinando la pensión pública estimada con el complemento de ahorro
            privado.
          </p>
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
              <Tooltip
                allowEscapeViewBox={{ x: true, y: true }}
                content={
                  <ChartTooltip
                    displayMode={displayMode}
                    combinedLabel={`Plan total (${SCENARIO_LABELS[comparisonScenarioId]})`}
                  />
                }
              />
              <ReferenceLine
                x={retirementAge}
                stroke="#1e40af"
                strokeDasharray="4 4"
                label={{
                  value: `${retirementAge} (jubilación)`,
                  position: "insideTop",
                  dy: 2,
                  fontSize: REFERENCE_LABEL_FONT_SIZE,
                  fill: "#1e40af",
                }}
              />
              {showsPrivateIncomeEnd && (
                <ReferenceLine
                  x={privateIncomeEndAge}
                  stroke="#047857"
                  strokeDasharray="2 6"
                />
              )}
              {SCENARIO_ORDER.map((scenarioId) => (
                <Line
                  key={scenarioId}
                  type="monotone"
                  dataKey={scenarioId}
                  stroke={SCENARIO_COLORS[scenarioId]}
                  strokeWidth={
                    scenarioId === "current-law"
                      ? 2.5
                      : scenarioId === "fedea-transition"
                        ? 2.25
                        : 1.5
                  }
                  strokeDasharray={
                    SCENARIO_DASH_PATTERNS[scenarioId] || undefined
                  }
                  strokeOpacity={scenarioId === "fedea-transition" ? 0.92 : 1}
                  strokeLinecap="round"
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
              <Line
                type="linear"
                dataKey="pension-plus-savings"
                stroke="#059669"
                strokeWidth={3.5}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls={false}
                name={`Plan total (${SCENARIO_LABELS[comparisonScenarioId]})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
                : id === "fedea-transition"
                  ? "Transicion"
                  : id === "notional-accounts"
                    ? "Nocional"
                    : id === "sustainability-2013"
                      ? "Sost. 2013"
                      : id === "eu-convergence"
                        ? "Conv. UE"
                        : "Grecia"}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-emerald-600" />
          <span className="font-semibold text-emerald-700">Plan total</span>
        </div>
      </div>
      {showsPrivateIncomeEnd && (
        <p className="text-xs leading-relaxed text-gray-500">
          La línea vertical verde marca el fin del complemento privado a los{" "}
          <span className="font-semibold text-emerald-700">
            {privateIncomeEndAge} años
          </span>
          . El plan asume {drawdownYears} años de apoyo desde la jubilación; a
          partir de ahí la línea verde gruesa vuelve a reflejar solo la pensión
          pública estimada.
        </p>
      )}
    </div>
  );
}
