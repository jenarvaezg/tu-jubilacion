// Savings/investment domain types for Phase 2.
// All types are immutable (readonly) and shared across engine and UI.

import type { ScenarioId } from "../types";

// ── Asset Classes ────────────────────────────────────────────────

export type AssetClassId = "equity" | "bonds" | "deposits";

export interface AssetClassReturns {
  readonly id: AssetClassId;
  readonly label: string;
  readonly expectedRealReturn: number;
  readonly color: string;
}

// ── Investment Profiles ──────────────────────────────────────────

export type InvestmentProfileId =
  | "conservative"
  | "moderate"
  | "aggressive"
  | "glide-path";

export interface InvestmentAllocation {
  readonly equity: number;
  readonly bonds: number;
  readonly deposits: number;
}

export interface InvestmentProfile {
  readonly id: InvestmentProfileId;
  readonly label: string;
  readonly description: string;
  readonly allocation: InvestmentAllocation;
  readonly isGlidePath: boolean;
}

// ── Retirement Income Gap ────────────────────────────────────────

export interface RetirementIncomeGap {
  readonly targetMonthlyIncome: number;
  readonly currentLawMonthly: number;
  readonly comparisonMonthly: number;
  readonly currentLawGapMonthly: number;
  readonly comparisonGapMonthly: number;
  readonly additionalGapMonthly: number;
  readonly currentLawCoverageRate: number;
  readonly comparisonCoverageRate: number;
  readonly comparisonScenarioId: ScenarioId;
}

// ── Savings Calculation ──────────────────────────────────────────

export interface SavingsResult {
  readonly monthlyContribution: number;
  readonly totalContributed: number;
  readonly currentSavingsBalance: number;
  readonly currentSavingsAtRetirement: number;
  readonly portfolioAtRetirement: number;
  readonly monthlyIncomeFromPortfolio: number;
  readonly yearsOfAccumulation: number;
  readonly weightedRealReturn: number;
  readonly profileId: InvestmentProfileId;
}

// ── Portfolio Timeline ───────────────────────────────────────────

export interface PortfolioYearlyProjection {
  readonly age: number;
  readonly year: number;
  readonly portfolioValueReal: number;
  readonly portfolioValueNominal: number;
  readonly monthlyIncomeReal: number;
  readonly monthlyIncomeNominal: number;
}

// ── Invest vs Deposits Comparison ────────────────────────────────

export interface ComparisonYearlyPoint {
  readonly age: number;
  readonly year: number;
  readonly equityPortfolioReal: number;
  readonly equityPortfolioNominal: number;
  readonly bondsPortfolioReal: number;
  readonly bondsPortfolioNominal: number;
  readonly depositsPortfolioReal: number;
  readonly depositsPortfolioNominal: number;
  readonly savingsOnlyReal: number;
  readonly savingsOnlyNominal: number;
}
