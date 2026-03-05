import type { CcaaCode } from '../../engine/types.ts';
import { CCAA_LIST } from '../../data/ccaa.ts';

interface CcaaSelectProps {
  readonly value: CcaaCode;
  readonly onChange: (ccaa: CcaaCode) => void;
}

export function CcaaSelect({ value, onChange }: CcaaSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="ccaa-select" className="text-sm font-medium text-gray-700">
        Comunidad Autonoma
      </label>
      <select
        id="ccaa-select"
        value={value}
        onChange={(e) => onChange(e.target.value as CcaaCode)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white
          focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
          transition-colors"
      >
        {CCAA_LIST.map((ccaa) => (
          <option key={ccaa.code} value={ccaa.code}>
            {ccaa.shortName}
          </option>
        ))}
      </select>
    </div>
  );
}
