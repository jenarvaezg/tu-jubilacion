import {
  DEFAULT_PERSONAL_SITUATIONS,
  type CcaaCode,
  type ScenarioId,
} from "../engine/types.ts";
import type { InvestmentProfileId } from "../engine/savings/types.ts";
import type { AppState } from "./types.ts";
import { DEFAULT_STATE } from "./defaults.ts";

// Compact URL param keys for minimal URL length
const PARAM_KEYS = {
  age: "a",
  salary: "s",
  salaryType: "t",
  pagasExtra: "px",
  ccaa: "c",
  yearsWorked: "y",
  retirementAge: "r",
  displayMode: "d",
  ipcRate: "ipc",
  greeceHaircut: "h",
  notionalScenario: "ns",
  salaryGrowth: "sg",
  showDetail: "sd",
  childrenCount: "ch",
  disabilityLevel: "dl",
  hazardousJob: "hz",
  involuntaryEarly: "ie",
  foreignYears: "fy",
  comparisonScenario: "cs",
  investmentProfile: "ip",
  currentSavingsBalance: "sb",
  monthlyContribution: "mc",
  drawdownYears: "dy",
} as const;

const SCENARIO_SHORT: Record<ScenarioId, string> = {
  "current-law": "cl",
  "notional-accounts": "na",
  "sustainability-2013": "s2",
  "eu-convergence": "eu",
  "greece-haircut": "gh",
};

const SHORT_TO_SCENARIO: Record<string, ScenarioId> = Object.fromEntries(
  Object.entries(SCENARIO_SHORT).map(([k, v]) => [v, k as ScenarioId]),
) as Record<string, ScenarioId>;

const PROFILE_SHORT: Record<InvestmentProfileId, string> = {
  conservative: "c",
  moderate: "m",
  aggressive: "a",
  "glide-path": "g",
};

const SHORT_TO_PROFILE: Record<string, InvestmentProfileId> =
  Object.fromEntries(
    Object.entries(PROFILE_SHORT).map(([k, v]) => [
      v,
      k as InvestmentProfileId,
    ]),
  ) as Record<string, InvestmentProfileId>;

const CCAA_SHORT: Record<CcaaCode, string> = {
  madrid: "mad",
  catalunya: "cat",
  andalucia: "and",
  valencia: "val",
  "pais-vasco": "pvs",
  other: "oth",
};

const SHORT_TO_CCAA: Record<string, CcaaCode> = Object.fromEntries(
  Object.entries(CCAA_SHORT).map(([k, v]) => [v, k as CcaaCode]),
) as Record<string, CcaaCode>;

const VALID_CCAA_CODES = new Set<string>(Object.keys(CCAA_SHORT));

function isValidCcaa(value: string): value is CcaaCode {
  return VALID_CCAA_CODES.has(value);
}

export function encodeStateToUrl(state: AppState): string {
  const params = new URLSearchParams();
  const { profile } = state.calculation;
  const defaults = DEFAULT_STATE;
  const defaultSituations =
    defaults.calculation.profile.personalSituations ??
    DEFAULT_PERSONAL_SITUATIONS;
  const situations = profile.personalSituations ?? defaultSituations;

  // Only encode values that differ from defaults
  if (profile.age !== defaults.calculation.profile.age) {
    params.set(PARAM_KEYS.age, String(profile.age));
  }
  if (profile.monthlySalary !== defaults.calculation.profile.monthlySalary) {
    params.set(PARAM_KEYS.salary, String(profile.monthlySalary));
  }
  if (profile.salaryType !== defaults.calculation.profile.salaryType) {
    params.set(PARAM_KEYS.salaryType, profile.salaryType === "net" ? "n" : "g");
  }
  if (profile.pagasExtra !== defaults.calculation.profile.pagasExtra) {
    params.set(PARAM_KEYS.pagasExtra, profile.pagasExtra ? "1" : "0");
  }
  if (profile.ccaa !== defaults.calculation.profile.ccaa) {
    params.set(PARAM_KEYS.ccaa, CCAA_SHORT[profile.ccaa]);
  }
  if (profile.yearsWorked !== defaults.calculation.profile.yearsWorked) {
    params.set(PARAM_KEYS.yearsWorked, String(profile.yearsWorked));
  }
  if (
    profile.desiredRetirementAge !==
    defaults.calculation.profile.desiredRetirementAge
  ) {
    params.set(PARAM_KEYS.retirementAge, String(profile.desiredRetirementAge));
  }
  if (state.display.displayMode !== defaults.display.displayMode) {
    params.set(
      PARAM_KEYS.displayMode,
      state.display.displayMode === "real" ? "r" : "n",
    );
  }
  if (state.calculation.ipcRate !== defaults.calculation.ipcRate) {
    params.set(PARAM_KEYS.ipcRate, String(state.calculation.ipcRate * 100));
  }
  if (
    state.calculation.greeceHaircutRate !==
    defaults.calculation.greeceHaircutRate
  ) {
    params.set(
      PARAM_KEYS.greeceHaircut,
      String(state.calculation.greeceHaircutRate * 100),
    );
  }
  if (
    state.calculation.notionalGrowthScenario !==
    defaults.calculation.notionalGrowthScenario
  ) {
    params.set(
      PARAM_KEYS.notionalScenario,
      state.calculation.notionalGrowthScenario === "historic" ? "h" : "a",
    );
  }
  if (
    state.calculation.salaryGrowthRate !== defaults.calculation.salaryGrowthRate
  ) {
    params.set(
      PARAM_KEYS.salaryGrowth,
      String(state.calculation.salaryGrowthRate * 100),
    );
  }
  if (state.display.showDetail !== defaults.display.showDetail) {
    params.set(PARAM_KEYS.showDetail, state.display.showDetail ? "1" : "0");
  }
  if (situations.childrenCount !== defaultSituations.childrenCount) {
    params.set(PARAM_KEYS.childrenCount, String(situations.childrenCount));
  }
  if (situations.disabilityLevel !== defaultSituations.disabilityLevel) {
    const dlCode =
      situations.disabilityLevel === "65"
        ? "6"
        : situations.disabilityLevel === "33"
          ? "3"
          : "n";
    params.set(PARAM_KEYS.disabilityLevel, dlCode);
  }
  if (situations.hazardousJob !== defaultSituations.hazardousJob) {
    params.set(PARAM_KEYS.hazardousJob, situations.hazardousJob ? "1" : "0");
  }
  if (
    situations.involuntaryEarlyRetirement !==
    defaultSituations.involuntaryEarlyRetirement
  ) {
    params.set(
      PARAM_KEYS.involuntaryEarly,
      situations.involuntaryEarlyRetirement ? "1" : "0",
    );
  }
  if (
    situations.foreignContributionYears !==
    defaultSituations.foreignContributionYears
  ) {
    params.set(
      PARAM_KEYS.foreignYears,
      String(situations.foreignContributionYears),
    );
  }

  if (
    state.calculation.comparisonScenarioId !==
    defaults.calculation.comparisonScenarioId
  ) {
    params.set(
      PARAM_KEYS.comparisonScenario,
      SCENARIO_SHORT[state.calculation.comparisonScenarioId],
    );
  }
  if (
    state.calculation.investmentProfileId !==
    defaults.calculation.investmentProfileId
  ) {
    params.set(
      PARAM_KEYS.investmentProfile,
      PROFILE_SHORT[state.calculation.investmentProfileId],
    );
  }
  if (
    state.calculation.currentSavingsBalance !==
    defaults.calculation.currentSavingsBalance
  ) {
    params.set(
      PARAM_KEYS.currentSavingsBalance,
      String(Math.round(state.calculation.currentSavingsBalance)),
    );
  }
  if (state.calculation.monthlyContributionOverride !== null) {
    params.set(
      PARAM_KEYS.monthlyContribution,
      String(Math.round(state.calculation.monthlyContributionOverride)),
    );
  }
  if (state.calculation.drawdownYears !== null) {
    params.set(
      PARAM_KEYS.drawdownYears,
      String(state.calculation.drawdownYears),
    );
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
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
  const defaultSituations =
    defaults.calculation.profile.personalSituations ??
    DEFAULT_PERSONAL_SITUATIONS;

  const age = clamp(
    Math.round(
      parseFiniteNumber(
        params.get(PARAM_KEYS.age),
        defaults.calculation.profile.age,
      ),
    ),
    18,
    66,
  );

  const salary = clamp(
    parseFiniteNumber(
      params.get(PARAM_KEYS.salary),
      defaults.calculation.profile.monthlySalary,
    ),
    0,
    50000,
  );

  const salaryTypeRaw = params.get(PARAM_KEYS.salaryType);
  const salaryType =
    salaryTypeRaw === "g" ? ("gross" as const) : ("net" as const);

  const pagasExtraRaw = params.get(PARAM_KEYS.pagasExtra);
  const pagasExtra =
    pagasExtraRaw === "0" ? false : defaults.calculation.profile.pagasExtra;

  const ccaaRaw = params.get(PARAM_KEYS.ccaa);
  const ccaaFromShort = ccaaRaw !== null ? SHORT_TO_CCAA[ccaaRaw] : undefined;
  const ccaa: CcaaCode =
    ccaaFromShort !== undefined && isValidCcaa(ccaaFromShort)
      ? ccaaFromShort
      : defaults.calculation.profile.ccaa;

  const yearsWorked = clamp(
    Math.round(
      parseFiniteNumber(
        params.get(PARAM_KEYS.yearsWorked),
        defaults.calculation.profile.yearsWorked,
      ),
    ),
    0,
    50,
  );

  const retirementAge = clamp(
    Math.round(
      parseFiniteNumber(
        params.get(PARAM_KEYS.retirementAge),
        defaults.calculation.profile.desiredRetirementAge,
      ),
    ),
    63,
    70,
  );

  const displayModeRaw = params.get(PARAM_KEYS.displayMode);
  const displayMode =
    displayModeRaw === "r"
      ? ("real" as const)
      : displayModeRaw === "n"
        ? ("nominal" as const)
        : defaults.display.displayMode;

  const ipcRateRaw = parseFiniteNumber(
    params.get(PARAM_KEYS.ipcRate),
    defaults.calculation.ipcRate * 100,
  );
  const ipcRate = clamp(ipcRateRaw / 100, 0.005, 0.05);

  const greeceHaircutRaw = parseFiniteNumber(
    params.get(PARAM_KEYS.greeceHaircut),
    defaults.calculation.greeceHaircutRate * 100,
  );
  const greeceHaircutRate = clamp(greeceHaircutRaw / 100, 0.1, 0.5);

  const nsRaw = params.get(PARAM_KEYS.notionalScenario);
  const notionalGrowthScenario =
    nsRaw === "a" ? ("ageing-report" as const) : ("historic" as const);

  const sgRaw = parseFiniteNumber(
    params.get(PARAM_KEYS.salaryGrowth),
    defaults.calculation.salaryGrowthRate * 100,
  );
  const salaryGrowthRate = clamp(sgRaw / 100, 0, 0.05);

  const sdRaw = params.get(PARAM_KEYS.showDetail);
  const showDetail = sdRaw === "1";

  const childrenCount = clamp(
    Math.round(
      parseFiniteNumber(
        params.get(PARAM_KEYS.childrenCount),
        defaultSituations.childrenCount,
      ),
    ),
    0,
    4,
  );

  const disabilityRaw = params.get(PARAM_KEYS.disabilityLevel);
  const disabilityLevel =
    disabilityRaw === "6"
      ? "65"
      : disabilityRaw === "3"
        ? "33"
        : defaultSituations.disabilityLevel;

  const hazardousJob = params.get(PARAM_KEYS.hazardousJob) === "1";
  const involuntaryEarlyRetirement =
    params.get(PARAM_KEYS.involuntaryEarly) === "1";
  const foreignContributionYears = clamp(
    Math.round(
      parseFiniteNumber(
        params.get(PARAM_KEYS.foreignYears),
        defaultSituations.foreignContributionYears,
      ),
    ),
    0,
    20,
  );

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
        personalSituations: {
          childrenCount,
          disabilityLevel,
          hazardousJob,
          involuntaryEarlyRetirement,
          foreignContributionYears,
        },
      },
      salaryGrowthRate,
      greeceHaircutRate,
      notionalGrowthScenario,
      ipcRate,
      comparisonScenarioId: (() => {
        const raw = params.get(PARAM_KEYS.comparisonScenario);
        return raw !== null && raw in SHORT_TO_SCENARIO
          ? SHORT_TO_SCENARIO[raw]
          : defaults.calculation.comparisonScenarioId;
      })(),
      investmentProfileId: (() => {
        const raw = params.get(PARAM_KEYS.investmentProfile);
        return raw !== null && raw in SHORT_TO_PROFILE
          ? SHORT_TO_PROFILE[raw]
          : defaults.calculation.investmentProfileId;
      })(),
      currentSavingsBalance: (() => {
        const raw = params.get(PARAM_KEYS.currentSavingsBalance);
        if (raw === null) return defaults.calculation.currentSavingsBalance;
        const parsed = Number(raw);
        return Number.isFinite(parsed)
          ? Math.max(0, Math.min(10000000, Math.round(parsed)))
          : defaults.calculation.currentSavingsBalance;
      })(),
      monthlyContributionOverride: (() => {
        const raw = params.get(PARAM_KEYS.monthlyContribution);
        if (raw === null) return null;
        const parsed = Number(raw);
        return Number.isFinite(parsed)
          ? Math.max(0, Math.min(10000, parsed))
          : null;
      })(),
      drawdownYears: (() => {
        const raw = params.get(PARAM_KEYS.drawdownYears);
        if (raw === null) return null;
        const parsed = Number(raw);
        return Number.isFinite(parsed)
          ? Math.max(5, Math.min(40, Math.round(parsed)))
          : null;
      })(),
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
