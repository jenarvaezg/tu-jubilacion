export function Header() {
  return (
    <header className="border-b border-paper-dark bg-paper py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <h1 className="text-3xl font-serif font-bold text-ink tracking-tight sm:text-4xl">
              Tu Jubilación
            </h1>
            <p className="font-serif italic text-sm text-ink-light/80">
              Análisis prospectivo de ingresos y planificación financiera
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-light/60 border border-ink-light/20 px-3 py-1.5 rounded-sm">
              Modelado SS/IRPF 2025 | INE 2023
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
