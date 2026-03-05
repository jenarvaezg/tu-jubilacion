// Seguridad Social tables 2025
// Source: BOE - Real Decreto 1055/2024 (bases cotización 2025)
// Source: LGSS art. 210 (coefficient scale)
// Source: RD-ley 2/2023 (early retirement penalties, voluntary only for MVP)
// Source: Ley 21/2021 (late retirement bonus)
import type { SSRules } from "../engine/types";

export const SS_RULES: SSRules = {
  dataVersion: {
    year: 2025,
    source: "BOE - RD 1055/2024, LGSS art. 210, RD-ley 2/2023",
    accessDate: "2025-01-15",
  },

  // Bases de cotización: min 1.381,20€ y max 5.101,20€
  // Ajustado según validación con el simulador oficial Importass (mar-2026).
  baseMinMonthly: 1381.2,
  baseMaxMonthly: 5101.2,

  // Tipos de cotización
  workerContributionRate: 0.0647,
  employerContributionRate: 0.236,

  paymentsPerYear: 14,

  // Base reguladora (cohortes futuras): 324 mejores bases de las últimas 348,
  // prorrateadas a 14 pagas con divisor 396.
  // Referencia: explicación mostrada por el simulador oficial Importass.
  regulatoryBaseMonths: 324,
  regulatoryBaseDivisor: 396,

  // Escala de coeficientes (carreras largas, calibrada con criterio Importass)
  // 15 años (180 meses) = 50%
  // Meses 181-229 (49 meses): +0,21% por mes
  // Meses 230-444 (215 meses): +0,1847906977% por mes
  // Máximo: 444 meses (37 años) = 100%
  coefficientScale: [
    { fromMonth: 1, toMonth: 180, ratePerMonth: 0 }, // base: 50% at 180 months
    { fromMonth: 181, toMonth: 229, ratePerMonth: 0.0021 },
    { fromMonth: 230, toMonth: 444, ratePerMonth: 0.001847906976744186 },
  ],

  // Jubilación anticipada voluntaria
  // Calibrada en esta versión para aproximar el simulador oficial Importass
  // en cohortes jóvenes (ej. nacidos en los 90), usando tasas mensuales.
  earlyRetirementPenalties: [
    // Menos de 38.5 años cotizados - penalización más alta
    {
      monthsAnticipation: 1,
      minYearsContributed: 0,
      maxYearsContributed: 38.5,
      penaltyRate: 0.005,
    },
    {
      monthsAnticipation: 1,
      minYearsContributed: 38.5,
      maxYearsContributed: 44.5,
      penaltyRate: 0.0045,
    },
    {
      monthsAnticipation: 1,
      minYearsContributed: 44.5,
      maxYearsContributed: 100,
      penaltyRate: 0.0042,
    },
  ],

  // Jubilación demorada: +4% anual para la opción porcentual
  lateRetirementBonus: [
    { minYearsContributed: 0, bonusPerYear: 0.04 },
    { minYearsContributed: 44.5, bonusPerYear: 0.04 },
  ],

  // Edades de jubilación
  legalRetirementAge: 67,
  reducedRetirementAge: 65,
  reducedRetirementYearsRequired: 38.5,

  // Pensiones máxima y mínima 2025 (14 pagas)
  pensionMaxMonthly: 3175.04,
  pensionMinMonthly: 735.9, // Con cónyuge a cargo, > 65 años
} as const;
