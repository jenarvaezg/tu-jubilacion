import type { ScenarioResult, ScenarioId } from "../../engine/types.ts";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";
import {
  SCENARIO_LABELS,
  SCENARIO_COLORS,
} from "../../hooks/use-chart-data.ts";
import { formatPercent } from "../../utils/format.ts";
import { getRetirementMonthlyPensionReal } from "../../engine/scenario-utils.ts";

const SCENARIO_DESCRIPTIONS: Record<ScenarioId, string> = {
  "current-law":
    "La referencia legal de hoy. Sirve como punto de partida útil, pero no debe leerse como una promesa estable a 20 o 30 años vista.",
  "fedea-transition":
    "Escenario intermedio: mezcla gradual entre ley actual y cuentas nocionales según cohorte. Sirve para visualizar una reforma plausible sin saltar directamente al modelo nocional puro.",
  "notional-accounts":
    "Una familia de reformas usada en países como Suecia o Italia. La usamos como referencia plausible de ajuste entre cotizaciones, pensión y esperanza de vida; no como predicción obligatoria.",
  "sustainability-2013":
    "Ejemplo de reforma paramétrica: reduce la pensión inicial si aumenta la esperanza de vida y limita la revalorización anual. Muestra cómo un ajuste puede recortar poder adquisitivo sin rehacer todo el sistema.",
  "eu-convergence":
    "Escenario de convergencia a tasas de reemplazo más parecidas a la media europea. No describe una reforma concreta, sino un punto de referencia prudente para planificar.",
  "greece-haircut":
    "Escenario de estrés severo inspirado en recortes extraordinarios de crisis. No es la hipótesis central, pero ayuda a medir cuánto dependerías de una pensión pública muy recortada.",
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
  const displayedPension = getRetirementMonthlyPensionReal(result);
  const diff =
    baselinePension > 0
      ? (displayedPension - baselinePension) / baselinePension
      : 0;
  const isBaseline = result.scenarioId === "current-law";
  const isLower = diff < -0.005;
  const isHigher = diff > 0.005;

  return (
    <div
      className="border border-paper-dark bg-white p-6 transition-colors hover:bg-paper-dark/50"
      style={{
        borderTopColor: SCENARIO_COLORS[result.scenarioId as ScenarioId],
        borderTopWidth: "2px",
      }}
    >
      <div className="flex items-start justify-between gap-2 border-b border-paper-dark/10 pb-3 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink/80">
          {SCENARIO_LABELS[result.scenarioId as ScenarioId]}
        </h3>
        {!isBaseline && (
          <span
            className={`shrink-0 border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${
              isLower
                ? "border-danger text-danger bg-danger/5"
                : isHigher
                  ? "border-success text-success bg-success/5"
                  : "border-ink/20 text-ink/40"
            }`}
          >
            {diff > 0 ? "+" : ""}
            {formatPercent(diff)}
          </span>
        )}
        {isBaseline && (
          <span className="shrink-0 border border-ink/40 bg-ink text-paper px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest">
            Referencia
          </span>
        )}
      </div>

      <p className="font-serif italic text-xs leading-relaxed text-ink-light/70">
        {SCENARIO_DESCRIPTIONS[result.scenarioId as ScenarioId]}
      </p>

      <div className="mt-6 border-t border-paper-dark/10 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">
          Pensión mensual estimada
        </p>
        <div className="flex items-baseline gap-1">
          <CurrencyDisplay
            amount={displayedPension}
            className="text-2xl font-mono font-bold text-ink tracking-tighter"
            suffix=""
          />
          <span className="text-[10px] font-mono text-ink/40 uppercase">/mes</span>
        </div>
      </div>

      {showDetail && (
        <div className="mt-4 space-y-2 border-t border-dashed border-paper-dark/20 pt-4">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-ink/60">
            <span>Base reguladora</span>
            <span className="font-mono font-bold">
              {result.baseReguladora.toFixed(2)} EUR
            </span>
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-ink/60">
            <span>Tasa de reemplazo</span>
            <span className="font-mono font-bold">
              {formatPercent(result.replacementRate)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
