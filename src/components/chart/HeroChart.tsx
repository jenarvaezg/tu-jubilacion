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
import type { ChartDataPoint } from "../../hooks/use-chart-data.ts";
import {
  SCENARIO_COLORS,
  SCENARIO_DASH_PATTERNS,
} from "../../hooks/use-chart-data.ts";
import { ChartTooltip } from "./ChartTooltip.tsx";
import { ChartLegend } from "./ChartLegend.tsx";

const SCENARIO_ORDER: readonly ScenarioId[] = [
  "current-law",
  "fedea-transition",
  "notional-accounts",
  "sustainability-2013",
  "eu-convergence",
  "greece-haircut",
];

const REFERENCE_LABEL_FONT_SIZE = 10;
const REFERENCE_MARKERS = [
  { age: 63, label: "63 ant.", dy: 2, dx: -10, stroke: "#9ca3af" },
  { age: 67, label: "67 legal", dy: 16, dx: 0, stroke: "#6b7280" },
  { age: 70, label: "70 dem.", dy: 30, dx: 10, stroke: "#9ca3af" },
] as const;

interface HeroChartProps {
  readonly data: readonly ChartDataPoint[];
  readonly retirementAge: number;
  readonly displayMode: "real" | "nominal";
}

export function HeroChart({
  data,
  retirementAge,
  displayMode,
}: HeroChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-dashed border-ink/20 bg-white/50">
        <p className="font-serif italic text-sm text-ink/40">
          Introduzca sus datos para generar la proyección
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border border-paper-dark bg-white p-6 sm:p-8">
        <div className="mb-6 border-b border-paper-dark pb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-ink/60">
            Proyección de Ingresos Públicos
          </h3>
          <p className="mt-1 font-serif italic text-xs text-ink-light/80">
            Comparativa de escenarios de reforma según edad alcanzada (Euros {displayMode === 'real' ? 'de hoy' : 'nominales'}).
          </p>
        </div>
        
        <div data-testid="hero-chart">
          <div
            role="img"
            aria-label="Gráfico de pensión mensual estimada por edad bajo 6 escenarios de reforma"
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={data as ChartDataPoint[]}
                margin={{ top: 40, right: 20, left: 0, bottom: 20 }}
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
                  content={<ChartTooltip displayMode={displayMode} />}
                />
                {REFERENCE_MARKERS.map((marker) => (
                  <ReferenceLine
                    key={marker.age}
                    x={marker.age}
                    stroke={marker.stroke}
                    strokeDasharray="2 2"
                    label={{
                      value: marker.label,
                      position: "insideTop",
                      dy: marker.dy,
                      dx: marker.dx,
                      fontSize: 9,
                      fontFamily: 'ui-monospace',
                      textTransform: 'uppercase',
                      fill: "#94a3b8",
                    }}
                  />
                ))}
                {retirementAge !== 63 &&
                  retirementAge !== 67 &&
                  retirementAge !== 70 && (
                    <ReferenceLine
                      x={retirementAge}
                      stroke="#c2410c"
                      strokeDasharray="3 3"
                      label={{
                        value: `${retirementAge} JUB.`,
                        position: "insideTop",
                        dy: 44,
                        dx: retirementAge < 67 ? -8 : 8,
                        fontSize: 9,
                        fontFamily: 'ui-monospace',
                        fontWeight: 'bold',
                        fill: "#c2410c",
                      }}
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
                        ? 3
                        : scenarioId === "fedea-transition"
                          ? 2.5
                          : 1.5
                    }
                    strokeDasharray={
                      SCENARIO_DASH_PATTERNS[scenarioId] || undefined
                    }
                    strokeOpacity={scenarioId === "fedea-transition" ? 0.9 : 0.8}
                    strokeLinecap="butt"
                    dot={false}
                    activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <ChartLegend />
    </div>
  );
}
