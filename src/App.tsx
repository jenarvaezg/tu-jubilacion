import { useAppState } from "./state/use-app-state.ts";
import { usePensionCalculation } from "./hooks/use-pension-calculation.ts";
import { useChartData } from "./hooks/use-chart-data.ts";
import { useSavingsCalculation } from "./hooks/use-savings-calculation.ts";
import { useCombinedChartData } from "./hooks/use-combined-chart-data.ts";
import { useComparisonChartData } from "./hooks/use-comparison-chart-data.ts";
import { PageLayout } from "./components/layout/PageLayout.tsx";
import { InputPanel } from "./components/input/InputPanel.tsx";
import { HeroChart } from "./components/chart/HeroChart.tsx";
import { ChartControls } from "./components/chart/ChartControls.tsx";
import { ResultsSummary } from "./components/results/ResultsSummary.tsx";
import { ShareButton } from "./components/results/ShareButton.tsx";
import { EducationSection } from "./components/education/EducationSection.tsx";
import { DetailToggle } from "./components/detail/DetailToggle.tsx";
import { SavingsSection } from "./components/savings/SavingsSection.tsx";
import { BacktestSection } from "./components/backtest/BacktestSection.tsx";

function App() {
  const { state, dispatch, getShareUrl } = useAppState();
  const { results, error } = usePensionCalculation(state.calculation);
  const chartData = useChartData({
    results,
    displayMode: state.display.displayMode,
    currentAge: state.calculation.profile.age,
  });
  const savingsCalc = useSavingsCalculation({
    pensionResults: results,
    inputs: state.calculation,
  });
  const combinedChartData = useCombinedChartData({
    results,
    portfolioTimeline: savingsCalc.portfolioTimeline,
    comparisonScenarioId: state.calculation.comparisonScenarioId,
    displayMode: state.display.displayMode,
    currentAge: state.calculation.profile.age,
  });
  const comparisonChartData = useComparisonChartData({
    comparisonTimeline: savingsCalc.comparisonTimeline,
    displayMode: state.display.displayMode,
  });

  return (
    <PageLayout
      sidebar={
        <div className="flex flex-col gap-4">
          <InputPanel state={state} dispatch={dispatch} />
          <ShareButton getShareUrl={getShareUrl} results={results} />
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {error !== null && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <ChartControls
          displayMode={state.display.displayMode}
          ipcRate={state.calculation.ipcRate}
          notionalGrowthScenario={state.calculation.notionalGrowthScenario}
          dispatch={dispatch}
        />

        <HeroChart
          data={chartData}
          retirementAge={state.calculation.profile.desiredRetirementAge}
          displayMode={state.display.displayMode}
        />

        <div className="flex items-center justify-between">
          <DetailToggle
            showDetail={state.display.showDetail}
            onToggle={() => dispatch({ type: "TOGGLE_DETAIL" })}
          />
        </div>

        <ResultsSummary
          results={results}
          showDetail={state.display.showDetail}
        />

        <SavingsSection
          savingsCalc={savingsCalc}
          comparisonChartData={comparisonChartData}
          combinedChartData={combinedChartData}
          comparisonScenarioId={state.calculation.comparisonScenarioId}
          investmentProfileId={state.calculation.investmentProfileId}
          retirementAge={state.calculation.profile.desiredRetirementAge}
          displayMode={state.display.displayMode}
          dispatch={dispatch}
        />

        {savingsCalc.savings !== null && (
          <BacktestSection
            monthlyContribution={savingsCalc.savings.monthlyContribution}
            yearsOfAccumulation={savingsCalc.savings.yearsOfAccumulation}
            drawdownYears={savingsCalc.drawdownYears}
          />
        )}

        <EducationSection />
      </div>
    </PageLayout>
  );
}

export default App;
