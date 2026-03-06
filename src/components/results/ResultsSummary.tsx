import type { ScenarioResult } from "../../engine/types.ts";
import { ScenarioCard } from "./ScenarioCard.tsx";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";
import { formatPercent } from "../../utils/format.ts";
import { getRetirementMonthlyPensionReal } from "../../engine/scenario-utils.ts";

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
    }, null) ?? baselineResult ?? null;

  const baselinePension = baselineResult
    ? getRetirementMonthlyPensionReal(baselineResult)
    : 0;
  const publicFloor = publicFloorResult
    ? getRetirementMonthlyPensionReal(publicFloorResult)
    : baselinePension;
  const publicRangeDropPercent =
    baselinePension > 0 ? (baselinePension - publicFloor) / baselinePension : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-2xl bg-gray-900 text-white shadow-xl">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Tu plan no debe depender de una sola cifra
            </h2>
            <p className="mt-4 text-3xl font-extrabold leading-tight">
              El sistema actual tendra que reformarse. La pension publica es una
              base util, pero no una promesa cerrada para toda tu jubilacion.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
              En los escenarios modelados, tu ingreso publico de jubilacion se
              mueve entre un suelo prudente y la referencia legal de hoy. La
              pregunta importante no es que reforma exacta vendra, sino que
              parte de tus ingresos deberias construir por tu cuenta.
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Al jubilarte, en euros de hoy
                </p>
                <CurrencyDisplay
                  amount={baselinePension}
                  className="text-2xl font-bold"
                />
              </div>
              <div className="flex items-center text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-tighter text-amber-300">
                  Suelo prudente del rango
                </p>
                <CurrencyDisplay
                  amount={publicFloor}
                  className="text-2xl font-extrabold text-amber-300"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  {publicFloorResult?.scenarioName ?? "Escenario modelado"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center border-l border-white/5 bg-blue-950/30 p-8 md:w-72">
            <p className="text-xs font-bold uppercase text-blue-300">
              Objetivo de planificacion
            </p>
            <p className="mt-2 text-2xl font-black leading-tight text-white">
              Usa la pension publica como base, no como plan completo.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              Si la reforma se parece al suelo del rango modelado, tu ingreso
              publico podria caer hasta un{" "}
              <span className="font-bold text-blue-200">
                {formatPercent(publicRangeDropPercent)}
              </span>{" "}
              frente a la ley actual.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gray-400 italic">
              Tu ahorro privado es el mecanismo para sostener ingresos durante
              toda la jubilacion, no solo para llegar al dia de retiro.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-xl font-black uppercase tracking-tight italic text-gray-900">
            Analisis multi-escenario
          </h2>
          <span className="text-[10px] font-bold uppercase text-gray-400">
            Rango de planificacion
          </span>
        </div>
        <p className="text-sm leading-relaxed text-gray-600">
          Nadie sabe que reforma exacta llegara. Estos escenarios no intentan
          adivinar el futuro con precision, sino acotar un rango plausible de
          ingresos publicos con el que conviene planificar tu jubilacion.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <ScenarioCard
              key={result.scenarioId}
              result={result}
              baselinePension={baselinePension}
              showDetail={showDetail}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border-l-4 border-gray-900 bg-white p-6 shadow-sm">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-900">
          Enfoque de la herramienta
        </p>
        <p className="leading-relaxed text-gray-700 italic">
          El sistema actual es dificil de sostener sin cambios. Por eso la
          pregunta importante no es "que pension exacta me tocara", sino "que
          parte de mis ingresos de jubilacion puedo considerar publica y que
          parte tengo que construir yo".
          <span className="font-bold">
            {" "}
            La app usa varias reformas plausibles para que planifiques con
            margen de seguridad, no para convertir una de ellas en villano.
          </span>
        </p>
      </div>
    </div>
  );
}
