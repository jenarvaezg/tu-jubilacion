import type { ScenarioResult, ScenarioId } from "../../engine/types.ts";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";
import {
  SCENARIO_LABELS,
  SCENARIO_COLORS,
} from "../../hooks/use-chart-data.ts";
import { formatPercent } from "../../utils/format.ts";

const SCENARIO_DESCRIPTIONS: Record<ScenarioId, string> = {
  "current-law":
    "La referencia legal de hoy. Sirve como punto de partida util, pero no debe leerse como una promesa estable a 20 o 30 anos vista.",
  "notional-accounts":
    "Una familia de reformas usada en paises como Suecia o Italia. La usamos como referencia plausible de ajuste entre cotizaciones, pension y esperanza de vida; no como prediccion obligatoria.",
  "sustainability-2013":
    "Ejemplo de reforma parametrica: reduce la pension inicial si aumenta la esperanza de vida y limita la revalorizacion anual. Muestra como un ajuste puede recortar poder adquisitivo sin rehacer todo el sistema.",
  "eu-convergence":
    "Escenario de convergencia a tasas de reemplazo mas parecidas a la media europea. No describe una reforma concreta, sino un punto de referencia prudente para planificar.",
  "greece-haircut":
    "Escenario de estres severo inspirado en recortes extraordinarios de crisis. No es la hipotesis central, pero ayuda a medir cuanto dependerias de una pension publica muy recortada.",
};

interface ScenarioCardProps {
  readonly result: ScenarioResult;
  readonly baselinePension: number;
  readonly showDetail: boolean;
}

export function ScenarioCard({
  result,
  baselinePension,
  showDetail,
}: ScenarioCardProps) {
  const diff =
    baselinePension > 0
      ? (result.monthlyPension - baselinePension) / baselinePension
      : 0;
  const isBaseline = result.scenarioId === "current-law";
  const isLower = diff < -0.005;
  const isHigher = diff > 0.005;

  return (
    <div
      className="rounded-lg border p-4 transition-shadow hover:shadow-md"
      style={{
        borderLeftColor: SCENARIO_COLORS[result.scenarioId as ScenarioId],
        borderLeftWidth: "4px",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800">
          {SCENARIO_LABELS[result.scenarioId as ScenarioId]}
        </h3>
        {!isBaseline && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              isLower
                ? "bg-red-100 text-red-700"
                : isHigher
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {diff > 0 ? "+" : ""}
            {formatPercent(diff)}
          </span>
        )}
        {isBaseline && (
          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            Referencia
          </span>
        )}
      </div>

      <p className="mt-2 text-xs leading-relaxed text-gray-500">
        {SCENARIO_DESCRIPTIONS[result.scenarioId as ScenarioId]}
      </p>

      <div className="mt-2">
        <p className="text-sm text-gray-600">Ingreso publico estimado</p>
        <CurrencyDisplay
          amount={result.monthlyPension}
          className="text-xl text-gray-900"
        />
      </div>

      {showDetail && (
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Base reguladora</span>
            <span className="font-medium tabular-nums">
              {result.baseReguladora.toFixed(2)} EUR
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tasa de reemplazo (bruto)</span>
            <span className="font-medium tabular-nums">
              {formatPercent(result.replacementRate)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
