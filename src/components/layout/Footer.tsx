import { Disclaimer } from '../shared/Disclaimer.tsx';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Disclaimer />
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              Datos SS/IRPF 2025 | Mortalidad INE 2023
            </span>
            <a
              href="https://documentos.fedea.net/pubs/eee/2025/eee2025-22.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Ref: Devesa, Domenech y Meneu (2025) - FEDEA
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
