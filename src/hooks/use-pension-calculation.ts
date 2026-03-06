import { useMemo } from "react";
import type { ScenarioResult } from "../engine/types.ts";
import type { CalculationInputs } from "../state/types.ts";
import {
  calculateCurrentLaw,
  calculateFEDEATransition,
  calculateNotionalAccounts,
  calculateSustainability2013,
  calculateEUConvergence,
  calculateGreeceHaircut,
} from "../engine/scenarios/index.ts";

interface UsePensionCalculationResult {
  readonly results: readonly ScenarioResult[];
  readonly error: string | null;
}

export function usePensionCalculation(
  inputs: CalculationInputs,
): UsePensionCalculationResult {
  return useMemo(() => {
    try {
      const {
        profile,
        ipcRate,
        salaryGrowthRate,
        greeceHaircutRate,
        notionalGrowthScenario,
      } = inputs;
      const currentYear = new Date().getFullYear();

      const sharedConfig = {
        ipcRate,
        salaryGrowthRate,
        currentYear,
      };

      const results: ScenarioResult[] = [
        calculateCurrentLaw(profile, sharedConfig),
        calculateFEDEATransition(profile, {
          ...sharedConfig,
          notionalGrowthScenario,
        }),
        calculateNotionalAccounts(profile, {
          ...sharedConfig,
          notionalGrowthScenario,
        }),
        calculateSustainability2013(profile, sharedConfig),
        calculateEUConvergence(profile, sharedConfig),
        calculateGreeceHaircut(profile, {
          ...sharedConfig,
          haircutRate: greeceHaircutRate,
        }),
      ];

      return { results, error: null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error en el calculo";
      return { results: [], error: message };
    }
    // Pension-relevant fields only — savings/investment params excluded to avoid
    // unnecessary recalculation when only savings controls change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputs.profile,
    inputs.ipcRate,
    inputs.salaryGrowthRate,
    inputs.greeceHaircutRate,
    inputs.notionalGrowthScenario,
  ]);
}
