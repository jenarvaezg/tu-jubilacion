export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
              TJ
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Tu Jubilación
              </h1>
              <p className="text-xs text-gray-500">
                Planifica tus ingresos de jubilación
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            Datos SS/IRPF 2025 | Mortalidad INE 2023
          </span>
        </div>
      </div>
    </header>
  );
}
