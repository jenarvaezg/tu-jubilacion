import type { SavingsResult as SavingsResultType } from "../../engine/savings/types.ts";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";
import { formatCurrency, formatPercent } from "../../utils/format.ts";

interface SavingsResultProps {
  readonly savings: SavingsResultType;
}

export function SavingsResult({ savings }: SavingsResultProps) {
  return (
    <div className="border border-paper-dark bg-white p-8 sm:p-10">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40 mb-8 border-b border-paper-dark pb-4">
        Hoja de Ruta de Capitalización
      </h3>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Base Inicial Reservada</p>
          <div className="flex items-baseline gap-1">
            <CurrencyDisplay
              amount={savings.currentSavingsBalance}
              className="text-3xl font-mono font-bold text-ink tracking-tighter"
              suffix=""
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">Esfuerzo Mensual Requerido</p>
          <div className="flex items-baseline gap-1">
            <CurrencyDisplay
              amount={savings.monthlyContribution}
              className="text-3xl font-mono font-bold text-ink tracking-tighter"
              suffix=""
            />
            <span className="text-[10px] font-mono text-ink/40 uppercase">/mes</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Capital Proyectado al Retiro</p>
          <div className="flex items-baseline gap-1 text-ink/60">
            <CurrencyDisplay
              amount={savings.portfolioAtRetirement}
              className="text-2xl font-mono font-bold tracking-tighter"
              suffix=""
            />
            <span className="text-[10px] font-mono uppercase">EUR</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-success">Complemento Mensual Privado</p>
          <div className="flex items-baseline gap-1">
            <CurrencyDisplay
              amount={savings.monthlyIncomeFromPortfolio}
              className="text-3xl font-mono font-bold text-success tracking-tighter"
              suffix=""
            />
            <span className="text-[10px] font-mono text-success/40 uppercase">/mes</span>
          </div>
        </div>


        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Horizonte de Aportación</p>
          <div className="flex items-baseline gap-1 text-ink/60">
            <span className="text-xl font-mono font-bold tracking-tighter">{savings.yearsOfAccumulation}</span>
            <span className="text-[10px] font-mono uppercase">Años</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Rentabilidad Objetivo</p>
          <p className="text-xl font-mono font-bold tabular-nums text-ink/60 tracking-tighter">
            {formatPercent(savings.weightedRealReturn)} <span className="text-[10px] font-mono uppercase font-normal ml-1">Real</span>
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-paper-dark pt-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-6 text-[10px] font-mono font-bold uppercase tracking-widest text-ink/40">
          <span>Inversión total acumulada: {formatCurrency(savings.totalContributed)}</span>
        </div>

        <p className="font-serif italic text-xs leading-relaxed text-ink-light/60 max-w-3xl">
          * Estimación basada en rentabilidad histórica media neta de inflación. El capital reservado reduce linealmente el esfuerzo mensual necesario. Los resultados reales dependerán de la secuencia de retornos del mercado y de la disciplina en las aportaciones.
        </p>
      </div>
    </div>
  );
}
