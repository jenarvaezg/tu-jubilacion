// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartTooltip } from "../../src/components/chart/ChartTooltip";

describe("ChartTooltip", () => {
  it("renders the combined pension-plus-savings row when present", () => {
    render(
      <ChartTooltip
        active={true}
        label={67}
        displayMode="real"
        payload={[
          {
            dataKey: "current-law",
            value: 1200,
            color: "#2563eb",
            payload: {
              age: 67,
              year: 2058,
              "current-law__real": 1200,
              "current-law__nominal": 1600,
              "pension-plus-savings": 1800,
            },
          },
          {
            dataKey: "pension-plus-savings",
            value: 1800,
            color: "#059669",
            payload: {
              age: 67,
              year: 2058,
              "current-law__real": 1200,
              "current-law__nominal": 1600,
              "pension-plus-savings": 1800,
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("Edad 67")).toBeInTheDocument();
    expect(screen.getByText("Ingreso total")).toBeInTheDocument();
  });

  it("renders scenario rows even when recharts only passes a partial payload", () => {
    render(
      <ChartTooltip
        active={true}
        label={67}
        displayMode="real"
        payload={[
          {
            dataKey: "hover-proxy",
            value: 1200,
            color: "#2563eb",
            payload: {
              age: 67,
              year: 2058,
              "current-law": 1200,
              "current-law__real": 1200,
              "current-law__nominal": 1600,
              "fedea-transition": 1100,
              "fedea-transition__real": 1100,
              "fedea-transition__nominal": 1500,
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("Ley actual")).toBeInTheDocument();
    expect(screen.getByText("Propuesta FEDEA")).toBeInTheDocument();
  });
});
