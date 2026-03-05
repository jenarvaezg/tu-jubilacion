export { calculateRetirementIncomeGap } from "./gap";
export {
  futureValueLumpSum,
  futureValueMonthly,
  monthlyIncomeFromPortfolio,
  requiredMonthlySavings,
  deriveDrawdownYears,
  calculateSavings,
  generatePortfolioTimeline,
} from "./portfolio";
export { generateComparisonTimeline } from "./comparison";
export type {
  AssetClassId,
  AssetClassReturns,
  InvestmentProfileId,
  InvestmentAllocation,
  InvestmentProfile,
  RetirementIncomeGap,
  SavingsResult,
  PortfolioYearlyProjection,
  ComparisonYearlyPoint,
} from "./types";
