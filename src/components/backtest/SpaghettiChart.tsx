import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { BacktestSummary } from "../../engine/backtest/types";
import { sampleCohorts } from "../../engine/backtest/statistics";

const MAX_BACKGROUND_LINES = 20;

interface SpaghettiChartProps {
  readonly summary: BacktestSummary;
}

function SpaghettiTooltipContent({
  active,
  payload,
  label,
  totalYears,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
  }>;
  label?: number;
  totalYears?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const fmt = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const highlighted = payload.filter(
    (entry) =>
      entry.dataKey === "best" ||
      entry.dataKey === "worst" ||
      entry.dataKey === "median",
  );

  if (highlighted.length === 0) return null;

  const yearDisplay =
    label !== undefined && totalYears !== undefined
      ? `Ano ${label + 1} de ${totalYears}`
      : `Ano ${label !== undefined ? label + 1 : "-"}`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs font-medium text-gray-500">{yearDisplay}</p>
      {highlighted.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold tabular-nums">
            {fmt.format(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SpaghettiChart({ summary }: SpaghettiChartProps) {
  const { best, worst, median, allCohorts } = summary;

  const { data, backgroundKeys } = useMemo(() => {
    const highlightedYears = new Set([
      best.startYear,
      worst.startYear,
      median.startYear,
    ]);

    const sampled = sampleCohorts(allCohorts, MAX_BACKGROUND_LINES);
    const backgroundCohorts = sampled.filter(
      (c) => !highlightedYears.has(c.startYear),
    );

    const yearCount = allCohorts[0].trajectory.length;
    const points: Record<string, number>[] = [];

    for (let i = 0; i < yearCount; i++) {
      const point: Record<string, number> = { yearIndex: i };
      for (const c of backgroundCohorts) {
        point[`c_${c.startYear}`] = c.trajectory[i].portfolioValueReal;
      }
      point.best = best.trajectory[i].portfolioValueReal;
      point.worst = worst.trajectory[i].portfolioValueReal;
      point.median = median.trajectory[i].portfolioValueReal;
      points.push(point);
    }

    return {
      data: points,
      backgroundKeys: backgroundCohorts.map((c) => `c_${c.startYear}`),
    };
  }, [allCohorts, best, worst, median]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Simulacion historica por cohorte
        </h3>
        <span className="text-[10px] text-gray-400 uppercase">
          Euros reales
        </span>
      </div>
      <p className="text-xs leading-relaxed text-gray-500">
        Cada linea representa una cohorte historica distinta de ahorro. Las
        tres destacadas muestran mejor, mediana y peor secuencia observada.
      </p>
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="yearIndex"
              label={{
                value: "Anos desde que empiezas a ahorrar",
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
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              label={{
                value: "EUR",
                angle: -90,
                position: "insideLeft",
                offset: -2,
                fontSize: 12,
              }}
            />
            <Tooltip
              content={
                <SpaghettiTooltipContent
                  totalYears={summary.yearsOfAccumulation}
                />
              }
            />
            {backgroundKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke="#d1d5db"
                strokeWidth={1}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            ))}
            <Line
              type="monotone"
              dataKey="best"
              name={`Mejor (${best.startYear})`}
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="median"
              name={`Mediana (${median.startYear})`}
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="worst"
              name={`Peor (${worst.startYear})`}
              stroke="#dc2626"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-green-600" /> Mejor
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-blue-600" /> Mediana
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-red-600" /> Peor
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-gray-300" /> Otras
            cohortes
          </span>
        </div>
      </div>
    </div>
  );
}
