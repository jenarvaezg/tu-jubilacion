// CCAA (Comunidades Autónomas) list
// Source: INE territorial codes
import type { CcaaInfo } from '../engine/types';

export const CCAA_LIST: readonly CcaaInfo[] = [
  { code: 'madrid', name: 'Comunidad de Madrid', shortName: 'Madrid' },
  { code: 'catalunya', name: 'Catalunya', shortName: 'Catalunya' },
  { code: 'andalucia', name: 'Andalucía', shortName: 'Andalucía' },
  { code: 'valencia', name: 'Comunitat Valenciana', shortName: 'Valencia' },
  { code: 'pais-vasco', name: 'País Vasco / Euskadi', shortName: 'País Vasco' },
  { code: 'other', name: 'Otra comunidad', shortName: 'Otra' },
] as const;
