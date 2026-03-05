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
  'notional-accounts',
  'sustainability-2013',
  'eu-convergence',
  'greece-haircut',
];

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
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart
            data={data as ChartDataPoint[]}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="age"
              label={{ value: 'Edad', position: 'insideBottom', offset: -5, fontSize: 12 }}
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              tickFormatter={(v: number) => `${Math.round(v)}`}
              label={{ value: 'EUR/mes', angle: -90, position: 'insideLeft', offset: 0, fontSize: 12 }}
            />
            <Tooltip
              content={<ChartTooltip displayMode={displayMode} />}
            />
            <ReferenceLine
              x={63}
              stroke="#9ca3af"
              strokeDasharray="3 3"
              label={{ value: '63 (anticipada)', position: 'top', fontSize: 10, fill: '#6b7280' }}
            />
            <ReferenceLine
              x={67}
              stroke="#6b7280"
              strokeDasharray="4 4"
              label={{ value: '67 (legal)', position: 'top', fontSize: 10, fill: '#6b7280' }}
            />
            <ReferenceLine
              x={70}
              stroke="#9ca3af"
              strokeDasharray="3 3"
              label={{ value: '70 (demorada)', position: 'top', fontSize: 10, fill: '#6b7280' }}
            />
            {retirementAge !== 63 && retirementAge !== 67 && retirementAge !== 70 && (
              <ReferenceLine
                x={retirementAge}
                stroke="#1e40af"
                strokeDasharray="4 4"
                label={{ value: `${retirementAge} (tuya)`, position: 'top', fontSize: 10, fill: '#1e40af' }}
              />
            )}
            {SCENARIO_ORDER.map((scenarioId) => (
              <Line
                key={scenarioId}
                type="monotone"
                dataKey={scenarioId}
                stroke={SCENARIO_COLORS[scenarioId]}
                strokeWidth={scenarioId === 'current-law' ? 2.5 : 1.5}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend />
    </div>
  );
}
