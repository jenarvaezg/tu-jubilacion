// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BacktestSection } from "../../src/components/backtest/BacktestSection";

describe("BacktestSection", () => {
  const defaultProps = {
    monthlyContribution: 300,
    yearsOfAccumulation: 30,
    drawdownYears: 20,
  };

  it("renders the section heading", () => {
    render(<BacktestSection {...defaultProps} />);
    expect(
      screen.getByText("Como Habria Ido Historicamente"),
    ).toBeInTheDocument();
  });

  it("renders all 4 asset class selector options", () => {
    render(<BacktestSection {...defaultProps} />);
    expect(screen.getByText("S&P 500 (EEUU)")).toBeInTheDocument();
    expect(screen.getByText("MSCI World")).toBeInTheDocument();
    expect(screen.getByText("Bonos 10A (EEUU)")).toBeInTheDocument();
    expect(screen.getByText("Letras (EEUU)")).toBeInTheDocument();
  });

  it("renders the disclaimer callout", () => {
    render(<BacktestSection {...defaultProps} />);
    expect(
      screen.getByText("Rendimientos pasados no garantizan resultados futuros"),
    ).toBeInTheDocument();
  });

  it("renders backtest summary card", () => {
    render(<BacktestSection {...defaultProps} />);
    expect(screen.getByText("Resultados del backtest")).toBeInTheDocument();
  });

  it("returns null when contribution is zero", () => {
    const { container } = render(
      <BacktestSection {...defaultProps} monthlyContribution={0} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
