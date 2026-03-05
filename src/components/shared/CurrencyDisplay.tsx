import { formatCurrency } from '../../utils/format.ts';

interface CurrencyDisplayProps {
  readonly amount: number;
  readonly className?: string;
  readonly suffix?: string;
}

export function CurrencyDisplay({ amount, className = '', suffix = '/mes' }: CurrencyDisplayProps) {
  return (
    <span className={`font-semibold tabular-nums ${className}`}>
      {formatCurrency(amount)}{suffix ? <span className="text-gray-500 font-normal text-sm ml-1">{suffix}</span> : null}
    </span>
  );
}
