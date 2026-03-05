import type { SavingsResult as SavingsResultType } from "../../engine/savings/types.ts";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";
import { formatCurrency, formatPercent } from "../../utils/format.ts";

interface SavingsResultProps {
  readonly savings: SavingsResultType;
}

export function SavingsResult({ savings }: SavingsResultProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
        Hoja de ruta de ahorro
      </h3>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500">Ahorro actual reservado</p>
          <CurrencyDisplay
            amount={savings.currentSavingsBalance}
            className="text-2xl font-extrabold text-gray-900"
            suffix=""
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">Aportacion mensual desde hoy</p>
          <CurrencyDisplay
            amount={savings.monthlyContribution}
            className="text-2xl font-extrabold text-gray-900"
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">Ahorro actual al jubilarte</p>
          <CurrencyDisplay
            amount={savings.currentSavingsAtRetirement}
            className="text-xl font-bold text-gray-900"
            suffix=""
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">Capital total estimado</p>
          <CurrencyDisplay
            amount={savings.portfolioAtRetirement}
            className="text-xl font-bold text-gray-900"
            suffix=""
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">Complemento mensual privado</p>
          <CurrencyDisplay
            amount={savings.monthlyIncomeFromPortfolio}
            className="text-xl font-bold text-green-700"
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">Rentabilidad esperada</p>
          <p className="text-xl font-bold tabular-nums text-gray-900">
            {formatPercent(savings.weightedRealReturn)} real
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
        <span>{savings.yearsOfAccumulation} anos de ahorro por delante</span>
        <span>Nuevas aportaciones: {formatCurrency(savings.totalContributed)}</span>
      </div>

      <p className="mt-3 text-xs italic leading-relaxed text-gray-400">
        El capital que ya tienes acumulado reduce la aportacion necesaria desde
        hoy. Estimacion basada en rentabilidad historica media; los resultados
        reales pueden variar significativamente.
      </p>
    </div>
  );
}
