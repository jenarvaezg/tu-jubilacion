import { useState, useCallback, useRef, useEffect } from "react";
import { Toggle } from "../shared/Toggle.tsx";
import { monthlyToAnnualGross } from "../../engine/salary.ts";

const MAX_NET_MONTHLY = 50000;
const MAX_GROSS_ANNUAL = 700000;

function formatInputAmount(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

interface SalaryInputProps {
  readonly salary: number;
  readonly salaryType: "net" | "gross";
  readonly pagasExtra: boolean;
  readonly onSalaryChange: (salary: number) => void;
  readonly onSalaryTypeChange: (type: "net" | "gross") => void;
  readonly onPagasExtraChange: (pagasExtra: boolean) => void;
}

export function SalaryInput({
  salary,
  salaryType,
  pagasExtra,
  onSalaryChange,
  onSalaryTypeChange,
  onPagasExtraChange,
}: SalaryInputProps) {
  const isGrossAnnual = salaryType === "gross";
  const displayAmount = isGrossAnnual
    ? monthlyToAnnualGross(salary, pagasExtra)
    : salary;
  const [localValue, setLocalValue] = useState(
    formatInputAmount(displayAmount),
  );
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(formatInputAmount(displayAmount));
  }, [displayAmount]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setLocalValue(raw);

      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const parsed = parseFloat(raw);
        if (isNaN(parsed) || parsed < 0) {
          setError("Introduce un importe válido");
          return;
        }
        if (parsed > (isGrossAnnual ? MAX_GROSS_ANNUAL : MAX_NET_MONTHLY)) {
          setError(
            isGrossAnnual
              ? "El importe máximo es 700.000 euros brutos al año"
              : "El importe máximo es 50.000 euros netos al mes",
          );
          return;
        }
        setError(null);
        onSalaryChange(
          isGrossAnnual ? parsed / (pagasExtra ? 14 : 12) : parsed,
        );
      }, 300);
    },
    [isGrossAnnual, onSalaryChange, pagasExtra],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="salary-input"
          className="text-sm font-medium text-gray-700"
        >
          {isGrossAnnual ? "Salario bruto anual" : "Ingreso neto al mes"}
        </label>
        <p className="text-xs leading-relaxed text-gray-500">
          {isGrossAnnual
            ? "Introduce el bruto total del año. La app estima el neto equivalente para comparar tu nivel de vida."
            : "Introduce lo que realmente te entra por paga. Debajo eliges si cobras en 12 o en 14 pagas."}
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="salary-input"
              type="number"
              inputMode="decimal"
              min={0}
              max={isGrossAnnual ? MAX_GROSS_ANNUAL : MAX_NET_MONTHLY}
              value={localValue}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm
                focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
                transition-colors"
              placeholder={isGrossAnnual ? "42000" : "2000"}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              EUR
            </span>
          </div>
        </div>
        {error !== null && (
          <span className="text-xs text-danger" role="alert">
            {error}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Tipo de salario</legend>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="salary-type"
              value="net"
              checked={salaryType === "net"}
              onChange={() => onSalaryTypeChange("net")}
              className="accent-primary"
            />
            <span className="text-sm text-gray-700">Neto / mes</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="salary-type"
              value="gross"
              checked={salaryType === "gross"}
              onChange={() => onSalaryTypeChange("gross")}
              className="accent-primary"
            />
            <span className="text-sm text-gray-700">Bruto / año</span>
          </label>
        </fieldset>
      </div>

      {salaryType === "net" ? (
        <Toggle
          id="pagas-extra-toggle"
          label="Pagas al año"
          checked={pagasExtra}
          onChange={onPagasExtraChange}
          labelOn="14"
          labelOff="12"
        />
      ) : (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-800">
          En bruto anual no hace falta elegir 12 o 14 pagas: el total anual ya
          queda normalizado para el cálculo.
        </div>
      )}
    </div>
  );
}
