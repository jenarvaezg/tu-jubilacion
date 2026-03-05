// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BacktestSection } from "../../src/components/backtest/BacktestSection";

describe("BacktestSection", () => {
  const defaultProps = {
    currentSavingsBalance: 25000,
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
    expect(screen.getByText(/Series historicas en USD/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ver fuentes y limites/i }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByText(/Incluye tu ahorro actual como capital inicial/i),
    ).toBeInTheDocument();
  });

  it("renders backtest summary card", () => {
    render(<BacktestSection {...defaultProps} />);
    expect(screen.getByText("Resultados del backtest")).toBeInTheDocument();
  });

  it("updates source attribution when MSCI World is selected", () => {
    render(<BacktestSection {...defaultProps} />);

    const msciButton = screen.getByRole("button", { name: /MSCI World/i });
    fireEvent.click(msciButton);
    expect(msciButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /Ver fuentes y limites/i }));

    expect(
      screen.getByText(/MSCI World Gross Total Return Index/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No incluye comisiones, impuestos ni conversion/i),
    ).toBeInTheDocument();
  });

  it("returns null when contribution is zero", () => {
    const { container } = render(
      <BacktestSection
        {...defaultProps}
        currentSavingsBalance={0}
        monthlyContribution={0}
      />,
    );
    expect(container.innerHTML).toBe("");
  });
});
