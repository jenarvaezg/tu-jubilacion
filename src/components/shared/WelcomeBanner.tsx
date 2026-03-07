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
    <div className="border border-paper-dark bg-white p-8 mb-4">
      <h2 className="text-2xl font-serif font-bold text-ink">
        Análisis de Sostenibilidad de la Pensión Pública
      </h2>
      <p className="mt-3 font-serif italic text-base leading-relaxed text-ink-light/90">
        Utilice esta herramienta interactiva para proyectar sus ingresos de jubilación bajo distintos escenarios de reforma del sistema. El cálculo se fundamenta en la legislación vigente y las principales propuestas técnicas de sostenibilidad.
      </p>
      <button
        onClick={handleDismiss}
        className="mt-6 border-2 border-ink bg-ink px-6 py-2 text-xs font-bold uppercase tracking-widest text-paper hover:bg-transparent hover:text-ink transition-all"
      >
        Iniciar simulación
      </button>
    </div>
  );
}
