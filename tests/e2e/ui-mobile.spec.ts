import { test, expect, devices } from "@playwright/test";

test.use({
  ...devices["Pixel 7"],
});

test("mantiene legibilidad y evita overflow horizontal en movil", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Dismiss welcome banner if present
  const startBtn = page.getByText(/Iniciar simulación/i);
  if (await startBtn.isVisible()) {
    await startBtn.click();
  }

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  const pageMetrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(pageMetrics.scrollWidth).toBeLessThanOrEqual(
    pageMetrics.innerWidth + 1,
  );

  await expect(page.getByText(/Análisis de Sensibilidad/i)).toBeVisible();
  
  // Open the collapsible to see all scenarios
  await page.getByText(/Desglosar todos los escenarios/i).click();

  await expect(
    page.getByRole("heading", { name: "PROPUESTA FEDEA" }),
  ).toBeVisible();

  const heroSurface = page
    .getByTestId("hero-chart")
    .locator(".recharts-surface");
  const heroBox = await heroSurface.boundingBox();
  expect(heroBox).not.toBeNull();
  if (heroBox) {
    await heroSurface.click({
      position: {
        x: heroBox.width * 0.7,
        y: heroBox.height * 0.35,
      },
    });
  }
  await expect(
    page.getByText(/equivalente real \(hoy\):/).first(),
  ).toBeVisible();

  await page.getByText("Auditoría de Brecha de Ingresos").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("combined-income-chart")).toBeVisible();

  await page
    .getByText("Dinámica de Acumulación Patrimonial")
    .scrollIntoViewIfNeeded();
  await expect(page.getByTestId("comparison-chart-legend")).toBeVisible();

  await page
    .getByText("Simulación histórica por cohorte")
    .scrollIntoViewIfNeeded();
  await expect(page.getByText("Euros reales")).toBeVisible();
});
