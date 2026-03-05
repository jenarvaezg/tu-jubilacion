import { describe, it, expect } from "vitest";
import {
  realToNominal,
  nominalToReal,
  revalorizePension,
} from "../../src/engine/inflation";

describe("realToNominal", () => {
  it("returns same amount at year 0", () => {
    expect(realToNominal(1000, 0, 0.02)).toBe(1000);
  });

  it("inflates correctly over 10 years at 2%", () => {
    const result = realToNominal(1000, 10, 0.02);
    expect(result).toBeCloseTo(1000 * Math.pow(1.02, 10), 2);
  });

  it("doubles approximately in 35 years at 2%", () => {
    const result = realToNominal(1000, 35, 0.02);
    expect(result).toBeCloseTo(2000, -2); // rough doubling
  });
});

describe("nominalToReal", () => {
  it("returns same amount at year 0", () => {
    expect(nominalToReal(1000, 0, 0.02)).toBe(1000);
  });

  it("deflates correctly", () => {
    const nominal = 1219; // approx 1000 * 1.02^10
    const result = nominalToReal(nominal, 10, 0.02);
    expect(result).toBeCloseTo(1000, -1);
  });

  it("round-trips with realToNominal", () => {
    const original = 1500;
    const nominal = realToNominal(original, 20, 0.025);
    const backToReal = nominalToReal(nominal, 20, 0.025);
    expect(backToReal).toBeCloseTo(original, 4);
  });
});

describe("revalorizePension", () => {
  it("returns initial amount at year 0", () => {
    expect(revalorizePension(1500, 0, 0.02)).toBe(1500);
  });

  it("grows pension at IPC rate", () => {
    const result = revalorizePension(1500, 5, 0.02);
    expect(result).toBeCloseTo(1500 * Math.pow(1.02, 5), 2);
  });
});
