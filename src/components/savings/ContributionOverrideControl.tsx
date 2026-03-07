import { useState } from "react";
import type { AppAction } from "../../state/types.ts";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";

interface ContributionOverrideControlProps {
  readonly currentContribution: number;
  readonly isOverride: boolean;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function ContributionOverrideControl({
  currentContribution,
  isOverride,
  dispatch,
}: ContributionOverrideControlProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(Math.round(currentContribution)));

  function handleStartEdit() {
    setDraft(String(Math.round(currentContribution)));
    setEditing(true);
  }

  function handleConfirm() {
    const parsed = Number(draft);
    if (Number.isFinite(parsed) && parsed >= 0) {
      dispatch({
        type: "SET_MONTHLY_CONTRIBUTION",
        payload: Math.round(parsed),
      });
    }
    setEditing(false);
  }

  function handleReset() {
    dispatch({ type: "SET_MONTHLY_CONTRIBUTION", payload: null });
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500">Ahorro mensual</p>
        {editing ? (
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              aria-label="Aportación mensual personalizada"
              min={0}
              max={10000}
              step={10}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirm();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-28 rounded border border-gray-300 px-2 py-1 text-sm tabular-nums focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEdit}
            className="mt-1 text-left hover:underline"
          >
            <CurrencyDisplay
              amount={currentContribution}
              className="text-lg font-bold text-gray-900"
            />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
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
            onClick={handleReset}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Modo auto
          </button>
        )}
      </div>
    </div>
  );
}
