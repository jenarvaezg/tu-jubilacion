import type { DisabilityLevel, PersonalSituations } from "../../engine/types.ts";
import { Collapsible } from "../shared/Collapsible.tsx";

interface SpecialSituationsInputProps {
  readonly value: PersonalSituations;
  readonly onChildrenCountChange: (value: number) => void;
  readonly onDisabilityLevelChange: (value: DisabilityLevel) => void;
  readonly onHazardousJobChange: (value: boolean) => void;
  readonly onInvoluntaryEarlyRetirementChange: (value: boolean) => void;
  readonly onForeignContributionYearsChange: (value: number) => void;
}

export function SpecialSituationsInput({
  value,
  onChildrenCountChange,
  onDisabilityLevelChange,
  onHazardousJobChange,
  onInvoluntaryEarlyRetirementChange,
  onForeignContributionYearsChange,
}: SpecialSituationsInputProps) {
  return (
    <Collapsible title="Situaciones personales (beta)">
      <div className="flex flex-col gap-3 text-sm">
        <p className="text-xs text-gray-500">
          Ajustes simplificados para aproximar casos especiales (hijos,
          discapacidad, trabajos con coeficientes reductores y cotizacion en
          extranjero).
        </p>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-gray-700">Numero de hijos</span>
          <input
            type="number"
            min={0}
            max={4}
            value={value.childrenCount}
            onChange={(e) => onChildrenCountChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-gray-700">Discapacidad reconocida</span>
          <select
            value={value.disabilityLevel}
            onChange={(e) =>
              onDisabilityLevelChange(e.target.value as DisabilityLevel)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="none">No</option>
            <option value="33">Si (33% o mas)</option>
            <option value="65">Si (65% o mas)</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={value.hazardousJob}
            onChange={(e) => onHazardousJobChange(e.target.checked)}
            className="accent-primary"
          />
          <span>He tenido trabajos con coeficientes reductores</span>
        </label>

        <label className="inline-flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={value.involuntaryEarlyRetirement}
            onChange={(e) =>
              onInvoluntaryEarlyRetirementChange(e.target.checked)
            }
            className="accent-primary"
          />
          <span>Jubilacion anticipada involuntaria</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-gray-700">
            Anos cotizados en el extranjero (reconocidos)
          </span>
          <input
            type="number"
            min={0}
            max={20}
            value={value.foreignContributionYears}
            onChange={(e) =>
              onForeignContributionYearsChange(Number(e.target.value))
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </label>
      </div>
    </Collapsible>
  );
}
