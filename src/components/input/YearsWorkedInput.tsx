import { useState, useCallback, useRef, useEffect } from "react";

interface YearsWorkedInputProps {
  readonly value: number;
  readonly age: number;
  readonly onChange: (years: number) => void;
}

export function YearsWorkedInput({
  value,
  age,
  onChange,
}: YearsWorkedInputProps) {
  const [localValue, setLocalValue] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setLocalValue(raw);

      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const parsed = parseInt(raw, 10);
        if (isNaN(parsed) || parsed < 0) {
          setError("Introduce un número válido");
          return;
        }
        if (parsed > 50) {
          setError("El máximo es 50 años");
          return;
        }
        setError(null);
        onChange(parsed);
      }, 300);
    },
    [onChange],
  );

  const placeholder = String(Math.max(0, age - 22));

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="years-worked-input"
        className="text-sm font-medium text-gray-700"
      >
        Años trabajados
      </label>
      <input
        id="years-worked-input"
        type="number"
        inputMode="numeric"
        min={0}
        max={50}
        value={localValue}
        onChange={handleChange}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm
          focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
          transition-colors"
        placeholder={placeholder}
      />
      {error !== null && (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      )}
      <span className="text-xs text-gray-500">
        Si no lo sabes, usamos {placeholder} (edad - 22)
      </span>
    </div>
  );
}
