import { useEffect, useState } from "react";
import type { AppAction } from "../../state/types.ts";

interface CurrentSavingsBalanceControlProps {
  readonly currentSavingsBalance: number;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function CurrentSavingsBalanceControl({
  currentSavingsBalance,
  dispatch,
}: CurrentSavingsBalanceControlProps) {
  const [draft, setDraft] = useState(String(currentSavingsBalance));

  useEffect(() => {
    setDraft(String(currentSavingsBalance));
  }, [currentSavingsBalance]);

  function commitDraft() {
    const trimmed = draft.trim();
    const parsed = trimmed === "" ? 0 : Number(trimmed);
    const normalized = Number.isFinite(parsed)
      ? Math.max(0, Math.round(parsed))
      : 0;
    dispatch({
      type: "SET_CURRENT_SAVINGS_BALANCE",
      payload: normalized,
    });
    setDraft(String(normalized));
  }

  return (
    <div className="border border-paper-dark bg-white p-6">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="current-savings-balance" className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1 block">
            Capital Reservado Actual
          </label>
          <p className="font-serif italic text-xs leading-relaxed text-ink-light/70">
            Ahorro específico ya acumulado para la jubilación. Se proyectará hasta su fecha de retiro.
          </p>
        </div>
        <div className="flex items-center gap-4 border-t border-paper-dark/10 pt-4">
          <div className="relative flex-1">
            <input
              id="current-savings-balance"
              type="number"
              inputMode="numeric"
              min={0}
              max={10000000}
              step={1000}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commitDraft}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitDraft();
                }
                if (event.key === "Escape") {
                  setDraft(String(currentSavingsBalance));
                }
              }}
              className="w-full rounded-none border-b border-ink/10 bg-transparent py-1 font-mono text-xl font-bold text-ink focus:border-accent focus:outline-none transition-all"
            />
            <span className="absolute right-0 bottom-1.5 text-[10px] font-mono uppercase text-ink/40">
              EUR
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
