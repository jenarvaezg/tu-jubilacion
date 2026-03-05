// FEDEA parameters for notional accounts calculation
// Source: Devesa, Doménech & Meneu (2025). "Transición hacia un Sistema de
// Pensiones de Cuentas Nocionales en España". FEDEA, EEE 2025/22.
// Pages 14-16 for contribution rate and growth scenarios
// Pages 29-30 (Annex) for actuarial factor formula
import type { FEDEAParams } from "../engine/types";

export const FEDEA_PARAMS: FEDEAParams = {
  dataVersion: {
    year: 2025,
    source: "FEDEA EEE 2025/22 - Devesa, Doménech & Meneu",
    accessDate: "2025-03-04",
  },

  // Tipo de cotización para jubilación (p. 14 del paper)
  // Estimación FEDEA/AIReF: 21% de la base de cotización
  contributionRate: 0.21,

  // Crecimiento real del PIB - escenario histórico (p. 16)
  // Media de largo plazo del crecimiento real del PIB español
  gdpGrowthHistoric: 0.0224,

  // Crecimiento real del PIB - escenario Ageing Report (p. 16)
  // Proyección conservadora de la Comisión Europea
  gdpGrowthAgeingReport: 0.0123,
} as const;

// Derived nominal notional rates (computed from GDP growth + IPC assumption)
// Historic scenario: 2.24% real + 2% IPC = 4.24% nominal
// Ageing Report scenario: 1.23% real + 2% IPC = 3.23% nominal
// These are used in the actuarial factor formula (Annex, pages 29-30)
