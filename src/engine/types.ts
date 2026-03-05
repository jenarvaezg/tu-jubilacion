// Core domain types for the pension calculation engine.
// These types are shared across the engine and UI layers.

// ── Enums / Literals ──────────────────────────────────────────────

export type CcaaCode =
  | "madrid"
  | "catalunya"
  | "andalucia"
  | "valencia"
  | "pais-vasco"
  | "other";

export type ScenarioId =
  | "current-law"
  | "notional-accounts"
  | "sustainability-2013"
  | "eu-convergence"
  | "greece-haircut";

// ── Data Version ──────────────────────────────────────────────────

export interface DataVersion {
  readonly year: number;
  readonly source: string;
  readonly accessDate: string;
}

// ── SS Tables ─────────────────────────────────────────────────────

export interface CoefficientBracket {
  readonly fromMonth: number;
  readonly toMonth: number;
  readonly ratePerMonth: number;
}

export interface EarlyPenaltyRow {
  readonly monthsAnticipation: number;
  readonly minYearsContributed: number;
  readonly maxYearsContributed: number;
  readonly penaltyRate: number;
}

export interface LateBonusRow {
  readonly minYearsContributed: number;
  readonly bonusPerYear: number;
}

export interface SSRules {
  readonly dataVersion: DataVersion;
  readonly baseMinMonthly: number;
  readonly baseMaxMonthly: number;
  readonly workerContributionRate: number;
  readonly employerContributionRate: number;
  readonly paymentsPerYear: number;
  readonly regulatoryBaseMonths: number;
  readonly regulatoryBaseDivisor: number;
  readonly legalRetirementAge: number;
  readonly reducedRetirementAge: number;
  readonly reducedRetirementYearsRequired: number;
  readonly coefficientScale: readonly CoefficientBracket[];
  readonly earlyRetirementPenalties: readonly EarlyPenaltyRow[];
  readonly lateRetirementBonus: readonly LateBonusRow[];
  readonly pensionMaxMonthly: number;
  readonly pensionMinMonthly: number;
}

// ── IRPF Tables ───────────────────────────────────────────────────

export interface IRPFBracket {
  readonly from: number;
  readonly to: number;
  readonly marginalRate: number;
}

export interface WorkIncomeDeductionBracket {
  readonly upTo: number;
  readonly deduction: number;
  readonly marginalReduction: number;
}

export interface WorkIncomeDeduction {
  readonly brackets: readonly WorkIncomeDeductionBracket[];
}

export interface IRPFTable {
  readonly dataVersion: DataVersion;
  readonly brackets: readonly IRPFBracket[];
  readonly personalMinimum: number;
  readonly workIncomeDeduction: WorkIncomeDeduction;
}

// ── Mortality / Life Expectancy ───────────────────────────────────

export interface MortalityTable {
  readonly dataVersion: DataVersion;
  readonly source: string;
  readonly qx: readonly number[];
}

export interface LifeExpectancyEntry {
  readonly year: number;
  readonly lifeExpectancy: number;
}

export interface LifeExpectancyProjection {
  readonly dataVersion: DataVersion;
  readonly atAge: number;
  readonly projections: readonly LifeExpectancyEntry[];
}

// ── FEDEA Params ──────────────────────────────────────────────────

export interface FEDEAParams {
  readonly dataVersion: DataVersion;
  readonly contributionRate: number;
  readonly gdpGrowthHistoric: number;
  readonly gdpGrowthAgeingReport: number;
}

// ── CCAA ──────────────────────────────────────────────────────────

export interface CcaaInfo {
  readonly code: CcaaCode;
  readonly name: string;
  readonly shortName: string;
}

// ── User Profile & Calculation ────────────────────────────────────

export interface UserProfile {
  readonly age: number;
  readonly monthlySalary: number;
  readonly salaryType: "net" | "gross";
  readonly pagasExtra: boolean;
  readonly ccaa: CcaaCode;
  readonly yearsWorked: number;
  readonly monthsContributed: number;
  readonly desiredRetirementAge: number;
}

export interface ProjectedBase {
  readonly year: number;
  readonly monthlyBase: number;
  readonly annualGrossSalary: number;
}

export interface IRPFResult {
  readonly tax: number;
  readonly effectiveRate: number;
  readonly workIncomeDeduction: number;
}

export interface SalaryPipelineResult {
  readonly annualGross: number;
  readonly monthlyGross: number;
  readonly monthlyBase: number;
  readonly annualSSWorker: number;
  readonly annualIRPF: number;
  readonly monthlyNet: number;
  readonly projectedBases: readonly ProjectedBase[];
}

export interface ScenarioResult {
  readonly scenarioId: ScenarioId;
  readonly scenarioName: string;
  readonly monthlyPension: number;
  readonly annualPension: number;
  readonly baseReguladora: number;
  readonly replacementRate: number;
  readonly replacementRateNet: number;
  readonly timeline: readonly YearlyProjection[];
}

export interface YearlyProjection {
  readonly age: number;
  readonly year: number;
  readonly monthlyPensionReal: number;
  readonly monthlyPensionNominal: number;
}

// ── Sustainability Data ───────────────────────────────────────────

export interface EducationalItem {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly source: string;
}

export interface SustainabilityData {
  readonly dataVersion: DataVersion;
  readonly fdea: number;
  readonly deficitGdpPercent: number;
  readonly projectedSpending2050GdpPercent: number;
  readonly currentSpendingGdpPercent: number;
  readonly contributorsPerPensioner: number;
  readonly averagePensionMonthly: number;
  readonly educationalContent: readonly EducationalItem[];
}
