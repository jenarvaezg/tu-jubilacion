import type { PensionGap } from "../../engine/savings/types.ts";
import type { ScenarioId } from "../../engine/types.ts";
import type { AppAction } from "../../state/types.ts";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";
import { SCENARIO_LABELS } from "../../hooks/use-chart-data.ts";
import { formatPercent } from "../../utils/format.ts";

const COMPARISON_OPTIONS: readonly ScenarioId[] = [
  "notional-accounts",
  "sustainability-2013",
  "eu-convergence",
  "greece-haircut",
];

interface GapSummaryProps {
  readonly gap: PensionGap;
  readonly comparisonScenarioId: ScenarioId;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function GapSummary({
  gap,
  comparisonScenarioId,
  dispatch,
}: GapSummaryProps) {
  const isPositiveGap = gap.gapMonthly > 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-gray-900 text-white shadow-xl">
      <div className="p-6 md:p-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Tu Brecha de Pension
        </h2>
        <p className="mt-4 text-2xl font-extrabold leading-tight md:text-3xl">
          {isPositiveGap ? (
            <>
              Te faltan{" "}
              <span className="text-red-500">
                <CurrencyDisplay
                  amount={gap.gapMonthly}
                  className="text-red-500 text-2xl md:text-3xl"
                />
              </span>{" "}
              al mes
              <span className="text-lg font-medium text-gray-400">
                {" "}
                ({formatPercent(gap.gapPercent)} menos)
              </span>
            </>
          ) : (
            <span className="text-green-400">
              Sin brecha bajo este escenario
            </span>
          )}
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Legislacion vigente
            </p>
            <CurrencyDisplay
              amount={gap.baselineMonthly}
              className="text-xl font-bold"
            />
          </div>
          <div className="text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
            <p className="text-xs font-medium uppercase text-red-400">
              {SCENARIO_LABELS[comparisonScenarioId]}
            </p>
            <CurrencyDisplay
              amount={gap.comparisonMonthly}
              className="text-xl font-extrabold text-red-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="text-xs font-medium text-gray-400">
            Comparar con:
          </label>
          <select
            className="ml-2 rounded bg-gray-800 px-3 py-1.5 text-sm text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
            value={comparisonScenarioId}
            onChange={(e) =>
              dispatch({
                type: "SET_COMPARISON_SCENARIO",
                payload: e.target.value as ScenarioId,
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
