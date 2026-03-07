import type { SavingsCalculationResult } from "../../hooks/use-savings-calculation.ts";
import type { ComparisonChartDataPoint } from "../../hooks/use-comparison-chart-data.ts";
import type { CombinedChartDataPoint } from "../../hooks/use-combined-chart-data.ts";
import type { ScenarioId } from "../../engine/types.ts";
import type { UserProfile } from "../../engine/types.ts";
import type { InvestmentProfileId } from "../../engine/savings/types.ts";
import type { AppAction } from "../../state/types.ts";
import { GapSummary } from "./GapSummary.tsx";
import { CurrentSavingsBalanceControl } from "./CurrentSavingsBalanceControl.tsx";
import { ContributionOverrideControl } from "./ContributionOverrideControl.tsx";
import { DrawdownYearsControl } from "./DrawdownYearsControl.tsx";
import { InvestmentProfileSelector } from "./InvestmentProfileSelector.tsx";
import { SavingsResult } from "./SavingsResult.tsx";
import { ComparisonChart } from "./ComparisonChart.tsx";
import { CombinedHeroChart } from "./CombinedHeroChart.tsx";
import { SavingsEducation } from "./SavingsEducation.tsx";

interface SavingsSectionProps {
  readonly savingsCalc: SavingsCalculationResult;
  readonly comparisonChartData: readonly ComparisonChartDataPoint[];
  readonly combinedChartData: readonly CombinedChartDataPoint[];
  readonly profile: UserProfile;
  readonly comparisonScenarioId: ScenarioId;
  readonly investmentProfileId: InvestmentProfileId;
  readonly currentSavingsBalance: number;
  readonly retirementAge: number;
  readonly displayMode: "real" | "nominal";
  readonly monthlyContributionOverride: number | null;
  readonly drawdownYears: number;
  readonly drawdownYearsOverride: number | null;
  readonly derivedDrawdownYears: number;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function SavingsSection({
  savingsCalc,
  comparisonChartData,
  combinedChartData,
  profile,
  comparisonScenarioId,
  investmentProfileId,
  currentSavingsBalance,
  retirementAge,
  displayMode,
  monthlyContributionOverride,
  drawdownYears,
  drawdownYearsOverride,
  derivedDrawdownYears,
  dispatch,
}: SavingsSectionProps) {
  const { gap, savings } = savingsCalc;

  if (gap === null || savings === null) return null;

  return (
    <div id="savings-section" className="flex flex-col gap-12 mt-8">
      <div className="flex flex-col gap-4 border-b border-paper-dark pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-serif font-bold text-ink tracking-tight">
            Estrategia de Complemento Privado
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40 border border-ink/10 px-3 py-1.5">
            Fase II: Capitalización
          </span>
        </div>
        <p className="font-serif italic text-base leading-relaxed text-ink-light/80 max-w-3xl">
          Utilizamos su ingreso neto actual como referencia de bienestar. El modelo calcula el capital privado necesario para cubrir la brecha generada por la reforma del sistema público, asegurando la sostenibilidad de sus rentas durante todo el periodo de retiro.
        </p>
      </div>

      <div className="border border-accent/20 bg-accent/5 p-6">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-accent/30 text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-serif font-bold text-accent uppercase tracking-wider">
              Nota de Responsabilidad
            </h3>
            <p className="mt-1 font-serif italic text-sm text-accent leading-relaxed">
              Las proyecciones de inversión se basan en medias históricas y tienen carácter estrictamente educativo. La rentabilidad pasada no es un predictor fiable de resultados futuros. Se recomienda la consulta con un asesor financiero certificado.
            </p>
          </div>
        </div>
      </div>

      <GapSummary
        gap={gap}
        profile={profile}
        comparisonScenarioId={comparisonScenarioId}
        dispatch={dispatch}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <CurrentSavingsBalanceControl
          currentSavingsBalance={currentSavingsBalance}
          dispatch={dispatch}
        />

        <DrawdownYearsControl
          drawdownYears={savingsCalc.drawdownYears}
          derivedDefault={derivedDrawdownYears}
          isOverride={drawdownYearsOverride !== null}
          dispatch={dispatch}
        />
      </div>

      <div className="border-t border-paper-dark pt-8">
        <InvestmentProfileSelector
          selectedProfileId={investmentProfileId}
          dispatch={dispatch}
        />
      </div>

      <div className="border-t border-paper-dark pt-8">
        <ContributionOverrideControl
          currentContribution={savings.monthlyContribution}
          isOverride={monthlyContributionOverride !== null}
          dispatch={dispatch}
        />
      </div>

      <SavingsResult savings={savings} />

      <div className="grid gap-8 lg:grid-cols-1">
        <ComparisonChart data={comparisonChartData} displayMode={displayMode} dispatch={dispatch} />

        <CombinedHeroChart
          data={combinedChartData}
          comparisonScenarioId={comparisonScenarioId}
          retirementAge={retirementAge}
          drawdownYears={drawdownYears}
          displayMode={displayMode}
        />
      </div>

      <div className="border-t border-paper-dark pt-12">
        <SavingsEducation />
      </div>
    </div>
  );
}
