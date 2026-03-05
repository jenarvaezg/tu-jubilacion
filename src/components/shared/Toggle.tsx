interface ToggleProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly id: string;
  readonly labelOn?: string;
  readonly labelOff?: string;
}

export function Toggle({ label, checked, onChange, id, labelOn = 'Si', labelOff = 'No' }: ToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
          ${checked ? 'bg-primary' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-flex h-7 w-7 items-center justify-center
            rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-8' : 'translate-x-0'}
          `}
        >
          <span className="text-xs font-medium text-gray-500">
            {checked ? labelOn : labelOff}
          </span>
        </span>
      </button>
    </div>
  );
}
