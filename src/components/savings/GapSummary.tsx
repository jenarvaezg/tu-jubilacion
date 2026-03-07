import type { RetirementIncomeGap } from "../../engine/savings/types.ts";
import type { ScenarioId, UserProfile } from "../../engine/types.ts";
import type { AppAction } from "../../state/types.ts";
import { deriveLifestyleTargetBreakdown } from "../../engine/salary.ts";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";
import { SCENARIO_LABELS } from "../../hooks/use-chart-data.ts";
import { formatCurrency, formatPercent } from "../../utils/format.ts";

const COMPARISON_OPTIONS: readonly ScenarioId[] = [
  "fedea-transition",
  "notional-accounts",
  "sustainability-2013",
  "eu-convergence",
  "greece-haircut",
];

interface GapSummaryProps {
  readonly gap: RetirementIncomeGap;
  readonly profile: UserProfile;
  readonly comparisonScenarioId: ScenarioId;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function GapSummary({
  gap,
  profile,
  comparisonScenarioId,
  dispatch,
}: GapSummaryProps) {
  const selectedGap = gap.comparisonGapMonthly;
  const hasSelectedGap = selectedGap > 0;
  const hasAdditionalGap = gap.additionalGapMonthly > 0;
  const lifestyleBreakdown = deriveLifestyleTargetBreakdown(profile);
  const inputExplanation =
    lifestyleBreakdown.inputMode === "net-monthly"
      ? `${formatCurrency(lifestyleBreakdown.inputAmount)} netos/mes x ${lifestyleBreakdown.paymentsPerYear} pagas = ${formatCurrency(lifestyleBreakdown.annualNet)} netos al año`
      : `${formatCurrency(lifestyleBreakdown.annualGross)} brutos al año -> ${formatCurrency(lifestyleBreakdown.annualNet)} netos estimados al año`;

  return (
    <div className="overflow-hidden rounded-2xl bg-gray-900 text-white shadow-xl">
      <div className="p-6 md:p-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Brecha de ingresos a cubrir
        </h2>
        <p className="mt-4 text-2xl font-extrabold leading-tight md:text-3xl">
          {hasSelectedGap ? (
            <>
              Para mantener tu nivel de vida actual, te faltarian{" "}
              <span className="text-emerald-400">
                <CurrencyDisplay
                  amount={selectedGap}
                  className="text-2xl text-emerald-400 md:text-3xl"
                />
              </span>{" "}
              bajo {SCENARIO_LABELS[comparisonScenarioId].toLowerCase()}.
            </>
          ) : (
            <span className="text-green-400">
              Bajo este escenario, la pensión pública cubriría tu nivel de vida
              actual.
            </span>
          )}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300">
          La referencia de nivel de vida sale de tu ingreso neto anual actual,
          normalizado a 12 meses. La brecha se compara con la pensión estimada
          al jubilarte también en euros de hoy, para no mezclar cifras nominales
          futuras con tu gasto actual.
        </p>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-gray-200">
          <p className="font-medium text-white">
            Como se calcula tu referencia actual
          </p>
          <p className="mt-1">
            {inputExplanation}. Para comparar con la jubilación lo pasamos a una
            base común de 12 meses:{" "}
            <span className="font-semibold text-emerald-300">
              {formatCurrency(lifestyleBreakdown.normalizedMonthlyNet)}/mes
            </span>
            .
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Referencia actual (base 12 meses)
            </p>
            <CurrencyDisplay
              amount={gap.targetMonthlyIncome}
              className="mt-2 text-xl font-bold text-white"
            />
            <p className="mt-2 text-xs text-gray-300">
              Tu gasto mensual equivalente de hoy.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Pensión pública estimada
            </p>
            <CurrencyDisplay
              amount={gap.currentLawMonthly}
              className="mt-2 text-xl font-bold text-white"
            />
            <p className="mt-2 text-xs text-gray-300">
              Ley actual, al jubilarte, en euros de hoy.
            </p>
            <p className="mt-2 text-xs text-gray-300">
              {formatPercent(gap.currentLawCoverageRate)} del objetivo. Brecha:{" "}
              <span className="font-semibold text-white">
                <CurrencyDisplay amount={gap.currentLawGapMonthly} suffix="" />
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-200">
              {SCENARIO_LABELS[comparisonScenarioId]}
            </p>
            <CurrencyDisplay
              amount={gap.comparisonMonthly}
              className="mt-2 text-xl font-bold text-amber-100"
            />
            <p className="mt-2 text-xs text-amber-100/90">
              Pensión pública estimada bajo este escenario, en euros de hoy.
            </p>
            <p className="mt-2 text-xs text-amber-100/90">
              {formatPercent(gap.comparisonCoverageRate)} del objetivo. Brecha:{" "}
              <span className="font-semibold text-amber-50">
                <CurrencyDisplay amount={gap.comparisonGapMonthly} suffix="" />
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm leading-relaxed text-blue-100">
          {hasAdditionalGap ? (
            <>
              Si la reforma se parece a {SCENARIO_LABELS[comparisonScenarioId]},
              el esfuerzo privado sube en{" "}
              <span className="font-bold text-white">
                <CurrencyDisplay amount={gap.additionalGapMonthly} />
              </span>{" "}
              frente a planificar con ley actual.
            </>
          ) : (
            <>
              Frente a la ley actual, este escenario no aumenta la brecha de
              ingresos que tendrías que cubrir con ahorro privado.
            </>
          )}
        </div>

        <div className="mt-6">
          <label className="text-xs font-medium text-gray-400">
            Escenario de planificación:
          </label>
          <select
            className="ml-2 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            value={comparisonScenarioId}
            onChange={(event) =>
              dispatch({
                type: "SET_COMPARISON_SCENARIO",
                payload: event.target.value as ScenarioId,
              })
            }
          >
            {COMPARISON_OPTIONS.map((id) => (
              <option key={id} value={id}>
                {SCENARIO_LABELS[id]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
