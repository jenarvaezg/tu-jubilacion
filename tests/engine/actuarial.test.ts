import { describe, it, expect } from "vitest";
import {
  calculateActuarialFactor,
  calculateBaseAnnuityFactor,
  survivalProbability,
  buildGenerationalTable,
} from "../../src/engine/actuarial";
import { MORTALITY_TABLE_2023 } from "../../src/data/mortality-tables";

// Build generational table calibrated to INE projected LE(65) = 21.68 for 2024
const GENERATIONAL_TABLE = buildGenerationalTable(
  MORTALITY_TABLE_2023,
  65,
  21.68,
);

describe("survivalProbability", () => {
  it("returns 1.0 if toAge <= fromAge", () => {
    expect(survivalProbability(65, 65, MORTALITY_TABLE_2023)).toBe(1.0);
    expect(survivalProbability(65, 60, MORTALITY_TABLE_2023)).toBe(1.0);
  });

  it("returns a value between 0 and 1 for realistic age ranges", () => {
    const prob = survivalProbability(65, 80, MORTALITY_TABLE_2023);
    expect(prob).toBeGreaterThan(0);
    expect(prob).toBeLessThan(1);
  });

  it("survival from 65 to 66 is approximately 1 - qx[65]", () => {
    const prob = survivalProbability(65, 66, MORTALITY_TABLE_2023);
    expect(prob).toBeCloseTo(1 - MORTALITY_TABLE_2023.qx[65], 6);
  });

  it("survival probability decreases with longer periods", () => {
    const p5 = survivalProbability(65, 70, MORTALITY_TABLE_2023);
    const p10 = survivalProbability(65, 75, MORTALITY_TABLE_2023);
    const p20 = survivalProbability(65, 85, MORTALITY_TABLE_2023);
    expect(p10).toBeLessThan(p5);
    expect(p20).toBeLessThan(p10);
  });

  it("returns 0 for ages beyond mortality table", () => {
    const prob = survivalProbability(65, 130, MORTALITY_TABLE_2023);
    expect(prob).toBe(0);
  });
});

describe("calculateBaseAnnuityFactor", () => {
  it("produces positive value for typical parameters", () => {
    const af = calculateBaseAnnuityFactor({
      retirementAge: 65,
      mortalityTable: MORTALITY_TABLE_2023,
      nominalNotionalRate: 0.0424,
      ipcRevalorization: 0.02,
      maxAge: 120,
    });
    expect(af).toBeGreaterThan(10);
    expect(af).toBeLessThan(25);
  });
});

describe("calculateActuarialFactor - FEDEA validation", () => {
  // Reference: FEDEA paper states AF at age 65 with r=4.24%, alpha=2% ≈ 16.72
  // Uses generational mortality table calibrated to INE projected LE(65) = 21.68
  it("AF at age 65 with historic scenario (r=4.24%, alpha=2%) is ~16.72 +/-10%", () => {
    const af = calculateActuarialFactor({
      retirementAge: 65,
      mortalityTable: GENERATIONAL_TABLE,
      nominalNotionalRate: 0.0424, // 2.24% GDP + 2% IPC
      ipcRevalorization: 0.02,
      maxAge: 120,
      monthlyPayments: 12,
    });
    // FEDEA reference value: 16.72 +/- 10%
    // Tolerance wider because our generational table is a uniform-scaling
    // approximation of true cohort mortality
    expect(af).toBeGreaterThan(16.72 * 0.9); // > 15.05
    expect(af).toBeLessThan(16.72 * 1.1); // < 18.39
  });

  it("AF at age 63 is greater than AF at age 65 (longer payout period)", () => {
    const af63 = calculateActuarialFactor({
      retirementAge: 63,
      mortalityTable: GENERATIONAL_TABLE,
      nominalNotionalRate: 0.0424,
      ipcRevalorization: 0.02,
      maxAge: 120,
      monthlyPayments: 12,
    });
    const af65 = calculateActuarialFactor({
      retirementAge: 65,
      mortalityTable: GENERATIONAL_TABLE,
      nominalNotionalRate: 0.0424,
      ipcRevalorization: 0.02,
      maxAge: 120,
      monthlyPayments: 12,
    });
    expect(af63).toBeGreaterThan(af65);
  });

  it("AF at age 70 is less than AF at age 65 (shorter payout period)", () => {
    const af70 = calculateActuarialFactor({
      retirementAge: 70,
      mortalityTable: GENERATIONAL_TABLE,
      nominalNotionalRate: 0.0424,
      ipcRevalorization: 0.02,
      maxAge: 120,
      monthlyPayments: 12,
    });
    const af65 = calculateActuarialFactor({
      retirementAge: 65,
      mortalityTable: GENERATIONAL_TABLE,
      nominalNotionalRate: 0.0424,
      ipcRevalorization: 0.02,
      maxAge: 120,
      monthlyPayments: 12,
    });
    expect(af70).toBeLessThan(af65);
  });

  it("AF with Ageing Report scenario (r=3.23%) is higher than historic", () => {
    // Lower discount rate = higher annuity factor (more expensive pension)
    const afHistoric = calculateActuarialFactor({
      retirementAge: 65,
      mortalityTable: GENERATIONAL_TABLE,
      nominalNotionalRate: 0.0424,
      ipcRevalorization: 0.02,
      maxAge: 120,
      monthlyPayments: 12,
    });
    const afAgeing = calculateActuarialFactor({
      retirementAge: 65,
      mortalityTable: GENERATIONAL_TABLE,
      nominalNotionalRate: 0.0323, // 1.23% GDP + 2% IPC
      ipcRevalorization: 0.02,
      maxAge: 120,
      monthlyPayments: 12,
    });
    expect(afAgeing).toBeGreaterThan(afHistoric);
  });

  it("monthly correction increases the factor slightly", () => {
    const base = calculateBaseAnnuityFactor({
      retirementAge: 65,
      mortalityTable: GENERATIONAL_TABLE,
      nominalNotionalRate: 0.0424,
      ipcRevalorization: 0.02,
      maxAge: 120,
    });
    const monthly = calculateActuarialFactor({
      retirementAge: 65,
      mortalityTable: GENERATIONAL_TABLE,
      nominalNotionalRate: 0.0424,
      ipcRevalorization: 0.02,
      maxAge: 120,
      monthlyPayments: 12,
    });
    // Monthly correction adds (m-1)/(2m) ≈ 0.458 plus small IPC adjustment
    // With generational table the correction is slightly larger (~0.6)
    expect(monthly).toBeGreaterThan(base);
    expect(monthly - base).toBeGreaterThan(0.4);
    expect(monthly - base).toBeLessThan(0.7);
  });
});
