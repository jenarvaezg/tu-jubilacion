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
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60">{label}</span>
      <div className="flex" id={id}>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`
            flex-1 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all
            ${!checked 
              ? 'bg-ink text-paper border-ink shadow-sm' 
              : 'bg-transparent text-ink/40 border-ink/10 hover:text-ink/60'}
          `}
        >
          {labelOff}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`
            flex-1 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border -ml-[1px] transition-all
            ${checked 
              ? 'bg-ink text-paper border-ink shadow-sm' 
              : 'bg-transparent text-ink/40 border-ink/10 hover:text-ink/60'}
          `}
        >
          {labelOn}
        </button>
      </div>
    </div>
  );
}
