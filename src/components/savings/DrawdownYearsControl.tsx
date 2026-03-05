import type { AppAction } from "../../state/types.ts";

interface DrawdownYearsControlProps {
  readonly drawdownYears: number;
  readonly derivedDefault: number;
  readonly isOverride: boolean;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function DrawdownYearsControl({
  drawdownYears,
  derivedDefault,
  isOverride,
  dispatch,
}: DrawdownYearsControlProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500">
          Anos de retirada del ahorro
        </p>
        <div className="mt-1 flex items-center gap-3">
          <input
            type="range"
            aria-label="Anos de retirada del ahorro"
            min={5}
            max={40}
            step={1}
            value={drawdownYears}
            onChange={(e) =>
              dispatch({
                type: "SET_DRAWDOWN_YEARS",
                payload: Number(e.target.value),
              })
            }
            className="h-2 w-32 cursor-pointer accent-blue-600"
          />
          <span className="text-lg font-bold tabular-nums text-gray-900">
            {drawdownYears} anos
          </span>
        </div>
        {isOverride && (
          <p className="mt-1 text-[11px] text-gray-400">
            Derivado: {derivedDefault} anos
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            isOverride
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {isOverride ? "Manual" : "Auto"}
        </span>
        {isOverride && (
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "SET_DRAWDOWN_YEARS", payload: null })
            }
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Restaurar defecto
          </button>
        )}
      </div>
    </div>
  );
}
