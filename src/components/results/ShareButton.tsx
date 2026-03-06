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
      `Mi ingreso publico de jubilacion se mueve entre ${formatCurrency(getRetirementMonthlyPensionReal(floorResult))} y ${formatCurrency(getRetirementMonthlyPensionReal(currentLaw))}/mes segun como se reforme el sistema.`,
    );
    lines.push(
      "La clave no es acertar la reforma exacta, sino planificar ahorro para mantener tu nivel de vida durante toda la jubilacion.",
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
        inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
        transition-colors duration-200
        ${
          copied
            ? "bg-success text-white"
            : "bg-primary text-white hover:bg-primary-dark"
        }
      `}
    >
      {copied ? (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          URL copiada
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Compartir plan
        </>
      )}
    </button>
  );
}
