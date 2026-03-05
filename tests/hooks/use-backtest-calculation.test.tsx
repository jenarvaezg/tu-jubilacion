// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBacktestCalculation } from "../../src/hooks/use-backtest-calculation";

describe("useBacktestCalculation", () => {
  const validParams = {
    initialBalance: 25000,
    monthlyContribution: 200,
    yearsOfAccumulation: 30,
    drawdownYears: 20,
    seriesId: "sp500" as const,
  };

  it("returns a summary for valid inputs", () => {
    const { result } = renderHook(() => useBacktestCalculation(validParams));

    expect(result.current.error).toBeNull();
    expect(result.current.summary).not.toBeNull();
    expect(result.current.summary?.seriesId).toBe("sp500");
    expect(result.current.summary?.initialBalance).toBe(25000);
    expect(result.current.summary?.totalCohorts).toBeGreaterThan(0);
  });

  it("returns a summary when only an initial balance exists", () => {
    const { result } = renderHook(() =>
      useBacktestCalculation({
        ...validParams,
        monthlyContribution: 0,
      }),
    );

    expect(result.current.summary).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("returns null summary when inputs are not actionable", () => {
    const { result } = renderHook(() =>
      useBacktestCalculation({
        ...validParams,
        initialBalance: 0,
        monthlyContribution: 0,
      }),
    );

    expect(result.current.summary).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("recomputes when the selected series changes", () => {
    const { result, rerender } = renderHook(
      (params: typeof validParams) => useBacktestCalculation(params),
      {
        initialProps: validParams,
      },
    );

    rerender({
      ...validParams,
      seriesId: "msci-world",
    });

    expect(result.current.error).toBeNull();
    expect(result.current.summary?.seriesId).toBe("msci-world");
  });
});
