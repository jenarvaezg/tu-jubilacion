// IRPF 2025 tables by CCAA (combined state + regional brackets)
// Source: AEAT - Agencia Tributaria + legislación autonómica 2025
// State brackets: Ley 35/2006 art. 63 (updated 2025)
// Regional brackets: Leyes de presupuestos autonómicos 2025
// Work income deduction: Art. 20 LIRPF (updated RDL 4/2024)
// Note: Simplified model - only rendimientos del trabajo, single taxpayer
import type { IRPFTable, CcaaCode } from "../engine/types";

// Reducción por rendimientos del trabajo (art. 20 LIRPF, updated 2025)
// Applied to rendimiento neto del trabajo before computing tax
// upTo = rendimiento neto del trabajo threshold
// deduction = fixed deduction amount at that bracket
// marginalReduction = additional reduction per euro above previous bracket
const WORK_INCOME_DEDUCTION = {
  brackets: [
    // Rendimiento neto <= 14,047.50: deducción de 7,302€
    { upTo: 14047.50, deduction: 7302.0, marginalReduction: 0 },
    // 14,047.50 < Rendimiento neto <= 19,747.50:
    // 7,302 - 1.14 * (rendimiento_neto - 14,047.50)
    // At 19,747.50: 7302 - 1.14 * 5700 = 7302 - 6498 = 804
    { upTo: 19747.50, deduction: 7302.0, marginalReduction: 1.14 },
    // Rendimiento neto > 19,747.50: deducción de 2,000€
    { upTo: Infinity, deduction: 2000.0, marginalReduction: 0 },
  ],
} as const;

// Personal minimum exempt from tax (mínimo personal, art. 57 LIRPF)
const PERSONAL_MINIMUM = 5550.0;

// ── Madrid ─────────────────────────────────────────────────────────
// State (9.5/12/15/18.5/22.5/24.5) + Autonomous (8.5/10.7/12.8/17.4/20.5)
const MADRID_BRACKETS = [
  { from: 0, to: 12450, marginalRate: 0.18 }, // 9.5 + 8.5
  { from: 12450, to: 13362, marginalRate: 0.18 },
  { from: 13362, to: 19004, marginalRate: 0.207 }, // 9.5 + 10.7 (mid overlap)
  { from: 19004, to: 20200, marginalRate: 0.248 }, // 12 + 12.8
  { from: 20200, to: 35200, marginalRate: 0.278 }, // 15 + 12.8
  { from: 35200, to: 35425, marginalRate: 0.359 }, // 18.5 + 17.4
  { from: 35425, to: 57320, marginalRate: 0.359 },
  { from: 57320, to: 60000, marginalRate: 0.39 }, // 18.5 + 20.5
  { from: 60000, to: 300000, marginalRate: 0.43 }, // 22.5 + 20.5
  { from: 300000, to: Infinity, marginalRate: 0.45 }, // 24.5 + 20.5
] as const;

// ── Catalunya ──────────────────────────────────────────────────────
// State + Autonomous (10.5/12/14/15/18.8/21.5/23.5/24.5/25.5)
const CATALUNYA_BRACKETS = [
  { from: 0, to: 12450, marginalRate: 0.2 }, // 9.5 + 10.5
  { from: 12450, to: 17707, marginalRate: 0.24 }, // 12 + 12
  { from: 17707, to: 20200, marginalRate: 0.26 }, // 12 + 14
  { from: 20200, to: 21000, marginalRate: 0.29 }, // 15 + 14
  { from: 21000, to: 33007, marginalRate: 0.3 }, // 15 + 15
  { from: 33007, to: 35200, marginalRate: 0.338 }, // 15 + 18.8
  { from: 35200, to: 53407, marginalRate: 0.373 }, // 18.5 + 18.8
  { from: 53407, to: 60000, marginalRate: 0.4 }, // 18.5 + 21.5
  { from: 60000, to: 90000, marginalRate: 0.46 }, // 22.5 + 23.5
  { from: 90000, to: 120000, marginalRate: 0.47 }, // 22.5 + 24.5 (approx)
  { from: 120000, to: 175000, marginalRate: 0.49 },
  { from: 175000, to: 300000, marginalRate: 0.5 },
  { from: 300000, to: Infinity, marginalRate: 0.5 },
] as const;

// ── Andalucía ──────────────────────────────────────────────────────
// State + Autonomous (9.5/12/15/18.5/22.5)
const ANDALUCIA_BRACKETS = [
  { from: 0, to: 12450, marginalRate: 0.19 }, // 9.5 + 9.5
  { from: 12450, to: 13000, marginalRate: 0.215 }, // 12 + 9.5 (overlap)
  { from: 13000, to: 20200, marginalRate: 0.24 }, // 12 + 12
  { from: 20200, to: 21000, marginalRate: 0.27 }, // 15 + 12
  { from: 21000, to: 35200, marginalRate: 0.3 }, // 15 + 15
  { from: 35200, to: 50000, marginalRate: 0.37 }, // 18.5 + 18.5
  { from: 50000, to: 60000, marginalRate: 0.41 }, // 18.5 + 22.5
  { from: 60000, to: 120000, marginalRate: 0.45 }, // 22.5 + 22.5
  { from: 120000, to: 300000, marginalRate: 0.47 },
  { from: 300000, to: Infinity, marginalRate: 0.49 },
] as const;

// ── Valencia ───────────────────────────────────────────────────────
// State + Autonomous (9/12/15/17.5/20/22.5/29.5)
const VALENCIA_BRACKETS = [
  { from: 0, to: 12000, marginalRate: 0.185 }, // 9.5 + 9
  { from: 12000, to: 12450, marginalRate: 0.215 }, // 9.5 + 12 (overlap)
  { from: 12450, to: 20200, marginalRate: 0.24 }, // 12 + 12
  { from: 20200, to: 22000, marginalRate: 0.27 }, // 15 + 12
  { from: 22000, to: 32000, marginalRate: 0.3 }, // 15 + 15
  { from: 32000, to: 35200, marginalRate: 0.325 }, // 15 + 17.5
  { from: 35200, to: 42000, marginalRate: 0.36 }, // 18.5 + 17.5
  { from: 42000, to: 52000, marginalRate: 0.385 }, // 18.5 + 20
  { from: 52000, to: 60000, marginalRate: 0.41 }, // 18.5 + 22.5
  { from: 60000, to: 65000, marginalRate: 0.45 }, // 22.5 + 22.5
  { from: 65000, to: 300000, marginalRate: 0.52 }, // 22.5 + 29.5
  { from: 300000, to: Infinity, marginalRate: 0.54 }, // 24.5 + 29.5
] as const;

// ── País Vasco (Bizkaia régimen foral) ─────────────────────────────
// Uses its own complete scale (not state + regional split)
// Source: Norma Foral Bizkaia
const PAIS_VASCO_BRACKETS = [
  { from: 0, to: 15390, marginalRate: 0.23 },
  { from: 15390, to: 30790, marginalRate: 0.28 },
  { from: 30790, to: 46190, marginalRate: 0.35 },
  { from: 46190, to: 66810, marginalRate: 0.4 },
  { from: 66810, to: 102010, marginalRate: 0.45 },
  { from: 102010, to: 176810, marginalRate: 0.47 },
  { from: 176810, to: 300000, marginalRate: 0.49 },
  { from: 300000, to: Infinity, marginalRate: 0.49 },
] as const;

// ── Other (state-level brackets doubled, as approximation) ─────────
// For CCAA not explicitly modeled, use state brackets × 2
const OTHER_BRACKETS = [
  { from: 0, to: 12450, marginalRate: 0.19 },
  { from: 12450, to: 20200, marginalRate: 0.24 },
  { from: 20200, to: 35200, marginalRate: 0.3 },
  { from: 35200, to: 60000, marginalRate: 0.37 },
  { from: 60000, to: 300000, marginalRate: 0.45 },
  { from: 300000, to: Infinity, marginalRate: 0.47 },
] as const;

const DATA_VERSION = {
  year: 2025,
  source: "AEAT + legislación autonómica 2025",
  accessDate: "2025-03-05",
} as const;

function makeTable(
  brackets: readonly IRPFTable["brackets"][number][],
): IRPFTable {
  return {
    dataVersion: DATA_VERSION,
    brackets,
    personalMinimum: PERSONAL_MINIMUM,
    workIncomeDeduction: WORK_INCOME_DEDUCTION,
  };
}

export const IRPF_TABLES: Record<CcaaCode, IRPFTable> = {
  madrid: makeTable(MADRID_BRACKETS),
  catalunya: makeTable(CATALUNYA_BRACKETS),
  andalucia: makeTable(ANDALUCIA_BRACKETS),
  valencia: makeTable(VALENCIA_BRACKETS),
  "pais-vasco": makeTable(PAIS_VASCO_BRACKETS),
  other: makeTable(OTHER_BRACKETS),
} as const;
