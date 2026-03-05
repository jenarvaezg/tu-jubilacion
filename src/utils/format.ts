const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const euroDecimalFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatCurrency(amount: number): string {
  return euroFormatter.format(amount);
}

export function formatCurrencyDecimal(amount: number): string {
  return euroDecimalFormatter.format(amount);
}

export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio);
}
