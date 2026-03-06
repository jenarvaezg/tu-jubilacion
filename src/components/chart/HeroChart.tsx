import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { ScenarioId } from '../../engine/types.ts';
import type { ChartDataPoint } from '../../hooks/use-chart-data.ts';
import { SCENARIO_COLORS } from '../../hooks/use-chart-data.ts';
import { ChartTooltip } from './ChartTooltip.tsx';
import { ChartLegend } from './ChartLegend.tsx';

const SCENARIO_ORDER: readonly ScenarioId[] = [
  'current-law',
  'fedea-transition',
  'notional-accounts',
  'sustainability-2013',
  'eu-convergence',
  'greece-haircut',
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
  readonly displayMode: 'real' | 'nominal';
}

export function HeroChart({ data, retirementAge, displayMode }: HeroChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white">
        <p className="text-sm text-gray-500">
          Introduce tus datos para ver las proyecciones
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-gray-500">
        La grafica se centra en el tramo final de tu carrera y en la
        jubilacion para que el rango relevante se lea mejor.
      </p>
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div data-testid="hero-chart">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart
              data={data as ChartDataPoint[]}
              margin={{ top: 56, right: 18, left: 20, bottom: 26 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="age"
                label={{ value: 'Edad', position: 'insideBottom', offset: -8, fontSize: 12 }}
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
                tickFormatter={(v: number) => `${Math.round(v)}`}
                label={{ value: 'EUR/mes', angle: -90, position: 'insideLeft', offset: -2, fontSize: 12 }}
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
                  strokeDasharray={marker.age === 67 ? "4 4" : "3 3"}
                  label={{
                    value: marker.label,
                    position: "insideTop",
                    dy: marker.dy,
                    dx: marker.dx,
                    fontSize: REFERENCE_LABEL_FONT_SIZE,
                    fill: "#6b7280",
                  }}
                />
              ))}
              {retirementAge !== 63 &&
                retirementAge !== 67 &&
                retirementAge !== 70 && (
                  <ReferenceLine
                    x={retirementAge}
                    stroke="#1e40af"
                    strokeDasharray="4 4"
                    label={{
                      value: `${retirementAge} tuya`,
                      position: "insideTop",
                      dy: 44,
                      dx: retirementAge < 67 ? -8 : 8,
                      fontSize: REFERENCE_LABEL_FONT_SIZE,
                      fill: "#1e40af",
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
                    scenarioId === 'current-law'
                      ? 2.5
                      : scenarioId === 'fedea-transition'
                        ? 2.25
                        : 1.5
                  }
                  strokeDasharray={
                    scenarioId === 'fedea-transition' ? '6 3' : undefined
                  }
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ChartLegend />
    </div>
  );
}
