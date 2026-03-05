import { useCallback, useEffect, useRef, useState } from "react";
import type { AppAction } from "../../state/types.ts";

interface ChartControlsProps {
  readonly displayMode: "real" | "nominal";
  readonly ipcRate: number;
  readonly greeceHaircutRate: number;
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
  greeceHaircutRate,
  notionalGrowthScenario,
  dispatch,
}: ChartControlsProps) {
  const [showHint, setShowHint] = useState(false);
  const hintTimeoutRef = useRef<number | null>(null);
  const exampleNominal = 2500;
  const yearsAhead = 30;
  const targetYear = 2025 + yearsAhead;
  const exampleReal = Math.round(
    exampleNominal / Math.pow(1 + ipcRate, yearsAhead),
  );
  const ipcPct = (ipcRate * 100).toFixed(1).replace(".", ",");
  const haircutPct = Math.round(greeceHaircutRate * 100);

  const triggerHint = useCallback(() => {
    if (hintTimeoutRef.current !== null) {
      window.clearTimeout(hintTimeoutRef.current);
    }
    setShowHint(true);
    hintTimeoutRef.current = window.setTimeout(() => setShowHint(false), 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current !== null) {
        window.clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

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
                {
                  triggerHint();
                  dispatch({ type: "SET_DISPLAY_MODE", payload: "real" });
                }
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
                {
                  triggerHint();
                  dispatch({ type: "SET_DISPLAY_MODE", payload: "nominal" });
                }
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
              {
                triggerHint();
                dispatch({
                  type: "SET_IPC_RATE",
                  payload: Number(e.target.value),
                });
              }
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

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="notional-scenario-select" className="text-sm font-medium text-gray-700">
            Nocional FEDEA:
          </label>
          <select
            id="notional-scenario-select"
            value={notionalGrowthScenario}
            onChange={(e) =>
              dispatch({
                type: "SET_NOTIONAL_SCENARIO",
                payload:
                  e.target.value === "ageing-report" ? "ageing-report" : "historic",
              })
            }
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="historic">Historico (PIB real 2,24%)</option>
            <option value="ageing-report">Ageing Report (PIB real 1,23%)</option>
          </select>
        </div>

        <div className="min-w-56 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="haircut-slider" className="text-sm font-medium text-gray-700">
              Recorte tipo Grecia
            </label>
            <span className="text-xs font-semibold text-danger">-{haircutPct}%</span>
          </div>
          <input
            id="haircut-slider"
            type="range"
            min={0.1}
            max={0.5}
            step={0.01}
            value={greeceHaircutRate}
            onChange={(e) =>
              dispatch({
                type: "SET_GREECE_HAIRCUT",
                payload: Number(e.target.value),
              })
            }
            className="w-full accent-danger"
          />
        </div>
      </div>

      {showHint && (
        <p
          role="status"
          className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800"
        >
          {exampleNominal.toLocaleString("es-ES")} EUR/mes en {targetYear} con IPC del{" "}
          {ipcPct}% equivalen a ~{exampleReal.toLocaleString("es-ES")} EUR de hoy.
        </p>
      )}
    </div>
  );
}
