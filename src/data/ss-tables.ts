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

  // Base reguladora: media últimos 25 años (300 meses) entre 350
  regulatoryBaseMonths: 300,
  regulatoryBaseDivisor: 350,

  // Escala de coeficientes (LGSS art. 210)
  // 15 años (180 meses) = 50%
  // Meses 181-229 (primeros 49 adicionales): +0.21% por mes
  // Meses 230-389 (siguientes 160): +0.19% por mes
  // Máximo: 438 meses (36.5 años) = 100%
  coefficientScale: [
    { fromMonth: 1, toMonth: 180, ratePerMonth: 0 }, // base: 50% at 180 months
    { fromMonth: 181, toMonth: 229, ratePerMonth: 0.0021 },
    { fromMonth: 230, toMonth: 389, ratePerMonth: 0.0019 },
  ],

  // Jubilación anticipada voluntaria (RD-ley 2/2023)
  // Penalización por trimestre de anticipación según años cotizados
  // Simplificado a penalización mensual media por rango de cotización
  earlyRetirementPenalties: [
    // Menos de 38.5 años cotizados - penalización más alta
    {
      monthsAnticipation: 1,
      minYearsContributed: 0,
      maxYearsContributed: 38.5,
      penaltyRate: 0.0033,
    },
    {
      monthsAnticipation: 1,
      minYearsContributed: 38.5,
      maxYearsContributed: 44.5,
      penaltyRate: 0.0029,
    },
    {
      monthsAnticipation: 1,
      minYearsContributed: 44.5,
      maxYearsContributed: 100,
      penaltyRate: 0.0025,
    },
  ],

  // Jubilación demorada (Ley 21/2021)
  lateRetirementBonus: [
    { minYearsContributed: 0, bonusPerYear: 0.02 },
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
