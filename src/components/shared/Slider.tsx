import { useCallback, useRef } from 'react';

interface SliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (value: number) => void;
  readonly formatValue?: (value: number) => string;
  readonly id: string;
}

export function Slider({ label, value, min, max, step, onChange, formatValue, id }: SliderProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, 300);
    },
    [onChange],
  );

  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-ink/70">
          {label}
        </label>
        <span className="font-mono font-bold text-accent text-lg">{displayValue}</span>
      </div>
      <div className="relative flex items-center h-6">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          defaultValue={value}
          onChange={handleChange}
          className="w-full accent-accent bg-ink/10 h-1 rounded-none appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
