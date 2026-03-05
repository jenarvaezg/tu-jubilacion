import { describe, it, expect } from "vitest";
import {
  calculateIRPF,
  netToGross,
  grossToBaseCotizacion,
  monthlyToAnnualGross,
  grossToNetAnnual,
  deriveMonthlyLifestyleTarget,
} from "../../src/engine/salary";

describe("grossToBaseCotizacion", () => {
  it("clamps to base mínima when gross is below minimum", () => {
    expect(grossToBaseCotizacion(1000)).toBe(1381.2);
  });

  it("clamps to base máxima when gross exceeds maximum", () => {
    expect(grossToBaseCotizacion(6000)).toBe(5101.2);
  });

  it("returns gross when within range", () => {
    expect(grossToBaseCotizacion(2500)).toBe(2500);
  });

  it("returns exact base min at boundary", () => {
    expect(grossToBaseCotizacion(1381.2)).toBe(1381.2);
  });

  it("returns exact base max at boundary", () => {
    expect(grossToBaseCotizacion(5101.2)).toBe(5101.2);
  });
});

describe("monthlyToAnnualGross", () => {
  it("computes 14 pagas when pagasExtra is true", () => {
    expect(monthlyToAnnualGross(2000, true)).toBe(28000);
  });

  it("computes 12 pagas when pagasExtra is false", () => {
    expect(monthlyToAnnualGross(2000, false)).toBe(24000);
  });
});

describe("calculateIRPF", () => {
  it("returns zero tax for zero income", () => {
    const result = calculateIRPF(0, "madrid");
    expect(result.tax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it("computes tax for a typical Madrid salary (30k gross)", () => {
    const result = calculateIRPF(30000, "madrid");
    // Should produce a positive tax
    expect(result.tax).toBeGreaterThan(0);
    // Effective rate should be reasonable (10-20% range for this income)
    expect(result.effectiveRate).toBeGreaterThan(0.05);
    expect(result.effectiveRate).toBeLessThan(0.25);
  });

  it("produces higher tax for Catalunya than Madrid at same income", () => {
    const madrid = calculateIRPF(50000, "madrid");
    const catalunya = calculateIRPF(50000, "catalunya");
    expect(catalunya.tax).toBeGreaterThan(madrid.tax);
  });

  it("produces higher effective rate for higher incomes", () => {
    const low = calculateIRPF(20000, "other");
    const high = calculateIRPF(80000, "other");
    expect(high.effectiveRate).toBeGreaterThan(low.effectiveRate);
  });

  it("applies work income deduction for low incomes", () => {
    const result = calculateIRPF(15000, "madrid");
    expect(result.workIncomeDeduction).toBeGreaterThan(2000);
  });

  it("work income deduction is 2000 for high incomes", () => {
    const result = calculateIRPF(60000, "madrid");
    // For high incomes, net work income > 19747.50, so deduction = 2000
    expect(result.workIncomeDeduction).toBe(2000);
  });

  it("all CCAA produce valid results for typical salary", () => {
    const ccaas = [
      "madrid",
      "catalunya",
      "andalucia",
      "valencia",
      "pais-vasco",
      "other",
    ] as const;
    for (const ccaa of ccaas) {
      const result = calculateIRPF(35000, ccaa);
      expect(result.tax).toBeGreaterThan(0);
      expect(result.effectiveRate).toBeGreaterThan(0);
      expect(result.effectiveRate).toBeLessThan(0.5);
    }
  });
});

describe("netToGross", () => {
  it("gross is always greater than net", () => {
    const gross = netToGross(1500, "madrid", true);
    expect(gross).toBeGreaterThan(1500);
  });

  it("round-trips correctly for Madrid, 14 pagas", () => {
    const netInput = 1800;
    const gross = netToGross(netInput, "madrid", true);
    // Verify: gross -> compute net -> should match original
    const annualGross = gross * 14;
    const ss = annualGross * 0.0647;
    const irpf = calculateIRPF(annualGross, "madrid");
    const computedNetAnnual = annualGross - ss - irpf.tax;
    const computedNetMonthly = computedNetAnnual / 14;
    expect(computedNetMonthly).toBeCloseTo(netInput, 0);
  });

  it("round-trips correctly for Catalunya, 12 pagas", () => {
    const netInput = 2000;
    const gross = netToGross(netInput, "catalunya", false);
    const annualGross = gross * 12;
    const ss = annualGross * 0.0647;
    const irpf = calculateIRPF(annualGross, "catalunya");
    const computedNetAnnual = annualGross - ss - irpf.tax;
    const computedNetMonthly = computedNetAnnual / 12;
    expect(computedNetMonthly).toBeCloseTo(netInput, 0);
  });

  it("round-trips for low income (1200 net, Andalucía)", () => {
    const netInput = 1200;
    const gross = netToGross(netInput, "andalucia", true);
    const annualGross = gross * 14;
    const ss = annualGross * 0.0647;
    const irpf = calculateIRPF(annualGross, "andalucia");
    const computedNetAnnual = annualGross - ss - irpf.tax;
    const computedNetMonthly = computedNetAnnual / 14;
    expect(computedNetMonthly).toBeCloseTo(netInput, 0);
  });

  it("round-trips for high income (4000 net, Valencia)", () => {
    const netInput = 4000;
    const gross = netToGross(netInput, "valencia", true);
    const annualGross = gross * 14;
    const ss = annualGross * 0.0647;
    const irpf = calculateIRPF(annualGross, "valencia");
    const computedNetAnnual = annualGross - ss - irpf.tax;
    const computedNetMonthly = computedNetAnnual / 14;
    expect(computedNetMonthly).toBeCloseTo(netInput, 0);
  });
});

describe("deriveMonthlyLifestyleTarget", () => {
  it("normalizes 14 net payments to a 12-month lifestyle target", () => {
    const target = deriveMonthlyLifestyleTarget({
      monthlySalary: 2000,
      salaryType: "net",
      ccaa: "madrid",
      pagasExtra: true,
    });

    expect(target).toBeCloseTo((2000 * 14) / 12, 2);
  });

  it("derives the same target from a gross annual net conversion", () => {
    const grossMonthly = 2500;
    const annualNet = grossToNetAnnual(grossMonthly * 14, "madrid");
    const target = deriveMonthlyLifestyleTarget({
      monthlySalary: grossMonthly,
      salaryType: "gross",
      ccaa: "madrid",
      pagasExtra: true,
    });

    expect(target).toBeCloseTo(annualNet / 12, 2);
  });
});
