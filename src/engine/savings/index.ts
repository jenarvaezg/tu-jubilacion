export { calculatePensionGap } from "./gap";
export {
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
  PensionGap,
  SavingsResult,
  PortfolioYearlyProjection,
  ComparisonYearlyPoint,
} from "./types";
