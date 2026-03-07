// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SalaryInput } from "../../src/components/input/SalaryInput";

afterEach(() => {
  vi.useRealTimers();
});

describe("SalaryInput", () => {
  it("shows gross salary as an annual amount and converts it back to the internal monthly value", () => {
    vi.useFakeTimers();
    const onSalaryChange = vi.fn();

    render(
      <SalaryInput
        salary={4000}
        salaryType="gross"
        pagasExtra={false}
        onSalaryChange={onSalaryChange}
        onSalaryTypeChange={vi.fn()}
        onPagasExtraChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Salario bruto anual");
    expect(input).toHaveValue(48000);

    fireEvent.change(input, { target: { value: "60000" } });
    vi.advanceTimersByTime(350);

    expect(onSalaryChange).toHaveBeenCalledWith(5000);
    expect(
      screen.getByText(/En bruto anual no hace falta elegir 12 o 14 pagas/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Pagas al ano")).not.toBeInTheDocument();
  });

  it("keeps the 12/14-pay selector visible in net mode", () => {
    render(
      <SalaryInput
        salary={2200}
        salaryType="net"
        pagasExtra={true}
        onSalaryChange={vi.fn()}
        onSalaryTypeChange={vi.fn()}
        onPagasExtraChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Ingreso neto al mes")).toHaveValue(2200);
    expect(screen.getByText("Pagas al ano")).toBeInTheDocument();
  });
});
