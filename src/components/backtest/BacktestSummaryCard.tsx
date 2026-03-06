import type { BacktestSummary } from "../../engine/backtest/types";

interface BacktestSummaryCardProps {
  readonly summary: BacktestSummary;
}

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function BacktestSummaryCard({ summary }: BacktestSummaryCardProps) {
  const {
    best,
    worst,
    median,
    percentileAboveDeposits,
    totalCohorts,
    initialBalance,
  } = summary;

  const rows = [
    {
      label: "Mejor",
      cohort: best,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Mediana",
      cohort: median,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Peor",
      cohort: worst,
      color: "text-red-700",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
        Resultados del backtest
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {rows.map(({ label, cohort, color, bg }) => (
          <div
            key={label}
            className={`rounded-lg border border-gray-100 p-4 ${bg}`}
          >
            <p
              className={`text-xs font-bold uppercase tracking-wide ${color}`}
            >
              {label} ({cohort.startYear})
            </p>
            <p className="mt-2 text-lg font-black tabular-nums text-gray-900">
              {fmt.format(cohort.finalPortfolioReal)}
            </p>
            <p className="text-xs text-gray-600">
              {fmt.format(cohort.monthlyIncomeReal)}/mes en retiro
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 border border-gray-100">
        <span className="text-sm text-gray-600">
          Cohortes que batieron dejar el dinero sin rentabilidad
        </span>
        <span className="text-sm font-bold tabular-nums text-gray-900">
          {percentileAboveDeposits}%
        </span>
      </div>
      <p className="text-xs text-gray-400">
        {initialBalance > 0 && (
          <>
            Capital inicial proyectado: {fmt.format(initialBalance)}.{" "}
          </>
        )}
        Basado en {totalCohorts} cohortes historicas de{" "}
        {summary.yearsOfAccumulation} años de acumulacion
      </p>
    </div>
  );
}
