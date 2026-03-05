import type { ScenarioResult } from '../../engine/types.ts';
import { ScenarioCard } from './ScenarioCard.tsx';

interface ResultsSummaryProps {
  readonly results: readonly ScenarioResult[];
  readonly showDetail: boolean;
}

export function ResultsSummary({ results, showDetail }: ResultsSummaryProps) {
  if (results.length === 0) return null;

  const baselineResult = results.find((r) => r.scenarioId === 'current-law');
  const baselinePension = baselineResult?.monthlyPension ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-gray-900">Resultados por escenario</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
