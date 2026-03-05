import type { CcaaCode } from '../engine/types.ts';
import type { AppState } from './types.ts';
import { DEFAULT_STATE } from './defaults.ts';

// Compact URL param keys for minimal URL length
const PARAM_KEYS = {
  age: 'a',
  salary: 's',
  salaryType: 't',
  pagasExtra: 'px',
  ccaa: 'c',
  yearsWorked: 'y',
  retirementAge: 'r',
  displayMode: 'd',
  ipcRate: 'ipc',
  greeceHaircut: 'h',
  notionalScenario: 'ns',
  salaryGrowth: 'sg',
  showDetail: 'sd',
} as const;

const CCAA_SHORT: Record<CcaaCode, string> = {
  'madrid': 'mad',
  'catalunya': 'cat',
  'andalucia': 'and',
  'valencia': 'val',
  'pais-vasco': 'pvs',
  'other': 'oth',
};

const SHORT_TO_CCAA: Record<string, CcaaCode> = Object.fromEntries(
  Object.entries(CCAA_SHORT).map(([k, v]) => [v, k as CcaaCode])
) as Record<string, CcaaCode>;

const VALID_CCAA_CODES = new Set<string>(Object.keys(CCAA_SHORT));

function isValidCcaa(value: string): value is CcaaCode {
  return VALID_CCAA_CODES.has(value);
}

export function encodeStateToUrl(state: AppState): string {
  const params = new URLSearchParams();
  const { profile } = state.calculation;
  const defaults = DEFAULT_STATE;

  // Only encode values that differ from defaults
  if (profile.age !== defaults.calculation.profile.age) {
    params.set(PARAM_KEYS.age, String(profile.age));
  }
  if (profile.monthlySalary !== defaults.calculation.profile.monthlySalary) {
    params.set(PARAM_KEYS.salary, String(profile.monthlySalary));
  }
  if (profile.salaryType !== defaults.calculation.profile.salaryType) {
    params.set(PARAM_KEYS.salaryType, profile.salaryType === 'net' ? 'n' : 'g');
  }
  if (profile.pagasExtra !== defaults.calculation.profile.pagasExtra) {
    params.set(PARAM_KEYS.pagasExtra, profile.pagasExtra ? '1' : '0');
  }
  if (profile.ccaa !== defaults.calculation.profile.ccaa) {
    params.set(PARAM_KEYS.ccaa, CCAA_SHORT[profile.ccaa]);
  }
  if (profile.yearsWorked !== defaults.calculation.profile.yearsWorked) {
    params.set(PARAM_KEYS.yearsWorked, String(profile.yearsWorked));
  }
  if (profile.desiredRetirementAge !== defaults.calculation.profile.desiredRetirementAge) {
    params.set(PARAM_KEYS.retirementAge, String(profile.desiredRetirementAge));
  }
  if (state.display.displayMode !== defaults.display.displayMode) {
    params.set(PARAM_KEYS.displayMode, state.display.displayMode === 'real' ? 'r' : 'n');
  }
  if (state.calculation.ipcRate !== defaults.calculation.ipcRate) {
    params.set(PARAM_KEYS.ipcRate, String(state.calculation.ipcRate * 100));
  }
  if (state.calculation.greeceHaircutRate !== defaults.calculation.greeceHaircutRate) {
    params.set(PARAM_KEYS.greeceHaircut, String(state.calculation.greeceHaircutRate * 100));
  }
  if (state.calculation.notionalGrowthScenario !== defaults.calculation.notionalGrowthScenario) {
    params.set(PARAM_KEYS.notionalScenario, state.calculation.notionalGrowthScenario === 'historic' ? 'h' : 'a');
  }
  if (state.calculation.salaryGrowthRate !== defaults.calculation.salaryGrowthRate) {
    params.set(PARAM_KEYS.salaryGrowth, String(state.calculation.salaryGrowthRate * 100));
  }
  if (state.display.showDetail !== defaults.display.showDetail) {
    params.set(PARAM_KEYS.showDetail, state.display.showDetail ? '1' : '0');
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseFiniteNumber(raw: string | null, fallback: number): number {
  if (raw === null) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function decodeStateFromUrl(search: string): AppState {
  const params = new URLSearchParams(search);
  const defaults = DEFAULT_STATE;

  const age = clamp(
    Math.round(parseFiniteNumber(params.get(PARAM_KEYS.age), defaults.calculation.profile.age)),
    18,
    66
  );

  const salary = clamp(
    parseFiniteNumber(params.get(PARAM_KEYS.salary), defaults.calculation.profile.monthlySalary),
    0,
    50000
  );

  const salaryTypeRaw = params.get(PARAM_KEYS.salaryType);
  const salaryType = salaryTypeRaw === 'g' ? 'gross' as const : 'net' as const;

  const pagasExtraRaw = params.get(PARAM_KEYS.pagasExtra);
  const pagasExtra = pagasExtraRaw === '0' ? false : defaults.calculation.profile.pagasExtra;

  const ccaaRaw = params.get(PARAM_KEYS.ccaa);
  const ccaaFromShort = ccaaRaw !== null ? SHORT_TO_CCAA[ccaaRaw] : undefined;
  const ccaa: CcaaCode = ccaaFromShort !== undefined && isValidCcaa(ccaaFromShort)
    ? ccaaFromShort
    : defaults.calculation.profile.ccaa;

  const yearsWorked = clamp(
    Math.round(parseFiniteNumber(params.get(PARAM_KEYS.yearsWorked), defaults.calculation.profile.yearsWorked)),
    0,
    50
  );

  const retirementAge = clamp(
    Math.round(parseFiniteNumber(params.get(PARAM_KEYS.retirementAge), defaults.calculation.profile.desiredRetirementAge)),
    63,
    70
  );

  const displayModeRaw = params.get(PARAM_KEYS.displayMode);
  const displayMode = displayModeRaw === 'n' ? 'nominal' as const : 'real' as const;

  const ipcRateRaw = parseFiniteNumber(params.get(PARAM_KEYS.ipcRate), defaults.calculation.ipcRate * 100);
  const ipcRate = clamp(ipcRateRaw / 100, 0.005, 0.05);

  const greeceHaircutRaw = parseFiniteNumber(params.get(PARAM_KEYS.greeceHaircut), defaults.calculation.greeceHaircutRate * 100);
  const greeceHaircutRate = clamp(greeceHaircutRaw / 100, 0.10, 0.50);

  const nsRaw = params.get(PARAM_KEYS.notionalScenario);
  const notionalGrowthScenario = nsRaw === 'a' ? 'ageing-report' as const : 'historic' as const;

  const sgRaw = parseFiniteNumber(params.get(PARAM_KEYS.salaryGrowth), defaults.calculation.salaryGrowthRate * 100);
  const salaryGrowthRate = clamp(sgRaw / 100, 0, 0.05);

  const sdRaw = params.get(PARAM_KEYS.showDetail);
  const showDetail = sdRaw === '1';

  return {
    calculation: {
      profile: {
        age,
        monthlySalary: salary,
        salaryType,
        pagasExtra,
        ccaa,
        yearsWorked,
        monthsContributed: yearsWorked * 12,
        desiredRetirementAge: retirementAge,
      },
      salaryGrowthRate,
      greeceHaircutRate,
      notionalGrowthScenario,
      ipcRate,
    },
    display: {
      displayMode,
      showDetail,
    },
  };
}

export function hasUrlParams(search: string): boolean {
  return new URLSearchParams(search).size > 0;
}
