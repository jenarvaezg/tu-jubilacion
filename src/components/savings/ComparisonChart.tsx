import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ComparisonChartDataPoint } from "../../hooks/use-comparison-chart-data.ts";

interface ComparisonChartProps {
  readonly data: readonly ComparisonChartDataPoint[];
  readonly displayMode: "real" | "nominal";
}

function ComparisonTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const fmt = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs font-medium text-gray-500">
        Edad {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
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

export function ComparisonChart({ data, displayMode }: ComparisonChartProps) {
  if (data.length === 0) return null;

  const label = displayMode === "real" ? "euros de hoy" : "euros nominales";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Como construyes tu complemento privado
        </h3>
        <span className="text-[10px] text-gray-400 uppercase">
          En {label}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-gray-500">
        Mismo ahorro actual y misma aportacion mensual, proyectados con
        distintas rentabilidades reales a largo plazo.
      </p>
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={data as ComparisonChartDataPoint[]}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
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
              tickFormatter={(v: number) =>
                `${Math.round(v / 1000)}k`
              }
              label={{
                value: "EUR",
                angle: -90,
                position: "insideLeft",
                offset: -2,
                fontSize: 12,
              }}
            />
            <Tooltip content={<ComparisonTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="equity"
              name="Renta variable"
              fill="#16a34a"
              fillOpacity={0.15}
              stroke="#16a34a"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="bonds"
              name="Renta fija"
              fill="#2563eb"
              fillOpacity={0.1}
              stroke="#2563eb"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="deposits"
              name="Depositos"
              fill="#9ca3af"
              fillOpacity={0.08}
              stroke="#9ca3af"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
