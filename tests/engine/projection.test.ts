import { describe, it, expect } from "vitest";
import { projectBases, getLastNMonthlyBases } from "../../src/engine/projection";

describe("projectBases", () => {
  it("returns empty array if retirement age <= current age", () => {
    const result = projectBases({
      currentBase: 2000,
      currentAge: 67,
      retirementAge: 67,
      realSalaryGrowthRate: 0.01,
      currentYear: 2025,
    });
    expect(result.length).toBe(0);
  });

  it("projects correct number of years", () => {
    const result = projectBases({
      currentBase: 2000,
      currentAge: 35,
      retirementAge: 67,
      realSalaryGrowthRate: 0.01,
      currentYear: 2025,
    });
    // 67 - 35 = 32 years, plus year 0 = 33 entries
    expect(result.length).toBe(33);
  });

  it("first projection year matches current year", () => {
    const result = projectBases({
      currentBase: 2000,
      currentAge: 40,
      retirementAge: 65,
      realSalaryGrowthRate: 0.01,
      currentYear: 2025,
    });
    expect(result[0].year).toBe(2025);
  });

  it("bases grow at the specified salary growth rate", () => {
    const result = projectBases({
      currentBase: 2000,
      currentAge: 40,
      retirementAge: 50,
      realSalaryGrowthRate: 0.02,
      currentYear: 2025,
    });
    // After 10 years at 2%, base should be 2000 * 1.02^10 ≈ 2437.99
    expect(result[10].monthlyBase).toBeCloseTo(2000 * Math.pow(1.02, 10), 0);
  });

  it("clamps base to SS maximum", () => {
    const result = projectBases({
      currentBase: 4800,
      currentAge: 40,
      retirementAge: 65,
      realSalaryGrowthRate: 0.02,
      currentYear: 2025,
    });
    // High base that will exceed max after growth
    for (const proj of result) {
      expect(proj.monthlyBase).toBeLessThanOrEqual(5101.2);
    }
  });
});

describe("getLastNMonthlyBases", () => {
  it("returns correct number of months", () => {
    const projected = projectBases({
      currentBase: 2000,
      currentAge: 40,
      retirementAge: 67,
      realSalaryGrowthRate: 0.01,
      currentYear: 2025,
    });
    const bases = getLastNMonthlyBases(projected, 18, 300);
    expect(bases.length).toBe(300);
  });

  it("all bases are positive", () => {
    const projected = projectBases({
      currentBase: 2000,
      currentAge: 40,
      retirementAge: 67,
      realSalaryGrowthRate: 0.01,
      currentYear: 2025,
    });
    const bases = getLastNMonthlyBases(projected, 18, 300);
    for (const base of bases) {
      expect(base).toBeGreaterThan(0);
    }
  });
});
