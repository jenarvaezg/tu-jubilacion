import type { SavingsCalculationResult } from "../../hooks/use-savings-calculation.ts";
import type { ComparisonChartDataPoint } from "../../hooks/use-comparison-chart-data.ts";
import type { CombinedChartDataPoint } from "../../hooks/use-combined-chart-data.ts";
import type { ScenarioId } from "../../engine/types.ts";
import type { InvestmentProfileId } from "../../engine/savings/types.ts";
import type { AppAction } from "../../state/types.ts";
import { GapSummary } from "./GapSummary.tsx";
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
  readonly comparisonScenarioId: ScenarioId;
  readonly investmentProfileId: InvestmentProfileId;
  readonly retirementAge: number;
  readonly displayMode: "real" | "nominal";
  readonly monthlyContributionOverride: number | null;
  readonly drawdownYearsOverride: number | null;
  readonly derivedDrawdownYears: number;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function SavingsSection({
  savingsCalc,
  comparisonChartData,
  combinedChartData,
  comparisonScenarioId,
  investmentProfileId,
  retirementAge,
  displayMode,
  monthlyContributionOverride,
  drawdownYearsOverride,
  derivedDrawdownYears,
  dispatch,
}: SavingsSectionProps) {
  const { gap, savings } = savingsCalc;

  if (gap === null || savings === null) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">
          Cuanto Necesitas Ahorrar
        </h2>
        <span className="text-[10px] font-bold text-gray-400 uppercase">
          Fase 2: Plan de Ahorro
        </span>
      </div>

      <GapSummary
        gap={gap}
        comparisonScenarioId={comparisonScenarioId}
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
        retirementAge={retirementAge}
        displayMode={displayMode}
      />

      <SavingsEducation />
    </div>
  );
}
