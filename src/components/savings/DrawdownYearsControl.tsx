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
    <div className="border border-paper-dark bg-white p-6 h-full flex flex-col justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">
          Horizonte de Complemento Privado
        </p>
        <p className="font-serif italic text-xs leading-relaxed text-ink-light/70">
          Aproximación del periodo durante el cual su cartera privada cubrirá la brecha de ingresos.
        </p>
      </div>

      <div className="mt-6 border-t border-paper-dark/10 pt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-ink tracking-tighter">
              {drawdownYears}
            </span>
            <span className="text-[10px] font-mono text-ink/40 uppercase">Años</span>
          </div>
          <div className="flex items-center gap-2">
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
                onClick={() =>
                  dispatch({ type: "SET_DRAWDOWN_YEARS", payload: null })
                }
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink/40 hover:text-ink underline underline-offset-4 decoration-ink/20 transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        
        <input
          type="range"
          aria-label="Durante cuántos años quieres complementar tus ingresos"
          min={5}
          max={40}
          step={1}
          value={drawdownYears}
          onChange={(event) =>
            dispatch({
              type: "SET_DRAWDOWN_YEARS",
              payload: Number(event.target.value),
            })
          }
          className="w-full accent-accent bg-ink/10 h-1 rounded-none appearance-none cursor-pointer"
        />
        
        {isOverride && (
          <p className="font-mono text-[9px] uppercase tracking-widest text-ink/30">
            Estimación por esperanza de vida: {derivedDefault} años
          </p>
        )}
      </div>
    </div>
  );
}
