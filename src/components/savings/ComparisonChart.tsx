import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ComparisonChartDataPoint } from "../../hooks/use-comparison-chart-data.ts";
import type { AppAction } from "../../state/types.ts";

interface ComparisonChartProps {
  readonly data: readonly ComparisonChartDataPoint[];
  readonly displayMode: "real" | "nominal";
  readonly dispatch: React.Dispatch<AppAction>;
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
      <p className="mb-2 text-xs font-medium text-gray-500">Edad {label}</p>
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

const LEGEND_ITEMS = [
  { id: "equity", label: "Renta variable", color: "#166534" },
  { id: "bonds", label: "Renta fija", color: "#0f172a" },
  { id: "deposits", label: "Letras Tesoro", color: "#94a3b8" },
  { id: "savings", label: "Solo ahorro (sin invertir)", color: "#94a3af" },
] as const;


export function ComparisonChart({ data, displayMode, dispatch }: ComparisonChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-6" data-testid="comparison-chart">
      <div className="border border-paper-dark bg-white p-6 sm:p-8">
        <div className="mb-6 border-b border-paper-dark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-ink/60">
              Dinámica de Acumulación Patrimonial
            </h3>
            <p className="mt-1 font-serif italic text-xs text-ink-light/80">
              Proyección de ahorro según distintas clases de activo y rentabilidades reales.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mr-2">Ver en:</span>
            <div className="flex">
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_DISPLAY_MODE", payload: "nominal" })}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border transition-all ${
                  displayMode === "nominal"
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink/40 border-ink/10 hover:text-ink/60"
                }`}
              >
                Nominal
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_DISPLAY_MODE", payload: "real" })}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border -ml-[1px] transition-all ${
                  displayMode === "real"
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink/40 border-ink/10 hover:text-ink/60"
                }`}
              >
                Real
              </button>
            </div>
          </div>
        </div>

        <div
          role="img"
          aria-label="Comparación de ingresos entre escenario de referencia y escenario seleccionado"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data as ComparisonChartDataPoint[]}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                tickFormatter={(value: number) =>
                  `${Math.round(value / 1000)}k`
                }
              />
              <Tooltip content={<ComparisonTooltipContent />} />
              <Area
                type="monotone"
                dataKey="equity"
                name="Renta variable"
                fill="#166534"
                fillOpacity={0.1}
                stroke="#166534"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="bonds"
                name="Renta fija"
                fill="#0f172a"
                fillOpacity={0.05}
                stroke="#0f172a"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="deposits"
                name="Letras Tesoro"
                fill="#94a3b8"
                fillOpacity={0.05}
                stroke="#94a3b8"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="savings"
                name="Solo ahorro"
                fill="#e2e8f0"
                fillOpacity={0.1}
                stroke="#94a3af"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-8 border-t border-paper-dark/10 pt-4 flex flex-wrap items-center justify-between gap-4">
          <div
            className="flex flex-wrap gap-x-6 gap-y-2"
            data-testid="comparison-chart-legend"
          >
            {LEGEND_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span
                  className={`inline-block h-0.5 w-4 ${item.id === 'savings' ? 'border-t border-dashed' : ''}`}
                  style={{ backgroundColor: item.id === 'equity' ? '#166534' : item.id === 'bonds' ? '#0f172a' : item.id === 'deposits' ? '#94a3b8' : 'transparent', borderColor: item.id === 'savings' ? '#94a3af' : 'transparent' }}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60">{item.label}</span>
              </div>
            ))}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40 italic">
            Eje horizontal: Edad cronológica
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-l-2 border-accent/20 pl-8 py-2">
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            Insight: El Límite del Ahorro Puro
          </h4>
          <p className="font-serif italic text-sm text-ink-light leading-relaxed">
            Ahorrar es un acto de disciplina, pero la liquidez es vulnerable a la erosión constante de la inflación. Observe cómo la línea de <span className="font-bold text-ink">Letras y Tesorería</span> apenas logra preservar el valor real del dinero a largo plazo.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-success">
            El Motor de la Inversión
          </h4>
          <p className="font-serif italic text-sm text-ink-light leading-relaxed">
            Solo mediante la exposición a activos productivos (<span className="font-bold text-ink">Renta Variable</span>) es posible activar el interés compuesto. Invertir no es opcional si el objetivo es transformar una aportación mensual modesta en un patrimonio que sostenga su nivel de vida.
          </p>
        </div>
      </div>
    </div>
  );
}
