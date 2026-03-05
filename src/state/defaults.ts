import type { AppState } from './types.ts';

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
    },
    salaryGrowthRate: 0,
    greeceHaircutRate: 0.30,
    notionalGrowthScenario: 'historic',
    ipcRate: 0.02,
  },
  display: {
    displayMode: 'real',
    showDetail: false,
  },
} as const;
