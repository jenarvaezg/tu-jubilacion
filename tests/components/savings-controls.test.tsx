// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ContributionOverrideControl } from "../../src/components/savings/ContributionOverrideControl";
import { CurrentSavingsBalanceControl } from "../../src/components/savings/CurrentSavingsBalanceControl";
import { DrawdownYearsControl } from "../../src/components/savings/DrawdownYearsControl";

describe("CurrentSavingsBalanceControl", () => {
  it("allows clearing the input and commits on blur", () => {
    const dispatch = vi.fn();

    render(
      <CurrentSavingsBalanceControl
        currentSavingsBalance={25000}
        dispatch={dispatch}
      />,
    );

    fireEvent.change(screen.getByLabelText("Ahorro actual para jubilación"), {
      target: { value: "" },
    });

    expect(dispatch).not.toHaveBeenCalled();

    fireEvent.blur(screen.getByLabelText("Ahorro actual para jubilación"));

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_CURRENT_SAVINGS_BALANCE",
      payload: 0,
    });
  });
});

describe("ContributionOverrideControl", () => {
  it("dispatches a manual monthly contribution override", () => {
    const dispatch = vi.fn();

    render(
      <ContributionOverrideControl
        currentContribution={250}
        isOverride={false}
        dispatch={dispatch}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    fireEvent.change(
      screen.getByLabelText("Aportación mensual personalizada"),
      {
        target: { value: "300" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_MONTHLY_CONTRIBUTION",
      payload: 300,
    });
  });

  it("restores automatic mode when reset is clicked", () => {
    const dispatch = vi.fn();

    render(
      <ContributionOverrideControl
        currentContribution={300}
        isOverride={true}
        dispatch={dispatch}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Modo auto/i }));

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_MONTHLY_CONTRIBUTION",
      payload: null,
    });
  });
});

describe("DrawdownYearsControl", () => {
  it("dispatches drawdown year changes and can restore the derived default", () => {
    const dispatch = vi.fn();

    render(
      <DrawdownYearsControl
        drawdownYears={18}
        derivedDefault={21}
        isOverride={true}
        dispatch={dispatch}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(
        "Durante cuántos años quieres complementar tus ingresos",
      ),
      {
        target: { value: "24" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /Restaurar defecto/i }));

    expect(screen.getByText("Derivado: 21 años")).toBeInTheDocument();
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: "SET_DRAWDOWN_YEARS",
      payload: 24,
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: "SET_DRAWDOWN_YEARS",
      payload: null,
    });
  });
});
