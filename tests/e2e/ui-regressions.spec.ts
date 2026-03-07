import { test, expect } from "@playwright/test";

test("mantiene visibles los cambios clave de pension y ahorro", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Análisis multi-escenario")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Propuesta FEDEA" }),
  ).toBeVisible();

  await expect(page.getByText("Letras (EEUU)")).toHaveCount(0);
  await expect(
    page.getByText("Letras Tesoro / liquidez").first(),
  ).toBeVisible();
  await expect(
    page.getByText("Durante cuántos años quieres complementar tus ingresos"),
  ).toBeVisible();

  const currentSavingsInput = page.getByLabel("Ahorro actual para jubilación");
  await currentSavingsInput.fill("");
  await expect(currentSavingsInput).toHaveValue("");
  await currentSavingsInput.press("Tab");
  await expect(currentSavingsInput).toHaveValue("0");

  const heroSvgTexts = await page
    .getByTestId("hero-chart")
    .locator(".recharts-surface text")
    .allTextContents();
  expect(heroSvgTexts).toContain("60");
  expect(heroSvgTexts).not.toContain("30");

  const comparisonChart = page.getByTestId("comparison-chart");
  const chartBox = await comparisonChart
    .locator(".recharts-wrapper")
    .boundingBox();
  const legendBox = await page
    .getByTestId("comparison-chart-legend")
    .boundingBox();

  expect(chartBox).not.toBeNull();
  expect(legendBox).not.toBeNull();
  if (chartBox && legendBox) {
    expect(legendBox.y).toBeGreaterThan(chartBox.y + chartBox.height - 8);
  }

  await expect(page.getByTestId("combined-income-chart")).toContainText(
    "Plan total",
  );
});
