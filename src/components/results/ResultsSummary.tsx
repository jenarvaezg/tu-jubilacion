import type { ScenarioResult, ScenarioId } from "../../engine/types.ts";
import { ScenarioCard } from "./ScenarioCard.tsx";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";
import { Collapsible } from "../shared/Collapsible.tsx";
import { formatPercent } from "../../utils/format.ts";
import { getRetirementMonthlyPensionReal } from "../../engine/scenario-utils.ts";
import { SCENARIO_LABELS } from "../../hooks/use-chart-data.ts";

interface ResultsSummaryProps {
  readonly results: readonly ScenarioResult[];
  readonly showDetail: boolean;
}

export function ResultsSummary({ results, showDetail }: ResultsSummaryProps) {
  if (results.length === 0) return null;

  const baselineResult = results.find((r) => r.scenarioId === "current-law");
  const reformResults = results.filter((r) => r.scenarioId !== "current-law");
  const publicFloorResult =
    reformResults.reduce<ScenarioResult | null>((lowest, candidate) => {
      if (lowest === null) return candidate;
      return getRetirementMonthlyPensionReal(candidate) <
        getRetirementMonthlyPensionReal(lowest)
        ? candidate
        : lowest;
    }, null) ??
    baselineResult ??
    null;

  const baselinePension = baselineResult
    ? getRetirementMonthlyPensionReal(baselineResult)
    : 0;
  const publicFloor = publicFloorResult
    ? getRetirementMonthlyPensionReal(publicFloorResult)
    : baselinePension;
  const publicRangeDropPercent =
    baselinePension > 0 ? (baselinePension - publicFloor) / baselinePension : 0;

  return (
    <div className="flex flex-col gap-12">
      <div className="border border-paper-dark bg-ink text-paper overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-8 sm:p-12">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/40">
              Conclusión Prospectiva
            </h2>
            <p className="mt-6 text-2xl font-serif font-bold leading-tight sm:text-4xl">
              El sistema actual afronta una reforma estructural necesaria. La pensión pública es una base analítica, no una garantía cerrada.
            </p>
            <p className="mt-6 max-w-2xl font-serif italic text-base leading-relaxed text-paper/60">
              En los escenarios modelados, su ingreso público se desplaza entre un suelo prudente y la referencia legal vigente. El objetivo no es predecir la reforma, sino acotar el esfuerzo privado necesario.
            </p>
            
            <div className="mt-12 flex flex-wrap gap-12 border-t border-paper/10 pt-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-paper/40 mb-2">
                  Referencia Ley Actual (Euros hoy)
                </p>
                <div className="flex items-baseline gap-2">
                  <CurrencyDisplay
                    amount={baselinePension}
                    className="text-4xl font-mono font-bold tracking-tighter"
                    suffix=""
                  />
                  <span className="text-xs font-mono text-paper/40 uppercase">/mes</span>
                </div>
              </div>
              
              <div className="hidden items-center text-paper/20 md:flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">
                  Suelo de Planificación (Prudente)
                </p>
                <div className="flex items-baseline gap-2">
                  <CurrencyDisplay
                    amount={publicFloor}
                    className="text-4xl font-mono font-bold text-accent tracking-tighter"
                    suffix=""
                  />
                  <span className="text-xs font-mono text-accent/40 uppercase">/mes</span>
                </div>
                <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-paper/40">
                  {SCENARIO_LABELS[
                    publicFloorResult?.scenarioId as ScenarioId
                  ] ?? "Escenario modelado"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center bg-white/5 p-8 sm:p-12 md:w-80 border-t md:border-t-0 md:border-l border-paper/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-paper/40">
              Directriz de Ahorro
            </p>
            <p className="mt-4 font-serif text-xl leading-tight">
              La pensión pública debe actuar como base, no como plan integral.
            </p>
            <p className="mt-6 font-serif italic text-sm leading-relaxed text-paper/60">
              En el escenario más exigente, su ingreso público podría reducirse un{" "}
              <span className="font-mono font-bold text-accent not-italic">
                {formatPercent(publicRangeDropPercent)}
              </span>{" "}
              frente a la legislación actual.
            </p>
          </div>
        </div>
      </div>

      <a
        href="#savings-section"
        className="group relative inline-flex items-center gap-4 self-center sm:self-start border-2 border-ink bg-ink px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-paper hover:bg-transparent hover:text-ink transition-all duration-300"
      >
        Ver plan de ahorro privado
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-hover:translate-y-1"
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </a>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-paper-dark pb-4">
          <h2 className="text-lg font-serif font-bold uppercase tracking-widest text-ink">
            Análisis de Sensibilidad
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
            Rango de Modelado
          </span>
        </div>
        <p className="font-serif italic text-base leading-relaxed text-ink-light/80">
          La incertidumbre sobre futuras reformas aconseja planificar no sobre una cifra única, sino acotando un rango plausible de ingresos públicos.
        </p>

        <div className="mt-4">
          <Collapsible
            title="Desglosar todos los escenarios de reforma"
            defaultOpen={false}
            className="border border-paper-dark/20 p-2"
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 p-4">
              {results.map((result) => (
                <ScenarioCard
                  key={result.scenarioId}
                  result={result}
                  baselinePension={baselinePension}
                  showDetail={showDetail}
                />
              ))}
            </div>
          </Collapsible>
        </div>
      </div>

      <div className="border-l-4 border-ink bg-white p-8 border border-paper-dark">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-3">
          Nota Metodológica
        </h3>
        <p className="font-serif italic text-base leading-relaxed text-ink-light/90">
          La viabilidad del sistema actual exige ajustes paramétricos o estructurales. Esta herramienta utiliza diversas reformas observadas en la OCDE para que usted pueda planificar con un margen de seguridad prudencial, transformando la incertidumbre en una cifra de ahorro accionable.
        </p>
      </div>
    </div>
  );
}
