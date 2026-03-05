import type {
  CcaaCode,
  DisabilityLevel,
  ScenarioId,
  UserProfile,
} from "../engine/types.ts";
import type { InvestmentProfileId } from "../engine/savings/types.ts";

export interface CalculationInputs {
  readonly profile: UserProfile;
  readonly salaryGrowthRate: number;
  readonly greeceHaircutRate: number;
  readonly notionalGrowthScenario: "historic" | "ageing-report";
  readonly ipcRate: number;
  readonly comparisonScenarioId: ScenarioId;
  readonly investmentProfileId: InvestmentProfileId;
  readonly monthlyContributionOverride: number | null;
  readonly drawdownYears: number | null;
}

export interface DisplayPreferences {
  readonly displayMode: "real" | "nominal";
  readonly showDetail: boolean;
}

export interface AppState {
  readonly calculation: CalculationInputs;
  readonly display: DisplayPreferences;
}

export type AppAction =
  | { readonly type: "SET_AGE"; readonly payload: number }
  | { readonly type: "SET_SALARY"; readonly payload: number }
  | { readonly type: "SET_SALARY_TYPE"; readonly payload: "net" | "gross" }
  | { readonly type: "SET_PAGAS_EXTRA"; readonly payload: boolean }
  | { readonly type: "SET_CCAA"; readonly payload: CcaaCode }
  | { readonly type: "SET_YEARS_WORKED"; readonly payload: number }
  | { readonly type: "SET_RETIREMENT_AGE"; readonly payload: number }
  | { readonly type: "SET_CHILDREN_COUNT"; readonly payload: number }
  | { readonly type: "SET_DISABILITY_LEVEL"; readonly payload: DisabilityLevel }
  | { readonly type: "SET_HAZARDOUS_JOB"; readonly payload: boolean }
  | {
      readonly type: "SET_INVOLUNTARY_EARLY_RETIREMENT";
      readonly payload: boolean;
    }
  | {
      readonly type: "SET_FOREIGN_CONTRIBUTION_YEARS";
      readonly payload: number;
    }
  | { readonly type: "SET_DISPLAY_MODE"; readonly payload: "real" | "nominal" }
  | { readonly type: "SET_IPC_RATE"; readonly payload: number }
  | { readonly type: "SET_GREECE_HAIRCUT"; readonly payload: number }
  | {
      readonly type: "SET_NOTIONAL_SCENARIO";
      readonly payload: "historic" | "ageing-report";
    }
  | { readonly type: "SET_COMPARISON_SCENARIO"; readonly payload: ScenarioId }
  | {
      readonly type: "SET_INVESTMENT_PROFILE";
      readonly payload: InvestmentProfileId;
    }
  | {
      readonly type: "SET_MONTHLY_CONTRIBUTION";
      readonly payload: number | null;
    }
  | { readonly type: "SET_DRAWDOWN_YEARS"; readonly payload: number | null }
  | { readonly type: "TOGGLE_DETAIL" }
  | { readonly type: "LOAD_FROM_URL"; readonly payload: Partial<AppState> };
