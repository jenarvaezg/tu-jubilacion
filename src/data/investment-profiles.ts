// Investment profiles and asset class returns for Phase 2 savings calculator.
// All returns are real (inflation-adjusted) expected annual returns.
import type {
  AssetClassId,
  AssetClassReturns,
  InvestmentAllocation,
  InvestmentProfile,
  InvestmentProfileId,
} from "../engine/savings/types";

// ── Asset Class Returns ──────────────────────────────────────────

export const ASSET_CLASS_RETURNS: Record<AssetClassId, AssetClassReturns> = {
  equity: {
    id: "equity",
    label: "Renta variable global",
    expectedRealReturn: 0.05,
    color: "#16a34a",
  },
  bonds: {
    id: "bonds",
    label: "Renta fija",
    expectedRealReturn: 0.01,
    color: "#2563eb",
  },
  deposits: {
    id: "deposits",
    label: "Letras del Tesoro / liquidez",
    expectedRealReturn: 0.0,
    color: "#9ca3af",
  },
};

// ── Investment Profiles ──────────────────────────────────────────

export const INVESTMENT_PROFILES: Record<
  InvestmentProfileId,
  InvestmentProfile
> = {
  conservative: {
    id: "conservative",
    label: "Conservador",
    description: "30% renta variable, 50% renta fija, 20% liquidez",
    allocation: { equity: 0.3, bonds: 0.5, deposits: 0.2 },
    isGlidePath: false,
  },
  moderate: {
    id: "moderate",
    label: "Moderado",
    description: "60% renta variable, 30% renta fija, 10% liquidez",
    allocation: { equity: 0.6, bonds: 0.3, deposits: 0.1 },
    isGlidePath: false,
  },
  aggressive: {
    id: "aggressive",
    label: "Agresivo",
    description: "90% renta variable, 10% renta fija",
    allocation: { equity: 0.9, bonds: 0.1, deposits: 0.0 },
    isGlidePath: false,
  },
  "glide-path": {
    id: "glide-path",
    label: "Ciclo de vida",
    description:
      "De agresivo a conservador con la edad: más riesgo de joven, más seguridad al jubilarte",
    allocation: { equity: 0.6, bonds: 0.3, deposits: 0.1 },
    isGlidePath: true,
  },
};

/**
 * Compute glide-path allocation based on years to retirement.
 * Follows a linear equity glide from 90% (30+ years out) to 30% (at retirement).
 * Bonds and deposits fill the remainder proportionally.
 */
export function getGlidePathAllocation(
  yearsToRetirement: number,
): InvestmentAllocation {
  const maxEquity = 0.9;
  const minEquity = 0.3;
  const maxYears = 30;

  const clampedYears = Math.max(0, Math.min(maxYears, yearsToRetirement));
  const equity =
    minEquity + (maxEquity - minEquity) * (clampedYears / maxYears);

  const remaining = 1 - equity;
  // Split remaining: ~2/3 bonds, ~1/3 deposits (rounded to avoid floating point)
  const bonds = Math.round(remaining * 0.67 * 100) / 100;
  const deposits = Math.round((remaining - bonds) * 100) / 100;

  return { equity: Math.round(equity * 100) / 100, bonds, deposits };
}

/**
 * Get the weighted real return for a given allocation.
 */
export function getWeightedReturn(allocation: InvestmentAllocation): number {
  return (
    allocation.equity * ASSET_CLASS_RETURNS.equity.expectedRealReturn +
    allocation.bonds * ASSET_CLASS_RETURNS.bonds.expectedRealReturn +
    allocation.deposits * ASSET_CLASS_RETURNS.deposits.expectedRealReturn
  );
}
