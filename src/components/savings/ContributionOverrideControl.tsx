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
    <div className="border border-paper-dark bg-white p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">
            Capacidad de Ahorro Mensual
          </p>
          <p className="font-serif italic text-xs leading-relaxed text-ink-light/70">
            Aportación periódica destinada al fondo de jubilación. El modelo calcula el valor necesario por defecto.
          </p>
        </div>
        
        <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-paper-dark/10 pt-4 sm:pt-0 sm:pl-8">
          <div className="flex flex-col items-end gap-2">
            {editing ? (
              <div className="flex items-center gap-3">
                <div className="relative">
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
                    className="w-24 rounded-none border-b border-ink bg-transparent py-1 font-mono text-lg font-bold text-ink focus:outline-none"
                    autoFocus
                  />
                  
                </div>
                <div className="flex gap-1 ml-6">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="border border-ink bg-ink px-2 py-1 text-[9px] font-bold uppercase text-paper hover:bg-transparent hover:text-ink transition-all"
                  >
                    Set
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-2 py-1 text-[9px] font-bold uppercase text-ink/40 hover:text-ink transition-all"
                  >
                    Esc
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="group flex items-baseline gap-1 hover:opacity-70 transition-opacity"
              >
                <CurrencyDisplay
                  amount={currentContribution}
                  className="text-2xl font-mono font-bold text-ink tracking-tighter"
                  suffix=""
                />
                <span className="text-[10px] font-mono text-ink/40 uppercase">/mes</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 text-ink/20 group-hover:text-accent"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <span
              className={`border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${
                isOverride
                  ? "border-accent text-accent bg-accent/5"
                  : "border-success text-success bg-success/5"
              }`}
            >
              {isOverride ? "Manual" : "Auto"}
            </span>
            {isOverride && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[9px] font-mono font-bold uppercase tracking-widest text-ink/40 hover:text-ink underline underline-offset-4 decoration-ink/20 transition-all"
              >
                Restore
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
