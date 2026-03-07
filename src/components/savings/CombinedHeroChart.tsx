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
    <div className="flex flex-col gap-6" data-testid="combined-income-chart">
      <div className="border border-paper-dark bg-white p-6 sm:p-8">
        <div className="mb-6 border-b border-paper-dark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-ink/60">
              Proyección de Ingreso Consolidado
            </h3>
            <p className="mt-1 font-serif italic text-xs text-ink-light/80">
              Suma de la pensión pública estimada y el complemento de ahorro privado.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase text-success border border-success/20 bg-success/5 px-2 py-1">
            Plan Total Integrado
          </span>
        </div>

        <div
          role="img"
          aria-label="Gráfico de ingreso total combinando pensión pública y ahorro privado"
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data as CombinedChartDataPoint[]}
              margin={{ top: 40, right: 20, left: -20, bottom: 20 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="age"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontFamily: 'ui-monospace', fill: '#64748b' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontFamily: 'ui-monospace', fill: '#64748b' }}
                tickFormatter={(v: number) => `${Math.round(v)}€`}
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
                stroke="#c2410c"
                strokeDasharray="3 3"
                label={{
                  value: `RETIRO ${retirementAge}`,
                  position: "insideTop",
                  dy: 2,
                  fontSize: 9,
                  fontFamily: 'ui-monospace',
                  fontWeight: 'bold',
                  fill: "#c2410c",
                }}
              />
              {showsPrivateIncomeEnd && (
                <ReferenceLine
                  x={privateIncomeEndAge}
                  stroke="#059669"
                  strokeDasharray="2 4"
                  label={{
                    value: `FIN COMPLEMENTO ${privateIncomeEndAge}`,
                    position: "insideTop",
                    dy: 20,
                    fontSize: 9,
                    fontFamily: 'ui-monospace',
                    fill: "#059669",
                  }}
                />
              )}
              {SCENARIO_ORDER.map((scenarioId) => (
                <Line
                  key={scenarioId}
                  type="monotone"
                  dataKey={scenarioId}
                  stroke={SCENARIO_COLORS[scenarioId]}
                  strokeWidth={1}
                  strokeDasharray={
                    SCENARIO_DASH_PATTERNS[scenarioId] || "4 4"
                  }
                  strokeOpacity={0.3}
                  dot={false}
                  connectNulls={false}
                />
              ))}
              <Line
                type="monotone"
                dataKey="pension-plus-savings"
                stroke="#059669"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                connectNulls={false}
                name={`Plan total (${SCENARIO_LABELS[comparisonScenarioId]})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 border-t border-paper-dark/10 pt-4 flex flex-wrap gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-success" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-success">Plan de Ingresos Objetivo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-4 border-t border-dashed border-ink/40" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Escenarios de Pensión Pública</span>
          </div>
        </div>
      </div>
      
      {showsPrivateIncomeEnd && (
        <div className="border-l-2 border-success bg-success/5 p-4">
          <p className="font-serif italic text-xs leading-relaxed text-success/80">
            Nota: La línea consolidada refleja el cese del flujo de rentas privadas a los <span className="font-mono font-bold">{privateIncomeEndAge} años</span>. A partir de este hito, el modelo asume que el ingreso se limita estrictamente a la pensión pública proyectada.
          </p>
        </div>
      )}
    </div>
  );
}
