import { useState } from 'react';

const STORAGE_KEY = 'tj-welcome-dismissed';

export function WelcomeBanner() {
  const hasParams = typeof window !== 'undefined' && window.location.search.length > 1;
  const wasDismissed = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
  const [dismissed, setDismissed] = useState(wasDismissed || hasParams);

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
      <h2 className="text-lg font-bold text-blue-900">Descubre cuánto podrías cobrar de pensión</h2>
      <p className="mt-2 text-sm leading-relaxed text-blue-800">
        Introduce tu edad y salario para ver proyecciones bajo 6 escenarios de reforma.
        Herramienta educativa basada en datos de la Seguridad Social.
      </p>
      <button
        onClick={handleDismiss}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Entendido
      </button>
    </div>
  );
}
