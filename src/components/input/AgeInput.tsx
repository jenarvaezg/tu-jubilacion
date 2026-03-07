import { useState, useCallback, useRef, useEffect } from "react";

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
          setError("Introduce un número válido");
          return;
        }
        if (parsed < 18) {
          setError("La edad mínima es 18 años");
          return;
        }
        if (parsed > 66) {
          setError("La edad máxima es 66 años");
          return;
        }
        setError(null);
        onChange(parsed);
      }, 300);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="age-input" className="text-xs font-bold uppercase tracking-wider text-ink/70">
        Edad actual
      </label>
      <div className="relative">
        <input
          id="age-input"
          type="number"
          inputMode="numeric"
          min={18}
          max={66}
          value={localValue}
          onChange={handleChange}
          className="w-full rounded-none border-b-2 border-ink/10 bg-transparent px-0 py-2 font-mono text-xl
            focus:border-accent focus:outline-none transition-all placeholder:text-ink/10"
          placeholder="35"
        />
        <span className="absolute right-0 bottom-2 text-[10px] font-mono uppercase text-ink/40">
          Años
        </span>
      </div>
      {error !== null && (
        <span className="text-[10px] font-mono uppercase text-danger mt-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
