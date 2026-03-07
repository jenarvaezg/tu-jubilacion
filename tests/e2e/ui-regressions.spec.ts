import { test, expect } from "@playwright/test";

test("mantiene visibles los cambios clave de pension y ahorro", async ({
  page,
}) => {
  await page.goto("/");
  // Wait for the app to load
  await page.waitForSelector("h1", { state: "visible" });

  // Dismiss welcome banner if present
  const startBtn = page.getByText(/Iniciar simulación/i);
  if (await startBtn.isVisible()) {
    await startBtn.click();
  }

  // Check for global errors
  const errorBlock = page.getByTestId("global-error");
  if (await errorBlock.isVisible()) {
    const msg = await errorBlock.textContent();
    throw new Error(`App showed global error: ${msg}`);
  }

  // Scroll to results summary
  const summaryHeader = page.getByText(/Análisis de Sensibilidad/i);
  await summaryHeader.scrollIntoViewIfNeeded();
  await expect(summaryHeader).toBeVisible();
  
  // Open the collapsible to see all scenarios
  await page.getByText(/Desglosar todos los escenarios/i).click();
  
  await expect(
    page.getByRole("heading", { name: "PROPUESTA FEDEA" }),
  ).toBeVisible();

  // Scroll to savings section
  await page.getByText(/Estrategia de Complemento Privado/i).scrollIntoViewIfNeeded();

  await expect(page.getByText("Letras (EEUU)")).toHaveCount(0);
  await expect(
    page.getByText("Letras Tesoro").first(),
  ).toBeVisible();
  await expect(
    page.getByText("Horizonte de Complemento Privado"),
  ).toBeVisible();

  // Use ID directly for the input to be more resilient
  const currentSavingsInput = page.locator("#current-savings-balance");
  await currentSavingsInput.scrollIntoViewIfNeeded();
  await currentSavingsInput.fill("");
  await expect(currentSavingsInput).toHaveValue("");
  await currentSavingsInput.press("Tab");
  await expect(currentSavingsInput).toHaveValue("0");

  const heroSvgTexts = await page
    .getByTestId("hero-chart")
    .locator(".recharts-surface text")
    .allTextContents();
  // Check if some numbers are present (ages or currency)
  expect(heroSvgTexts.length).toBeGreaterThan(0);

  const comparisonChart = page.getByTestId("comparison-chart");
  await expect(comparisonChart).toBeVisible();

  await expect(page.getByTestId("combined-income-chart")).toContainText(
    "Plan Total",
  );
});
