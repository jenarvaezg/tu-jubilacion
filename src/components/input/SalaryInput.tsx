import { useState, useCallback, useRef, useEffect } from 'react';
import { Toggle } from '../shared/Toggle.tsx';

interface SalaryInputProps {
  readonly salary: number;
  readonly salaryType: 'net' | 'gross';
  readonly pagasExtra: boolean;
  readonly onSalaryChange: (salary: number) => void;
  readonly onSalaryTypeChange: (type: 'net' | 'gross') => void;
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
  const [localValue, setLocalValue] = useState(String(salary));
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(String(salary));
  }, [salary]);

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
          setError('Introduce un importe valido');
          return;
        }
        if (parsed > 50000) {
          setError('El importe maximo es 50.000 euros');
          return;
        }
        setError(null);
        onSalaryChange(parsed);
      }, 300);
    },
    [onSalaryChange],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="salary-input" className="text-sm font-medium text-gray-700">
          Sueldo mensual (lo que cobras cada mes)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="salary-input"
              type="number"
              inputMode="decimal"
              min={0}
              max={50000}
              value={localValue}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm
                focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
                transition-colors"
              placeholder="2000"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              EUR
            </span>
          </div>
        </div>
        {error !== null && (
          <span className="text-xs text-danger" role="alert">{error}</span>
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
              checked={salaryType === 'net'}
              onChange={() => onSalaryTypeChange('net')}
              className="accent-primary"
            />
            <span className="text-sm text-gray-700">Neto</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="salary-type"
              value="gross"
              checked={salaryType === 'gross'}
              onChange={() => onSalaryTypeChange('gross')}
              className="accent-primary"
            />
            <span className="text-sm text-gray-700">Bruto</span>
          </label>
        </fieldset>
      </div>

      <Toggle
        id="pagas-extra-toggle"
        label="Cobras pagas extra aparte?"
        checked={pagasExtra}
        onChange={onPagasExtraChange}
        labelOn="Si"
        labelOff="No"
      />
    </div>
  );
}
