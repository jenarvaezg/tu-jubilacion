import { describe, expect, it } from "vitest";
import { calculateCurrentLaw } from "../../../src/engine/scenarios/current-law";
import type { UserProfile } from "../../../src/engine/types";

// Casos reales aportados por usuario (simulador oficial Importass).
// Se compara contra el "valor deflactado" (euros de hoy).

const BASE_PROFILE: UserProfile = {
  age: 32,
  monthlySalary: 5101,
  salaryType: "gross",
  pagasExtra: true,
  ccaa: "madrid",
  yearsWorked: 10,
  monthsContributed: 123, // 3.734 dias ~ 10.26 anos
  desiredRetirementAge: 65,
};

const OFFICIAL_CONFIG = {
  currentYear: 2026,
  ipcRate: 0.02,
  salaryGrowthRate: 0,
};

function expectClosePct(actual: number, expected: number, maxPctError: number): void {
  const pctError = Math.abs(actual - expected) / expected;
  expect(pctError).toBeLessThanOrEqual(maxPctError);
}

const STRICT_MAX_PCT_ERROR = 0.003; // 0.3%

describe("Importass parity (current law, deflated values)", () => {
  it("base maxima + edad ordinaria", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 5101, desiredRetirementAge: 65 },
      OFFICIAL_CONFIG,
    );
    expectClosePct(result.monthlyPension, 4173.95, STRICT_MAX_PCT_ERROR);
  });

  it("base intermedia + edad ordinaria", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 3000, desiredRetirementAge: 65 },
      OFFICIAL_CONFIG,
    );
    expectClosePct(result.monthlyPension, 2454.69, STRICT_MAX_PCT_ERROR);
  });

  it("base baja + edad ordinaria", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 1599.6, desiredRetirementAge: 65 },
      OFFICIAL_CONFIG,
    );
    expectClosePct(result.monthlyPension, 1308.86, STRICT_MAX_PCT_ERROR);
  });

  it("base maxima + 1 ano de demora", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 5101, desiredRetirementAge: 66 },
      OFFICIAL_CONFIG,
    );
    // En este caso se compara contra el total (con complemento por demora).
    expectClosePct(result.monthlyPension, 4340.92, STRICT_MAX_PCT_ERROR);
  });

  it("base maxima + 1 ano de anticipada", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 5101, desiredRetirementAge: 64 },
      OFFICIAL_CONFIG,
    );
    expectClosePct(result.monthlyPension, 3965.25, STRICT_MAX_PCT_ERROR);
  });

  it("base maxima + 2 anos de demora (edad ordinaria 67)", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 5101, desiredRetirementAge: 67 },
      OFFICIAL_CONFIG,
    );
    expectClosePct(result.monthlyPension, 4507.88, STRICT_MAX_PCT_ERROR);
  });

  it("base maxima + 2 anos de anticipada", () => {
    const result = calculateCurrentLaw(
      { ...BASE_PROFILE, monthlySalary: 5101, desiredRetirementAge: 63 },
      OFFICIAL_CONFIG,
    );
    // El usuario reporta pension inicial 6.246,49 €/mes en 2057.
    // En euros de hoy (ipc=2% durante 31 anos): ~3.380,89 €/mes.
    expectClosePct(result.monthlyPension, 3380.89, STRICT_MAX_PCT_ERROR);
  });
});
