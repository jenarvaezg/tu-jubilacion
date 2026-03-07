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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="salary-input"
          className="text-xs font-bold uppercase tracking-wider text-ink/70"
        >
          {isGrossAnnual ? "Salario bruto anual" : "Ingreso neto mensual"}
        </label>
        <p className="font-serif italic text-xs leading-relaxed text-ink-light/80">
          {isGrossAnnual
            ? "Introduce el bruto total del año. La app estima el neto equivalente."
            : "Lo que recibes mensualmente en tu cuenta bancaria."}
        </p>
        <div className="relative">
          <input
            id="salary-input"
            type="number"
            inputMode="decimal"
            min={0}
            max={isGrossAnnual ? MAX_GROSS_ANNUAL : MAX_NET_MONTHLY}
            value={localValue}
            onChange={handleChange}
            className="w-full rounded-none border-b-2 border-ink/10 bg-transparent px-0 py-2 font-mono text-xl
              focus:border-accent focus:outline-none transition-all placeholder:text-ink/10"
            placeholder={isGrossAnnual ? "42000" : "2000"}
          />
          <span className="absolute right-0 bottom-2 text-[10px] font-mono uppercase text-ink/40">
            EUR
          </span>
        </div>
        {error !== null && (
          <span className="text-[10px] font-mono uppercase text-danger mt-1" role="alert">
            {error}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <fieldset className="flex items-center gap-4">
          <legend className="sr-only">Tipo de salario</legend>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="salary-type"
              value="net"
              checked={salaryType === "net"}
              onChange={() => onSalaryTypeChange("net")}
              className="accent-accent w-3 h-3"
            />
            <span className={`text-[10px] uppercase tracking-widest transition-colors ${salaryType === 'net' ? 'font-bold text-ink' : 'text-ink/40 group-hover:text-ink/60'}`}>Neto</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="salary-type"
              value="gross"
              checked={salaryType === "gross"}
              onChange={() => onSalaryTypeChange("gross")}
              className="accent-accent w-3 h-3"
            />
            <span className={`text-[10px] uppercase tracking-widest transition-colors ${salaryType === 'gross' ? 'font-bold text-ink' : 'text-ink/40 group-hover:text-ink/60'}`}>Bruto</span>
          </label>
        </fieldset>
      </div>

      {salaryType === "net" ? (
        <div className="border-t border-ink/5 pt-4">
          <Toggle
            id="pagas-extra-toggle"
            label="Estructura de pagos"
            checked={pagasExtra}
            onChange={onPagasExtraChange}
            labelOn="14 Pagas"
            labelOff="12 Pagas"
          />
        </div>
      ) : (
        <div className="border border-dashed border-accent/20 bg-accent/5 px-4 py-3 text-[10px] uppercase tracking-wider leading-relaxed text-accent font-medium">
          En cómputo anual, las pagas extras se consideran ya prorrateadas.
        </div>
      )}
    </div>
  );
}
