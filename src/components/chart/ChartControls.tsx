import type { AppAction } from "../../state/types.ts";

interface ChartControlsProps {
  readonly displayMode: "real" | "nominal";
  readonly ipcRate: number;
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
  dispatch,
}: ChartControlsProps) {
  const exampleNominal = 2500;
  const yearsAhead = 30;
  const exampleReal = Math.round(
    exampleNominal / Math.pow(1 + ipcRate, yearsAhead),
  );
  const ipcPct = (ipcRate * 100).toFixed(1).replace(".", ",");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Mostrar en:
          </span>
          <div className="flex overflow-hidden rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_DISPLAY_MODE", payload: "real" })
              }
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                displayMode === "real"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Euros reales
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_DISPLAY_MODE", payload: "nominal" })
              }
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                displayMode === "nominal"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Euros nominales
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="ipc-select"
            className="text-sm font-medium text-gray-700"
          >
            IPC:
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
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {IPC_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        {exampleNominal.toLocaleString("es-ES")} EUR/mes en 2055 con IPC del{" "}
        {ipcPct}% equivalen a ~{exampleReal.toLocaleString("es-ES")} EUR de hoy
      </p>
    </div>
  );
}
