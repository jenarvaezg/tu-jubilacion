// INE Life expectancy at age 65 projections (2024-2073)
// Source: INE - Proyecciones de población 2024-2073
// Used for: sustainability factor (Escenario 3) and dynamic actuarial factors
import type { LifeExpectancyProjection } from '../engine/types';

export const LIFE_EXPECTANCY_65: LifeExpectancyProjection = {
  dataVersion: {
    year: 2024,
    source: 'INE - Proyecciones de Población 2024-2073',
    accessDate: '2025-03-04',
  },
  atAge: 65,
  projections: [
    { year: 2024, lifeExpectancy: 21.68 },
    { year: 2025, lifeExpectancy: 21.78 },
    { year: 2026, lifeExpectancy: 21.88 },
    { year: 2027, lifeExpectancy: 21.98 },
    { year: 2028, lifeExpectancy: 22.07 },
    { year: 2029, lifeExpectancy: 22.16 },
    { year: 2030, lifeExpectancy: 22.25 },
    { year: 2031, lifeExpectancy: 22.34 },
    { year: 2032, lifeExpectancy: 22.43 },
    { year: 2033, lifeExpectancy: 22.51 },
    { year: 2034, lifeExpectancy: 22.59 },
    { year: 2035, lifeExpectancy: 22.67 },
    { year: 2036, lifeExpectancy: 22.75 },
    { year: 2037, lifeExpectancy: 22.83 },
    { year: 2038, lifeExpectancy: 22.90 },
    { year: 2039, lifeExpectancy: 22.97 },
    { year: 2040, lifeExpectancy: 23.04 },
    { year: 2041, lifeExpectancy: 23.11 },
    { year: 2042, lifeExpectancy: 23.18 },
    { year: 2043, lifeExpectancy: 23.25 },
    { year: 2044, lifeExpectancy: 23.31 },
    { year: 2045, lifeExpectancy: 23.37 },
    { year: 2046, lifeExpectancy: 23.43 },
    { year: 2047, lifeExpectancy: 23.49 },
    { year: 2048, lifeExpectancy: 23.55 },
    { year: 2049, lifeExpectancy: 23.61 },
    { year: 2050, lifeExpectancy: 23.67 },
    { year: 2055, lifeExpectancy: 23.95 },
    { year: 2060, lifeExpectancy: 24.21 },
    { year: 2065, lifeExpectancy: 24.45 },
    { year: 2070, lifeExpectancy: 24.67 },
    { year: 2073, lifeExpectancy: 24.80 },
  ],
} as const;

export function getLifeExpectancy65(year: number): number {
  const { projections } = LIFE_EXPECTANCY_65;
  if (year <= projections[0].year) return projections[0].lifeExpectancy;
  const last = projections[projections.length - 1];
  if (year >= last.year) return last.lifeExpectancy;

  // Linear interpolation between available years
  for (let i = 0; i < projections.length - 1; i++) {
    const curr = projections[i];
    const next = projections[i + 1];
    if (year >= curr.year && year <= next.year) {
      const ratio = (year - curr.year) / (next.year - curr.year);
      return curr.lifeExpectancy + ratio * (next.lifeExpectancy - curr.lifeExpectancy);
    }
  }
  return last.lifeExpectancy;
}
