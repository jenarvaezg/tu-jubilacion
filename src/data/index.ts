export { SS_RULES } from "./ss-tables";
export { IRPF_TABLES } from "./irpf-tables";
export { MORTALITY_TABLE_2023 } from "./mortality-tables";
export { LIFE_EXPECTANCY_65, getLifeExpectancy65 } from "./life-expectancy";
export { FEDEA_PARAMS } from "./fedea-params";
export { SUSTAINABILITY_DATA } from "./sustainability";
export { CCAA_LIST } from "./ccaa";

export type {
  SSRules,
  IRPFTable,
  IRPFBracket,
  WorkIncomeDeduction,
  WorkIncomeDeductionBracket,
  MortalityTable,
  LifeExpectancyProjection,
  LifeExpectancyEntry,
  FEDEAParams,
  SustainabilityData,
  EducationalItem,
  CcaaInfo,
  CcaaCode,
  ScenarioId,
  UserProfile,
  ScenarioResult,
  YearlyProjection,
  ProjectedBase,
  SalaryPipelineResult,
  DataVersion,
  CoefficientBracket,
  EarlyPenaltyRow,
  LateBonusRow,
} from "../engine/types";
