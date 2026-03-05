import { useMemo } from "react";
import type { ScenarioResult } from "../engine/types.ts";
import type { CalculationInputs } from "../state/types.ts";
import {
  calculateCurrentLaw,
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

      const sharedConfig = {
        ipcRate,
        salaryGrowthRate,
      };

      const results: ScenarioResult[] = [
        calculateCurrentLaw(profile, sharedConfig),
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
  }, [inputs]);
}
