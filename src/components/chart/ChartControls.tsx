import type { AppAction } from "../../state/types.ts";

interface ChartControlsProps {
  readonly displayMode: "real" | "nominal";
  readonly ipcRate: number;
  readonly notionalGrowthScenario: "historic" | "ageing-report";
  readonly dispatch: React.Dispatch<AppAction>;
}

const IPC_OPTIONS = [
  { value: 0.015, label: "1,5% (BCE optimista)" },
  { value: 0.02, label: "2,0% (objetivo BCE)" },
  { value: 0.025, label: "2,5% (historico Espana)" },
  { value: 0.03, label: "3,0% (elevado)" },
] as const;

export function ChartControls({
  displayMode,
  ipcRate,
  notionalGrowthScenario,
  dispatch,
}: ChartControlsProps) {
  const exampleNominal = 2000;
  const yearsAhead = 30;
  const targetYear = 2025 + yearsAhead;
  const exampleReal = Math.round(
    exampleNominal / Math.pow(1 + ipcRate, yearsAhead),
  );
  const ipcPct = (ipcRate * 100).toFixed(1).replace(".", ",");

  return (
    <div className="flex flex-col gap-6">
      {displayMode === "nominal" && (
        <div className="border border-accent/20 bg-accent/5 p-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-accent/30 text-accent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-accent uppercase tracking-wider">
                Advertencia: Ilusión Monetaria
              </h3>
              <p className="mt-1 font-serif italic text-sm text-accent leading-relaxed">
                Usted está visualizando euros nominales. Debido a la inflación estimada del {ipcPct}%,
                el poder adquisitivo se verá significativamente mermado: 
                <span className="font-mono font-bold"> {exampleNominal.toLocaleString("es-ES")}€</span> en {targetYear} equivaldrán a solo
                <span className="font-mono font-bold underline decoration-accent/30 ml-1"> ~{exampleReal.toLocaleString("es-ES")}€</span> de hoy.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-6 border border-paper-dark bg-white/40 p-6">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-ink/60 uppercase tracking-widest">
              Unidad de cuenta
            </span>
            <div className="flex">
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "SET_DISPLAY_MODE", payload: "nominal" })
                }
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  displayMode === "nominal"
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink/40 border-ink/10 hover:text-ink/60"
                }`}
              >
                Nominal (Futuro)
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "SET_DISPLAY_MODE", payload: "real" })
                }
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border -ml-[1px] transition-all ${
                  displayMode === "real"
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink/40 border-ink/10 hover:text-ink/60"
                }`}
              >
                Real (Hoy)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="ipc-select"
              className="text-[10px] font-bold text-ink/60 uppercase tracking-widest"
            >
              Inflación (IPC)
            </label>
            <select
              id="ipc-select"
              value={ipcRate}
              onChange={(e) =>
                dispatch({
                  type: "SET_IPC_RATE",
                  payload: Number(e.target.value),
                })
              }
              className="appearance-none rounded-none border-b border-ink/20 bg-transparent py-1 font-mono text-xs font-bold text-ink focus:border-accent focus:outline-none cursor-pointer"
            >
              {IPC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="notional-scenario-select"
            className="text-[10px] font-bold text-ink/60 uppercase tracking-widest"
          >
            Escenario Nocional
          </label>
          <select
            id="notional-scenario-select"
            value={notionalGrowthScenario}
            onChange={(e) =>
              dispatch({
                type: "SET_NOTIONAL_SCENARIO",
                payload:
                  e.target.value === "ageing-report"
                    ? "ageing-report"
                    : "historic",
              })
            }
            className="appearance-none rounded-none border-b border-ink/20 bg-transparent py-1 font-mono text-xs font-bold text-ink focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="historic">Histórico (PIB +2,2%)</option>
            <option value="ageing-report">Ageing Report (+1,2%)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
