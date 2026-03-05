import { describe, it, expect } from "vitest";
import {
  SP500_REAL_RETURNS,
  TBOND_REAL_RETURNS,
  TBILL_REAL_RETURNS,
  MSCI_WORLD_REAL_RETURNS,
  HISTORICAL_SERIES,
} from "../../src/data/historical-returns";
import { computeGeometricMean } from "../../src/engine/backtest/statistics";

describe("Historical return data integrity", () => {
  it("S&P 500 has 97 entries (1928-2024)", () => {
    expect(SP500_REAL_RETURNS).toHaveLength(97);
    expect(SP500_REAL_RETURNS[0].year).toBe(1928);
    expect(SP500_REAL_RETURNS[96].year).toBe(2024);
  });

  it("T-Bond has 97 entries (1928-2024)", () => {
    expect(TBOND_REAL_RETURNS).toHaveLength(97);
    expect(TBOND_REAL_RETURNS[0].year).toBe(1928);
    expect(TBOND_REAL_RETURNS[96].year).toBe(2024);
  });

  it("T-Bill has 97 entries (1928-2024)", () => {
    expect(TBILL_REAL_RETURNS).toHaveLength(97);
    expect(TBILL_REAL_RETURNS[0].year).toBe(1928);
    expect(TBILL_REAL_RETURNS[96].year).toBe(2024);
  });

  it("MSCI World has 55 entries (1970-2024)", () => {
    expect(MSCI_WORLD_REAL_RETURNS).toHaveLength(55);
    expect(MSCI_WORLD_REAL_RETURNS[0].year).toBe(1970);
    expect(MSCI_WORLD_REAL_RETURNS[54].year).toBe(2024);
  });

  it("all returns are within sane bounds (-1.0 to 2.0)", () => {
    const allReturns = [
      ...SP500_REAL_RETURNS,
      ...TBOND_REAL_RETURNS,
      ...TBILL_REAL_RETURNS,
      ...MSCI_WORLD_REAL_RETURNS,
    ];
    for (const entry of allReturns) {
      expect(entry.return).toBeGreaterThan(-1.0);
      expect(entry.return).toBeLessThan(2.0);
    }
  });

  it("years are sequential with no gaps", () => {
    for (const series of [SP500_REAL_RETURNS, TBOND_REAL_RETURNS, TBILL_REAL_RETURNS, MSCI_WORLD_REAL_RETURNS]) {
      for (let i = 1; i < series.length; i++) {
        expect(series[i].year).toBe(series[i - 1].year + 1);
      }
    }
  });

  it("S&P 500 geometric mean is approximately 7%", () => {
    const returns = SP500_REAL_RETURNS.map((r) => r.return);
    const geoMean = computeGeometricMean(returns);
    expect(geoMean).toBeGreaterThan(0.05);
    expect(geoMean).toBeLessThan(0.09);
  });

  it("MSCI World geometric mean is approximately 5%", () => {
    const returns = MSCI_WORLD_REAL_RETURNS.map((r) => r.return);
    const geoMean = computeGeometricMean(returns);
    expect(geoMean).toBeGreaterThan(0.03);
    expect(geoMean).toBeLessThan(0.07);
  });

  it("spot-check 2008 S&P 500 real return ~ -37%", () => {
    const entry = SP500_REAL_RETURNS.find((r) => r.year === 2008);
    expect(entry).toBeDefined();
    expect(entry!.return).toBeCloseTo(-0.366, 1);
  });

  it("spot-check 2013 S&P 500 real return ~ +30%", () => {
    const entry = SP500_REAL_RETURNS.find((r) => r.year === 2013);
    expect(entry).toBeDefined();
    expect(entry!.return).toBeCloseTo(0.302, 1);
  });

  it("HISTORICAL_SERIES registry has all 4 series", () => {
    expect(Object.keys(HISTORICAL_SERIES)).toHaveLength(4);
    expect(HISTORICAL_SERIES.sp500.data).toBe(SP500_REAL_RETURNS);
    expect(HISTORICAL_SERIES.tbond.data).toBe(TBOND_REAL_RETURNS);
    expect(HISTORICAL_SERIES.tbill.data).toBe(TBILL_REAL_RETURNS);
    expect(HISTORICAL_SERIES["msci-world"].data).toBe(MSCI_WORLD_REAL_RETURNS);
  });
});
