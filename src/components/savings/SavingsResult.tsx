import type { SavingsResult as SavingsResultType } from "../../engine/savings/types.ts";
import { CurrencyDisplay } from "../shared/CurrencyDisplay.tsx";
import { formatPercent } from "../../utils/format.ts";

interface SavingsResultProps {
  readonly savings: SavingsResultType;
}

export function SavingsResult({ savings }: SavingsResultProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
        Cuanto necesitas ahorrar
      </h3>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">Ahorro mensual necesario</p>
          <CurrencyDisplay
            amount={savings.monthlyContribution}
            className="text-2xl font-extrabold text-gray-900"
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">Capital acumulado</p>
          <CurrencyDisplay
            amount={savings.portfolioAtRetirement}
            className="text-xl font-bold text-gray-900"
            suffix=""
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">Renta mensual adicional</p>
          <CurrencyDisplay
            amount={savings.monthlyIncomeFromPortfolio}
            className="text-xl font-bold text-green-700"
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">Rentabilidad esperada</p>
          <p className="text-xl font-bold text-gray-900 tabular-nums">
            {formatPercent(savings.weightedRealReturn)} real
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
        <span>
          {savings.yearsOfAccumulation} anos de ahorro
        </span>
        <span>
          Total aportado: {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(savings.totalContributed)}
        </span>
      </div>

      <p className="mt-3 text-xs text-gray-400 italic leading-relaxed">
        Estimacion basada en rentabilidad historica media. Los resultados reales
        pueden variar significativamente. Esto no constituye asesoramiento
        financiero.
      </p>
    </div>
  );
}
