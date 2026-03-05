interface DetailToggleProps {
  readonly showDetail: boolean;
  readonly onToggle: () => void;
}

export function DetailToggle({ showDetail, onToggle }: DetailToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
    >
      <svg
        className={`h-4 w-4 transition-transform duration-200 ${showDetail ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      {showDetail ? 'Ver simple' : 'Ver detalle'}
    </button>
  );
}
