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
    page.getByRole("heading", { name: "Transicion FEDEA" }),
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
