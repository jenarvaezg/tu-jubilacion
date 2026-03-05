export function SavingsEducation() {
  return (
    <div className="rounded-xl border-l-4 border-emerald-700 bg-white p-6 shadow-sm">
      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2">
        El objetivo no es acertar la reforma
      </p>
      <p className="text-gray-700 leading-relaxed">
        El objetivo es sostener ingresos durante toda la jubilacion. Incluso
        con volatilidad, la probabilidad de acumular mas patrimonio con fondos
        indexados globales que con depositos a 20+ anos es de aproximadamente{" "}
        <span className="font-bold">~95%</span>. Pequenas diferencias de
        rentabilidad se convierten en grandes diferencias de renta futura.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs font-bold text-green-800">Renta variable</p>
          <p className="text-lg font-extrabold text-green-700">~5% real</p>
          <p className="text-[10px] text-green-600">
            MSCI World, historico 1970-2024
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs font-bold text-blue-800">Renta fija</p>
          <p className="text-lg font-extrabold text-blue-700">~1% real</p>
          <p className="text-[10px] text-blue-600">
            Bonos gobierno, media historica
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-bold text-gray-700">Depositos</p>
          <p className="text-lg font-extrabold text-gray-600">~0% real</p>
          <p className="text-[10px] text-gray-500">
            Tras inflacion, no creces
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-400 italic">
        Fuentes: Damodaran (S&P 500 1928-2024), MSCI World (~1970+), BCE.
        Rentabilidades pasadas no garantizan resultados futuros. Esto no
        constituye asesoramiento financiero ni sustituye un plan personalizado.
      </p>
    </div>
  );
}
