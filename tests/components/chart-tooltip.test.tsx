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
});
