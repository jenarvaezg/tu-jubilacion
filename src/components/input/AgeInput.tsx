import { useState, useCallback, useRef, useEffect } from 'react';

interface AgeInputProps {
  readonly value: number;
  readonly onChange: (age: number) => void;
}

export function AgeInput({ value, onChange }: AgeInputProps) {
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
        if (isNaN(parsed)) {
          setError('Introduce un numero valido');
          return;
        }
        if (parsed < 18) {
          setError('La edad minima es 18 anos');
          return;
        }
        if (parsed > 66) {
          setError('La edad maxima es 66 anos');
          return;
        }
        setError(null);
        onChange(parsed);
      }, 300);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="age-input" className="text-sm font-medium text-gray-700">
        Edad actual
      </label>
      <input
        id="age-input"
        type="number"
        inputMode="numeric"
        min={18}
        max={66}
        value={localValue}
        onChange={handleChange}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm
          focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
          transition-colors"
        placeholder="35"
      />
      {error !== null && (
        <span className="text-xs text-danger" role="alert">{error}</span>
      )}
    </div>
  );
}
