import type { ScenarioResult, ScenarioId } from "../../engine/types.ts";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";
import {
  SCENARIO_LABELS,
  SCENARIO_COLORS,
} from "../../hooks/use-chart-data.ts";
import { formatPercent } from "../../utils/format.ts";

const SCENARIO_DESCRIPTIONS: Record<ScenarioId, string> = {
  "current-law":
    "Lo que cobrarías si no cambia nada. Se calcula con la fórmula actual de la Seguridad Social: media de tus mejores bases de cotización, ajustada por años trabajados y edad de jubilación.",
  "notional-accounts":
    "Sistema tipo Suecia propuesto por FEDEA: tu pensión se calcula en función de lo que realmente has cotizado a lo largo de tu vida, ajustado por la esperanza de vida de tu generación. Más justo y sostenible, pero las pensiones iniciales son más bajas.",
  "sustainability-2013":
    "Reforma de Rajoy (2013), derogada en 2021. Reducía la pensión inicial si la esperanza de vida aumentaba y limitaba la subida anual al 0,25% (muy por debajo de la inflación). Tu pensión perdía poder adquisitivo cada año.",
  "eu-convergence":
    "¿Qué pasaría si España convergiera a la media europea? Hoy, un jubilado español cobra ~80% de su último sueldo bruto. La media de la UE es ~60%. Este escenario aplica ese 60% directamente.",
  "greece-haircut":
    "Lo que ocurrió en Grecia durante la crisis de deuda (2010-2015): las pensiones se recortaron hasta un 40% de un día para otro para evitar la quiebra del Estado. Aquí simulamos un recorte del 30%.",
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

      <p className="mt-2 text-xs text-gray-500 leading-relaxed">
        {SCENARIO_DESCRIPTIONS[result.scenarioId as ScenarioId]}
      </p>

      <div className="mt-2">
        <p className="text-sm text-gray-600">Tu pensión será de</p>
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
