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
    <div className="border border-paper-dark bg-white p-8 sm:p-12 overflow-hidden">
      <div>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40 mb-6">
          Auditoría de Brecha de Ingresos
        </h2>
        <p className="text-2xl font-serif font-bold leading-tight text-ink sm:text-3xl">
          {hasSelectedGap ? (
            <>
              Para sostener su nivel de vida actual, se estima una carencia de{" "}
              <span className="text-accent underline decoration-accent/20">
                <CurrencyDisplay
                  amount={selectedGap}
                  className="text-2xl text-accent md:text-3xl"
                />
              </span>{" "}
              bajo el escenario {SCENARIO_LABELS[comparisonScenarioId].toLowerCase()}.
            </>
          ) : (
            <span className="text-success">
              Bajo este escenario de reforma, la pensión pública cubriría íntegramente su nivel de vida actual.
            </span>
          )}
        </p>
        <p className="mt-6 font-serif italic text-base leading-relaxed text-ink-light/80 max-w-3xl">
          Este análisis normaliza su gasto actual a una base de 12 meses y lo compara con la pensión estimada al jubilarse, todo expresado en euros de hoy para garantizar la coherencia del poder adquisitivo.
        </p>

        <div className="mt-8 border border-dashed border-ink/20 bg-paper-dark/30 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-2">
            Metodología de Referencia Actual
          </p>
          <p className="font-serif italic text-sm text-ink-light leading-relaxed">
            {inputExplanation}. Referencia mensual normalizada (12 meses):{" "}
            <span className="font-mono font-bold text-ink ml-1">
              {formatCurrency(lifestyleBreakdown.normalizedMonthlyNet)}/mes
            </span>.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="border border-paper-dark p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-3">
              Referencia Actual
            </p>
            <div className="flex items-baseline gap-1">
              <CurrencyDisplay
                amount={gap.targetMonthlyIncome}
                className="text-2xl font-mono font-bold text-ink tracking-tighter"
                suffix=""
              />
              <span className="text-[10px] font-mono text-ink/40 uppercase">/mes</span>
            </div>
            <p className="mt-4 font-serif italic text-[10px] text-ink-light/70 leading-relaxed uppercase">
              Su gasto mensual equivalente hoy.
            </p>
          </div>

          <div className="border border-paper-dark p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-3">
              Pensión Ley Actual
            </p>
            <div className="flex items-baseline gap-1">
              <CurrencyDisplay
                amount={gap.currentLawMonthly}
                className="text-2xl font-mono font-bold text-ink tracking-tighter"
                suffix=""
              />
              <span className="text-[10px] font-mono text-ink/40 uppercase">/mes</span>
            </div>
            <p className="mt-4 font-serif italic text-[10px] text-ink-light/70 leading-relaxed uppercase">
              Cobertura: {formatPercent(gap.currentLawCoverageRate)}. Brecha: {formatCurrency(gap.currentLawGapMonthly)}.
            </p>
          </div>

          <div className="border border-accent/40 bg-accent/5 p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-3">
              Escenario {SCENARIO_LABELS[comparisonScenarioId]}
            </p>
            <div className="flex items-baseline gap-1">
              <CurrencyDisplay
                amount={gap.comparisonMonthly}
                className="text-2xl font-mono font-bold text-accent tracking-tighter"
                suffix=""
              />
              <span className="text-[10px] font-mono text-accent/40 uppercase">/mes</span>
            </div>
            <p className="mt-4 font-serif italic text-[10px] text-accent/70 leading-relaxed uppercase">
              Cobertura: {formatPercent(gap.comparisonCoverageRate)}. Brecha: {formatCurrency(gap.comparisonGapMonthly)}.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-paper-dark pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="font-serif italic text-sm text-ink-light/90 leading-relaxed">
              {hasAdditionalGap ? (
                <>
                  Si la reforma se asimila a {SCENARIO_LABELS[comparisonScenarioId]},
                  el esfuerzo de ahorro privado requerido se incrementa en{" "}
                  <span className="font-mono font-bold text-ink not-italic">
                    <CurrencyDisplay amount={gap.additionalGapMonthly} />
                  </span>{" "}
                  mensuales respecto al marco legal actual.
                </>
              ) : (
                <>
                  Este escenario no supone un incremento de la brecha de ingresos proyectada bajo la legislación vigente.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <label className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">
              Escenario de Planificación
            </label>
            <select
              className="appearance-none rounded-none border-b border-ink/20 bg-transparent py-1 font-mono text-xs font-bold text-ink focus:border-accent focus:outline-none cursor-pointer"
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
    </div>
  );
}
