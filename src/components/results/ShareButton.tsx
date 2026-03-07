import type { ScenarioResult } from "../../engine/types.ts";
import { useShare } from "../../hooks/use-share.ts";
import { formatCurrency } from "../../utils/format.ts";
import { getRetirementMonthlyPensionReal } from "../../engine/scenario-utils.ts";

interface ShareButtonProps {
  readonly getShareUrl: () => string;
  readonly results?: readonly ScenarioResult[];
}

function buildShareText(
  results: readonly ScenarioResult[],
  url: string,
): string {
  const currentLaw = results.find((r) => r.scenarioId === "current-law");
  const reformResults = results.filter((r) => r.scenarioId !== "current-law");
  const floorResult = reformResults.reduce<ScenarioResult | null>(
    (lowest, candidate) => {
      if (lowest === null) return candidate;
      return getRetirementMonthlyPensionReal(candidate) <
        getRetirementMonthlyPensionReal(lowest)
        ? candidate
        : lowest;
    },
    null,
  );

  const lines: string[] = [];

  if (currentLaw && floorResult) {
    lines.push(
      `Mi ingreso público de jubilación se mueve entre ${formatCurrency(getRetirementMonthlyPensionReal(floorResult))} y ${formatCurrency(getRetirementMonthlyPensionReal(currentLaw))}/mes según como se reforme el sistema.`,
    );
    lines.push(
      "La clave no es acertar la reforma exacta, sino planificar ahorro para mantener tu nivel de vida durante toda la jubilación.",
    );
  }
  lines.push(`Descubre cuanto cobraras tu -> ${url}`);

  return lines.join("\n");
}

export function ShareButton({ getShareUrl, results }: ShareButtonProps) {
  const { copied, copyUrl } = useShare();

  const handleClick = async () => {
    const url = getShareUrl();
    const text =
      results && results.length > 0 ? buildShareText(results, url) : url;
    await copyUrl(text);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        group relative inline-flex items-center justify-center gap-3 border-2 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300
        ${
          copied
            ? "border-success bg-success text-paper"
            : "border-ink bg-ink text-paper hover:bg-transparent hover:text-ink"
        }
      `}
    >
      {copied ? (
        <>
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Enlace Copiado
        </>
      ) : (
        <>
          <svg
            className="h-3 w-3 transition-transform group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Exportar Plan
        </>
      )}
    </button>
  );
}
