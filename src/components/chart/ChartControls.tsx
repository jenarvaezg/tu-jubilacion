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
    <div className="flex flex-col gap-4">
      {displayMode === "nominal" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
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
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Atención: Ilusión monetaria
              </h3>
              <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                Estás viendo euros nominales. Debido a la inflación ({ipcPct}%),
                el dinero valdrá mucho menos en el futuro.
                <span className="font-bold">
                  {" "}
                  {exampleNominal.toLocaleString("es-ES")}€
                </span>{" "}
                en {targetYear} equivaldrán a solo
                <span className="font-bold underline decoration-amber-500/50">
                  {" "}
                  ~{exampleReal.toLocaleString("es-ES")}€
                </span>{" "}
                de hoy.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Ver en:
            </span>
            <div className="flex overflow-hidden rounded-lg border border-gray-200 p-1 bg-gray-50">
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "SET_DISPLAY_MODE", payload: "nominal" })
                }
                className={`px-4 py-1.5 text-xs font-bold transition-all rounded-md ${
                  displayMode === "nominal"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Nominal (Futuro)
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "SET_DISPLAY_MODE", payload: "real" })
                }
                className={`px-4 py-1.5 text-xs font-bold transition-all rounded-md ${
                  displayMode === "real"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Real (Hoy)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="ipc-select"
              className="text-xs font-bold text-gray-700 uppercase tracking-wider"
            >
              Inflación (IPC):
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
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              {IPC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <label
              htmlFor="notional-scenario-select"
              className="text-xs font-bold text-gray-700 uppercase tracking-wider"
            >
              Variante nocional:
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
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="historic">Histórico (PIB +2,2%)</option>
              <option value="ageing-report">Ageing Report (+1,2%)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
