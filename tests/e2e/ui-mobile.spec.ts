import { test, expect, devices } from "@playwright/test";

test.use({
  ...devices["Pixel 7"],
});

test("mantiene legibilidad y evita overflow horizontal en movil", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  const pageMetrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(pageMetrics.scrollWidth).toBeLessThanOrEqual(
    pageMetrics.innerWidth + 1,
  );

  await expect(page.getByText("Analisis multi-escenario")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Propuesta FEDEA" }),
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

  await page.getByText("Brecha de ingresos a cubrir").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("combined-income-chart")).toBeVisible();

  await page
    .getByText("Como construyes tu complemento privado")
    .scrollIntoViewIfNeeded();
  await expect(page.getByTestId("comparison-chart-legend")).toBeVisible();

  await page
    .getByText("Simulacion historica por cohorte")
    .scrollIntoViewIfNeeded();
  await expect(page.getByText("Euros reales")).toBeVisible();
});
