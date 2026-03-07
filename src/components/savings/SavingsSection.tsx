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
    <div id="savings-section" className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="text-xl font-black uppercase tracking-tight italic text-gray-900">
          Cómo sostener tus ingresos
        </h2>
        <span className="text-xs font-bold uppercase text-gray-400">
          Fase 2: Plan de Ahorro
        </span>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">
        Tomamos tu ingreso neto actual como referencia de nivel de vida y
        calculamos cuanto complemento privado necesitas para sostenerlo durante
        toda la jubilación. Si la pensión pública se reforma a la baja, ese
        esfuerzo sube.
      </p>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">Aviso importante</p>
        <p className="mt-1 text-xs text-amber-700">
          Las proyecciones de ahorro e inversión son estimaciones educativas
          basadas en rentabilidades históricas. La rentabilidad pasada no
          garantiza resultados futuros. Consulta con un asesor financiero
          profesional antes de tomar decisiones de inversión.
        </p>
      </div>

      <GapSummary
        gap={gap}
        profile={profile}
        comparisonScenarioId={comparisonScenarioId}
        dispatch={dispatch}
      />

      <CurrentSavingsBalanceControl
        currentSavingsBalance={currentSavingsBalance}
        dispatch={dispatch}
      />

      <ContributionOverrideControl
        currentContribution={savings.monthlyContribution}
        isOverride={monthlyContributionOverride !== null}
        dispatch={dispatch}
      />

      <DrawdownYearsControl
        drawdownYears={savingsCalc.drawdownYears}
        derivedDefault={derivedDrawdownYears}
        isOverride={drawdownYearsOverride !== null}
        dispatch={dispatch}
      />

      <InvestmentProfileSelector
        selectedProfileId={investmentProfileId}
        dispatch={dispatch}
      />

      <SavingsResult savings={savings} />

      <ComparisonChart data={comparisonChartData} displayMode={displayMode} />

      <CombinedHeroChart
        data={combinedChartData}
        comparisonScenarioId={comparisonScenarioId}
        retirementAge={retirementAge}
        drawdownYears={drawdownYears}
        displayMode={displayMode}
      />

      <SavingsEducation />
    </div>
  );
}
