// Invest-vs-deposits comparison timeline generator.
// Shows same monthly contribution across three asset classes.
import type { ComparisonYearlyPoint } from "./types";
import type { AssetClassId, AssetClassReturns } from "./types";
import { futureValueMonthly } from "./portfolio";
import { realToNominal } from "../inflation";

export function generateComparisonTimeline(params: {
  readonly monthlyContribution: number;
  readonly currentAge: number;
  readonly retirementAge: number;
  readonly assetReturns: Record<AssetClassId, AssetClassReturns>;
  readonly ipcRate: number;
  readonly currentYear: number;
}): readonly ComparisonYearlyPoint[] {
  const {
    monthlyContribution,
    currentAge,
    retirementAge,
    assetReturns,
    ipcRate,
    currentYear,
  } = params;

  const points: ComparisonYearlyPoint[] = [];

  for (let age = currentAge; age <= retirementAge; age++) {
    const year = currentYear + (age - currentAge);
    const yearsInvested = age - currentAge;
    const yearsFromNow = yearsInvested;

    const equityReal = futureValueMonthly(
      monthlyContribution,
      assetReturns.equity.expectedRealReturn,
      yearsInvested,
    );
    const bondsReal = futureValueMonthly(
      monthlyContribution,
      assetReturns.bonds.expectedRealReturn,
      yearsInvested,
    );
    const depositsReal = futureValueMonthly(
      monthlyContribution,
      assetReturns.deposits.expectedRealReturn,
      yearsInvested,
    );

    points.push({
      age,
      year,
      equityPortfolioReal: Math.round(equityReal * 100) / 100,
      equityPortfolioNominal:
        Math.round(realToNominal(equityReal, yearsFromNow, ipcRate) * 100) /
        100,
      bondsPortfolioReal: Math.round(bondsReal * 100) / 100,
      bondsPortfolioNominal:
        Math.round(realToNominal(bondsReal, yearsFromNow, ipcRate) * 100) /
        100,
      depositsPortfolioReal: Math.round(depositsReal * 100) / 100,
      depositsPortfolioNominal:
        Math.round(
          realToNominal(depositsReal, yearsFromNow, ipcRate) * 100,
        ) / 100,
    });
  }

  return points;
}
