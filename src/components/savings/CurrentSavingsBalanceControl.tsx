import type { AppAction } from "../../state/types.ts";
import { formatCurrency } from "../../utils/format.ts";

interface CurrentSavingsBalanceControlProps {
  readonly currentSavingsBalance: number;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function CurrentSavingsBalanceControl({
  currentSavingsBalance,
  dispatch,
}: CurrentSavingsBalanceControlProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Ahorro actual para jubilacion
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Capital que ya tienes reservado para retiro. Lo proyectamos hasta tu
            jubilacion como base inicial del plan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="current-savings-balance">
            Ahorro actual para jubilacion
          </label>
          <input
            id="current-savings-balance"
            type="number"
            min={0}
            max={10000000}
            step={1000}
            value={currentSavingsBalance}
            onChange={(event) =>
              dispatch({
                type: "SET_CURRENT_SAVINGS_BALANCE",
                payload: Number(event.target.value),
              })
            }
            className="w-40 rounded border border-gray-300 px-3 py-2 text-sm tabular-nums text-gray-900 focus:border-blue-500 focus:outline-none"
          />
          <span className="min-w-28 text-right text-sm font-semibold tabular-nums text-gray-900">
            {formatCurrency(currentSavingsBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}
