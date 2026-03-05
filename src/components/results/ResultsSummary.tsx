import type { ScenarioResult } from '../../engine/types.ts';
import { ScenarioCard } from './ScenarioCard.tsx';
import { CurrencyDisplay } from '../shared/CurrencyDisplay.tsx';
import { formatPercent } from '../../utils/format.ts';

interface ResultsSummaryProps {
  readonly results: readonly ScenarioResult[];
  readonly showDetail: boolean;
}

export function ResultsSummary({ results, showDetail }: ResultsSummaryProps) {
  if (results.length === 0) return null;

  const baselineResult = results.find((r) => r.scenarioId === 'current-law');
  const notionalResult = results.find((r) => r.scenarioId === 'notional-accounts');
  
  const baselinePension = baselineResult?.monthlyPension ?? 0;
  const notionalPension = notionalResult?.monthlyPension ?? 0;
  const lossAmount = baselinePension - notionalPension;
  const lossPercent = baselinePension > 0 ? (lossAmount / baselinePension) : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Shock Section */}
      <div className="overflow-hidden rounded-2xl bg-gray-900 text-white shadow-xl">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Tu Realidad Económica</h2>
            <p className="mt-4 text-3xl font-extrabold leading-tight">
              Bajo cuentas nocionales (modelo Suecia/FEDEA), cobrarás un <span className="text-red-500">{formatPercent(lossPercent)} menos</span> de pensión.
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">Sistema Actual</p>
                <CurrencyDisplay amount={baselinePension} className="text-2xl font-bold" />
              </div>
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-red-400 uppercase tracking-tighter">Pensión "Real" Probable</p>
                <CurrencyDisplay amount={notionalPension} className="text-2xl font-extrabold text-red-500" />
              </div>
            </div>
          </div>
          <div className="bg-red-950/30 p-8 md:w-64 flex flex-col justify-center border-l border-white/5">
            <p className="text-xs font-bold uppercase text-red-400">Pérdida mensual</p>
            <CurrencyDisplay amount={lossAmount} className="mt-1 text-3xl font-black text-white" />
            <p className="mt-2 text-xs text-gray-400 leading-relaxed italic">
              "Esta es la brecha que el Estado no podrá cubrir. Tu ahorro privado es la única solución."
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">Análisis Multi-Escenario</h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Comparativa de Reformas</span>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <ScenarioCard
              key={result.scenarioId}
              result={result}
              baselinePension={baselinePension}
              showDetail={showDetail}
            />
          ))}
        </div>
      </div>

      {/* Editorial Blurb */}
      <div className="rounded-xl border-l-4 border-gray-900 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-gray-900 uppercase tracking-widest text-[10px] mb-2">Tesis Editorial</p>
        <p className="text-gray-700 leading-relaxed italic">
          El sistema actual es insostenible. Con un Factor de Equidad Actuarial de 1,62, los españoles reciben un 62% más de lo que aportan. 
          Cualquier reforma realista (como las cuentas nocionales que propone FEDEA) ajustará la pensión a tu contribución real. 
          <span className="font-bold"> La diferencia entre la línea azul y la roja es el riesgo que estás asumiendo hoy al no invertir.</span>
        </p>
      </div>
    </div>
  );
}
