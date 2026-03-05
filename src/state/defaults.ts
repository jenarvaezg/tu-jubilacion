import type { AppState } from './types.ts';
import { DEFAULT_PERSONAL_SITUATIONS } from '../engine/types.ts';

export const DEFAULT_STATE: AppState = {
  calculation: {
    profile: {
      age: 35,
      monthlySalary: 2000,
      salaryType: 'net',
      pagasExtra: true,
      ccaa: 'madrid',
      yearsWorked: 13,
      monthsContributed: 156,
      desiredRetirementAge: 67,
      personalSituations: DEFAULT_PERSONAL_SITUATIONS,
    },
    salaryGrowthRate: 0,
    greeceHaircutRate: 0.30,
    notionalGrowthScenario: 'historic',
    ipcRate: 0.02,
  },
  display: {
    displayMode: 'nominal',
    showDetail: false,
  },
} as const;
