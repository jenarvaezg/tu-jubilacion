import { describe, it, expect } from "vitest";
import {
  ASSET_CLASS_RETURNS,
  INVESTMENT_PROFILES,
  getGlidePathAllocation,
  getWeightedReturn,
} from "../../src/data/investment-profiles";

describe("ASSET_CLASS_RETURNS", () => {
  it("has all three asset classes", () => {
    expect(Object.keys(ASSET_CLASS_RETURNS)).toEqual([
      "equity",
      "bonds",
      "deposits",
    ]);
  });

  it("has reasonable real return bounds", () => {
    expect(ASSET_CLASS_RETURNS.equity.expectedRealReturn).toBeGreaterThan(0);
    expect(ASSET_CLASS_RETURNS.equity.expectedRealReturn).toBeLessThanOrEqual(
      0.1,
    );
    expect(ASSET_CLASS_RETURNS.bonds.expectedRealReturn).toBeGreaterThanOrEqual(
      0,
    );
    expect(ASSET_CLASS_RETURNS.bonds.expectedRealReturn).toBeLessThanOrEqual(
      0.05,
    );
    expect(
      ASSET_CLASS_RETURNS.deposits.expectedRealReturn,
    ).toBeGreaterThanOrEqual(0);
    expect(ASSET_CLASS_RETURNS.deposits.expectedRealReturn).toBeLessThanOrEqual(
      0.02,
    );
  });

  it("equity return is higher than bonds and deposits", () => {
    expect(ASSET_CLASS_RETURNS.equity.expectedRealReturn).toBeGreaterThan(
      ASSET_CLASS_RETURNS.bonds.expectedRealReturn,
    );
    expect(ASSET_CLASS_RETURNS.bonds.expectedRealReturn).toBeGreaterThanOrEqual(
      ASSET_CLASS_RETURNS.deposits.expectedRealReturn,
    );
  });
});

describe("INVESTMENT_PROFILES", () => {
  it("has all four profiles", () => {
    expect(Object.keys(INVESTMENT_PROFILES)).toEqual([
      "conservative",
      "moderate",
      "aggressive",
      "glide-path",
    ]);
  });

  it("all static profile allocations sum to 1.0", () => {
    for (const profile of Object.values(INVESTMENT_PROFILES)) {
      if (profile.isGlidePath) continue;
      const { equity, bonds, deposits } = profile.allocation;
      const sum = equity + bonds + deposits;
      expect(sum).toBeCloseTo(1.0, 10);
    }
  });

  it("only glide-path has isGlidePath=true", () => {
    for (const [id, profile] of Object.entries(INVESTMENT_PROFILES)) {
      if (id === "glide-path") {
        expect(profile.isGlidePath).toBe(true);
      } else {
        expect(profile.isGlidePath).toBe(false);
      }
    }
  });

  it("all profiles have required fields", () => {
    for (const profile of Object.values(INVESTMENT_PROFILES)) {
      expect(profile.id).toBeDefined();
      expect(profile.label).toBeDefined();
      expect(profile.description).toBeDefined();
      expect(profile.allocation).toBeDefined();
      expect(typeof profile.isGlidePath).toBe("boolean");
    }
  });

  it("equity allocation increases from conservative to aggressive", () => {
    expect(INVESTMENT_PROFILES.conservative.allocation.equity).toBeLessThan(
      INVESTMENT_PROFILES.moderate.allocation.equity,
    );
    expect(INVESTMENT_PROFILES.moderate.allocation.equity).toBeLessThan(
      INVESTMENT_PROFILES.aggressive.allocation.equity,
    );
  });
});

describe("getGlidePathAllocation", () => {
  it("returns aggressive allocation for 30+ years", () => {
    const alloc = getGlidePathAllocation(35);
    expect(alloc.equity).toBeCloseTo(0.9, 2);
  });

  it("returns conservative allocation at 0 years", () => {
    const alloc = getGlidePathAllocation(0);
    expect(alloc.equity).toBeCloseTo(0.3, 2);
  });

  it("allocation sums to 1.0 at various points", () => {
    for (const years of [0, 5, 10, 15, 20, 25, 30, 35]) {
      const alloc = getGlidePathAllocation(years);
      const sum = alloc.equity + alloc.bonds + alloc.deposits;
      expect(sum).toBeCloseTo(1.0, 2);
    }
  });

  it("equity decreases monotonically as years decrease", () => {
    let prev = getGlidePathAllocation(30).equity;
    for (const years of [25, 20, 15, 10, 5, 0]) {
      const current = getGlidePathAllocation(years).equity;
      expect(current).toBeLessThanOrEqual(prev);
      prev = current;
    }
  });

  it("clamps negative years to 0", () => {
    const alloc = getGlidePathAllocation(-5);
    expect(alloc.equity).toBeCloseTo(0.3, 2);
  });
});

describe("getWeightedReturn", () => {
  it("returns equity return for 100% equity", () => {
    const ret = getWeightedReturn({ equity: 1, bonds: 0, deposits: 0 });
    expect(ret).toBeCloseTo(0.05, 4);
  });

  it("returns 0 for 100% deposits", () => {
    const ret = getWeightedReturn({ equity: 0, bonds: 0, deposits: 1 });
    expect(ret).toBeCloseTo(0, 4);
  });

  it("returns weighted average for moderate profile", () => {
    const alloc = INVESTMENT_PROFILES.moderate.allocation;
    const expected = 0.6 * 0.05 + 0.3 * 0.01 + 0.1 * 0;
    const ret = getWeightedReturn(alloc);
    expect(ret).toBeCloseTo(expected, 4);
  });
});
