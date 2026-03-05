// Engine re-exports
export {
  calculateIRPF,
  netToGross,
  grossToBaseCotizacion,
  monthlyToAnnualGross,
} from "./salary";
export { projectBases, getLastNMonthlyBases } from "./projection";
export { realToNominal, nominalToReal, revalorizePension } from "./inflation";
export { generateTimeline } from "./pension-timeline";
export {
  calculateActuarialFactor,
  calculateBaseAnnuityFactor,
  survivalProbability,
  buildGenerationalTable,
} from "./actuarial";
export {
  calculateCurrentLaw,
  calculateNotionalAccounts,
  calculateSustainability2013,
  calculateEUConvergence,
  calculateGreeceHaircut,
} from "./scenarios";
export type {
  UserProfile,
  ScenarioResult,
  YearlyProjection,
  CcaaCode,
  ScenarioId,
  IRPFResult,
  ProjectedBase,
  DataVersion,
} from "./types";
