/**
 * Automated comparison: our engine vs official SS calculator (ACBR0001)
 *
 * Generates a matrix of test cases and runs each through the SS calculator,
 * comparing against our engine output.
 *
 * Usage: npx tsx scripts/ss-playwright-compare.ts [--headed] [--filter=MAX]
 */
import { chromium, type Page } from "playwright";
import { calculateCurrentLaw } from "../src/engine/scenarios/current-law";
import type { UserProfile } from "../src/engine/types";

// ── Configuration ────────────────────────────────────────────────────

const SS_URL =
  "https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccess?ARQ.SPM.ACTION=LOGIN&ARQ.SPM.APPTYPE=SERVICE&ARQ.IDAPP=ACBR0001";

/** IPC rate reverse-engineered from SS flat-base cases */
const SS_INTERNAL_IPC = 0.01748;

// ── Test case types ──────────────────────────────────────────────────

interface SSTestCase {
  readonly id: string;
  readonly label: string;
  readonly birthDate: string; // dd/mm/yyyy
  readonly retirementDate: string; // dd/mm/yyyy
  readonly yearsContributed: number;
  readonly monthsContributed: number;
  readonly daysContributed: number;
  readonly monthlyBase: number;
  readonly incrementoAnual: number;
  readonly engineProfile: UserProfile;
  readonly engineConfig: {
    readonly currentYear: number;
    readonly ipcRate: number;
    readonly salaryGrowthRate: number;
  };
}

// ── Test case generation ─────────────────────────────────────────────

function makeBirthDate(age: number): string {
  const year = 2026 - age;
  return `11/03/${year}`;
}

function makeRetirementDate(age: number, retAge: number): string {
  const year = 2026 - age + retAge;
  return `11/03/${year}`;
}

/**
 * Compute the growth offset: how many years of future projections are trimmed
 * from the 348-month window start. This causes our engine's window bases to be
 * (1+g)^offset higher than the SS-entered base.
 */
function computeGrowthOffset(
  age: number,
  yearsWorked: number,
  retAge: number,
): number {
  const yearsToRetirement = retAge - age;
  const futureEntries = yearsToRetirement + 1;
  const futureMonths = futureEntries * 12;
  const pastMonths = yearsWorked * 12 + 3;
  const totalPool = pastMonths + futureMonths;
  const windowOffset = Math.max(0, totalPool - 348);
  const pastTrimmed = Math.min(pastMonths, windowOffset);
  const futureTrimmedMonths = windowOffset - pastTrimmed;
  return Math.floor(futureTrimmedMonths / 12);
}

function makeCase(params: {
  id: string;
  label: string;
  age: number;
  yearsWorked: number;
  monthlyBase: number;
  retirementAge: number;
  incremento: number;
}): SSTestCase {
  const {
    id,
    label,
    age,
    yearsWorked,
    monthlyBase,
    retirementAge,
    incremento,
  } = params;
  return {
    id,
    label,
    birthDate: makeBirthDate(age),
    retirementDate: makeRetirementDate(age, retirementAge),
    yearsContributed: yearsWorked,
    monthsContributed: 2,
    daysContributed: 24,
    monthlyBase,
    incrementoAnual: incremento,
    engineProfile: {
      age,
      monthlySalary: monthlyBase,
      salaryType: "gross",
      pagasExtra: true,
      ccaa: "madrid",
      yearsWorked,
      monthsContributed: yearsWorked * 12 + 3,
      desiredRetirementAge: retirementAge,
    },
    engineConfig: {
      currentYear: 2026,
      ipcRate: SS_INTERNAL_IPC,
      salaryGrowthRate: incremento / 100,
    },
  };
}

function generateTestCases(): SSTestCase[] {
  const cases: SSTestCase[] = [];

  // ── Matrix 1: Young profiles (32yo, 10y worked), flat ─────────────
  // Bases >= 3500 to avoid future base-minima rejection.
  // Past bases fall outside regulatory window → cleanest comparison.
  const bases = [3500, 4000, 4500, 5101];
  const retAges = [63, 64, 65, 66, 67, 68, 70];

  for (const base of bases) {
    const baseLabel = base === 5101 ? "MAX" : `B${base}`;
    for (const ret of retAges) {
      const retLabel =
        ret < 65
          ? `E${65 - ret}`
          : ret === 65
            ? "ORD"
            : ret === 67
              ? "N67"
              : `L${ret - 65}`;
      cases.push(
        makeCase({
          id: `Y32_${baseLabel}_${retLabel}`,
          label: `32yo ${baseLabel} ret@${ret}`,
          age: 32,
          yearsWorked: 10,
          monthlyBase: base,
          retirementAge: ret,
          incremento: 0,
        }),
      );
    }
  }

  // ── Matrix 2: Growth cases (32yo, various increments) ─────────────
  const growthCases: Array<{ base: number; inc: number }> = [
    { base: 3500, inc: 1 },
    { base: 3500, inc: 2 },
    { base: 4000, inc: 1 },
    { base: 4000, inc: 2 },
    { base: 5101, inc: 1 },
    { base: 5101, inc: 2 },
    // Growth that matches SS internal IPC (should give same as flat + IPC growth)
    { base: 3500, inc: 1.748 },
    { base: 5101, inc: 1.748 },
  ];

  for (const { base, inc } of growthCases) {
    const baseLabel = base === 5101 ? "MAX" : `B${base}`;
    const incLabel = inc === 1.748 ? "IPC" : `INC${inc}`;
    cases.push(
      makeCase({
        id: `Y32_${baseLabel}_${incLabel}`,
        label: `32yo ${baseLabel} +${inc}%`,
        age: 32,
        yearsWorked: 10,
        monthlyBase: base,
        retirementAge: 65,
        incremento: inc,
      }),
    );
  }

  // ── Matrix 3: Older profiles (40yo, 15y worked) ───────────────────
  for (const base of [3500, 4500, 5101]) {
    const baseLabel = base === 5101 ? "MAX" : `B${base}`;
    for (const ret of [65, 67]) {
      cases.push(
        makeCase({
          id: `Y40_${baseLabel}_R${ret}`,
          label: `40yo ${baseLabel} ret@${ret}`,
          age: 40,
          yearsWorked: 15,
          monthlyBase: base,
          retirementAge: ret,
          incremento: 0,
        }),
      );
    }
  }

  // ── Matrix 4: Near-retirement (55yo, 30y worked) ──────────────────
  for (const base of [3500, 5101]) {
    const baseLabel = base === 5101 ? "MAX" : `B${base}`;
    for (const ret of [63, 65, 67]) {
      cases.push(
        makeCase({
          id: `Y55_${baseLabel}_R${ret}`,
          label: `55yo ${baseLabel} ret@${ret}`,
          age: 55,
          yearsWorked: 30,
          monthlyBase: base,
          retirementAge: ret,
          incremento: 0,
        }),
      );
    }
  }

  return cases;
}

// ── Helpers ─────────────────────────────────────────────────────────

async function dismissModal(page: Page): Promise<string | null> {
  const modal = page.locator("#modal_dialogoMensajes");
  if (await modal.isVisible().catch(() => false)) {
    const text = (await modal.textContent())?.trim() ?? "";
    await modal
      .locator("button")
      .first()
      .click()
      .catch(() => {});
    await page.waitForTimeout(500);
    return text;
  }
  return null;
}

/** Fill desde/hasta date fields from the monthly input field range */
async function fillDesdeHasta(page: Page): Promise<void> {
  const allInputs = await page.locator('input[type="text"]').all();
  let firstMonth = "",
    lastMonth = "";
  for (const input of allInputs) {
    const name = await input.getAttribute("name");
    if (name && /^\d+_\d{4}$/.test(name)) {
      if (!firstMonth) firstMonth = name;
      lastMonth = name;
    }
  }

  if (firstMonth && lastMonth) {
    const [fm, fy] = firstMonth.split("_");
    const [lm, ly] = lastMonth.split("_");
    const desdeVal = `01/${fm.padStart(2, "0")}/${fy}`;
    const hastaVal = `01/${lm.padStart(2, "0")}/${ly}`;

    const desde = page.locator('input[name="desde"]');
    const hasta = page.locator('input[name="hasta"]');
    if (await desde.isVisible().catch(() => false)) {
      await desde.fill(desdeVal);
      await hasta.fill(hastaVal);
    }
  }
}

/**
 * Fill the porcentaje page contribution fields (anos, meses, dias).
 * Only fills if the fields are enabled (non-ordinary retirement).
 * Tries multiple selector strategies for the dias field.
 */
async function fillPorcentajeContrib(
  page: Page,
  totalYears: number,
  months: number,
  days: number,
): Promise<void> {
  const yearsInput = page.locator('input[name="añosCotizadosFuturos"]');
  if (!(await yearsInput.isEnabled().catch(() => false))) return;

  await yearsInput.fill(String(totalYears));

  const mesesInput = page.locator('input[name="mesesCotizadosFuturos"]');
  if (await mesesInput.isEnabled().catch(() => false)) {
    await mesesInput.fill(String(months));
  }

  // Try multiple selectors for dias field (accent variations)
  const diasSelectors = [
    'input[name="diasCotizadosFuturos"]',
    'input[name="díasCotizadosFuturos"]',
  ];

  let diasFilled = false;
  for (const sel of diasSelectors) {
    const diasInput = page.locator(sel);
    if (await diasInput.isEnabled().catch(() => false)) {
      await diasInput.fill(String(days));
      diasFilled = true;
      break;
    }
  }

  // Fallback: find any input near a "días" or "dias" label
  if (!diasFilled) {
    const allInputs = await page.locator("input[type='text']").all();
    for (const input of allInputs) {
      const name = (await input.getAttribute("name")) ?? "";
      if (
        name.toLowerCase().includes("dias") &&
        name.toLowerCase().includes("cotizado")
      ) {
        if (await input.isEnabled().catch(() => false)) {
          await input.fill(String(days));
          diasFilled = true;
          break;
        }
      }
    }
  }

  // Last resort: try getByRole with label
  if (!diasFilled) {
    try {
      const diasByLabel = page.getByRole("textbox", { name: /d[ií]as/i });
      if (await diasByLabel.isEnabled().catch(() => false)) {
        await diasByLabel.fill(String(days));
      }
    } catch {
      // Give up on dias field
    }
  }
}

// ── SS Calculator Flow ──────────────────────────────────────────────

interface SSResult {
  baseReguladora: number;
  porcentaje: number;
  pensionInicial: number;
  pensionMaxima: number;
  error?: string;
}

const EMPTY_RESULT: SSResult = {
  baseReguladora: 0,
  porcentaje: 0,
  pensionInicial: 0,
  pensionMaxima: 0,
};

async function runSSCase(page: Page, tc: SSTestCase): Promise<SSResult> {
  // ── Step 1: Navigate & start ──────────────────────────────────
  await page.goto(SS_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(2000);

  // ── Step 2: Datos personales ──────────────────────────────────
  await page.getByRole("textbox", { name: "(*) Nombre" }).fill("Test");
  await page.getByRole("textbox", { name: "(*) Apellidos" }).fill("Caso");
  await page
    .getByRole("textbox", { name: "(*) Fecha de nacimiento" })
    .fill(tc.birthDate);
  await page
    .getByRole("textbox", { name: "Años" })
    .fill(String(tc.yearsContributed));
  await page
    .getByRole("textbox", { name: "Meses" })
    .fill(String(tc.monthsContributed));
  await page
    .getByRole("textbox", { name: "Días" })
    .fill(String(tc.daysContributed));
  await page
    .getByRole("button", { name: "Calcular fecha de jubilación" })
    .click();
  await page.waitForTimeout(2000);

  // Set retirement date (on same page, after calculation)
  const dateField = page.getByRole("textbox", {
    name: "(*) Fecha de jubilación",
  });
  await dateField.click({ clickCount: 3 });
  await dateField.fill(tc.retirementDate);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(2000);

  let modalMsg = await dismissModal(page);
  if (modalMsg) return { ...EMPTY_RESULT, error: `Step2 modal: ${modalMsg}` };

  // ── Step 3: Cotizaciones pasadas ──────────────────────────────
  const noPastBases = page.locator(
    "text=no existen bases de cotización pasadas",
  );
  const hasPastBases = !(await noPastBases.isVisible().catch(() => false));

  if (hasPastBases) {
    await fillDesdeHasta(page);
    const baseMinBtn = page.getByRole("button", { name: "Base mínima" });
    if (await baseMinBtn.isVisible().catch(() => false)) {
      await baseMinBtn.click();
      await page.waitForTimeout(1500);
      modalMsg = await dismissModal(page);
      if (modalMsg) {
        console.error(
          `    Note: past base minima modal: ${modalMsg.substring(0, 80)}`,
        );
      }
    }
  }

  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(2000);
  modalMsg = await dismissModal(page);
  if (modalMsg) return { ...EMPTY_RESULT, error: `Step3 modal: ${modalMsg}` };

  // ── Step 4: Cotizaciones futuras ──────────────────────────────
  const futureBaseInput = page.locator('input[name="basePersonalizada"]');
  if (await futureBaseInput.isVisible().catch(() => false)) {
    await futureBaseInput.fill(String(tc.monthlyBase));
    const futureIncInput = page.locator('input[name="incrementoAnual"]');
    if (await futureIncInput.isVisible().catch(() => false)) {
      await futureIncInput.fill(String(tc.incrementoAnual));
    }

    await fillDesdeHasta(page);

    const rellenarBtn = page.getByRole("button", { name: "Rellenar" });
    if (await rellenarBtn.isVisible().catch(() => false)) {
      await rellenarBtn.click();
      await page.waitForTimeout(1500);
      modalMsg = await dismissModal(page);
      if (modalMsg)
        return { ...EMPTY_RESULT, error: `Step4 fill modal: ${modalMsg}` };
    } else {
      return { ...EMPTY_RESULT, error: "Step4: Rellenar button not found" };
    }

    // Verify at least one field was filled
    const firstField = await page.locator('input[type="text"]').all();
    let anyFilled = false;
    for (const f of firstField) {
      const name = await f.getAttribute("name");
      if (name && /^\d+_\d{4}$/.test(name)) {
        const val = await f.inputValue().catch(() => "");
        if (val && val !== "0" && val !== "") {
          anyFilled = true;
          break;
        }
      }
    }
    if (!anyFilled) {
      return {
        ...EMPTY_RESULT,
        error: "Step4: Rellenar did not fill monthly fields",
      };
    }
  } else {
    return { ...EMPTY_RESULT, error: "Step4: basePersonalizada not found" };
  }

  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(2000);
  modalMsg = await dismissModal(page);
  if (modalMsg)
    return { ...EMPTY_RESULT, error: `Step4 continuar modal: ${modalMsg}` };

  // ── Step 5: Porcentaje ────────────────────────────────────────
  const totalYears =
    tc.yearsContributed +
    Math.round(tc.engineProfile.desiredRetirementAge - tc.engineProfile.age);
  await fillPorcentajeContrib(
    page,
    totalYears,
    tc.monthsContributed,
    tc.daysContributed,
  );

  const pctBtn = page.locator('button[name="SPM.ACC.PORCENTAJE_CONTINUAR"]');
  if (await pctBtn.isVisible().catch(() => false)) {
    await pctBtn.click();
  } else {
    await page.getByRole("button", { name: "Continuar" }).click();
  }
  await page.waitForTimeout(2000);
  modalMsg = await dismissModal(page);
  if (modalMsg) return { ...EMPTY_RESULT, error: `Step5 modal: ${modalMsg}` };

  // ── Step 6: Confirmacion → resultado ──────────────────────────
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(2500);

  // ── Step 7: Extract results ───────────────────────────────────
  const mainText =
    (await page.locator("main, body").first().textContent()) ?? "";
  const n = mainText.replace(/\s+/g, " ").trim();

  const parseEuro = (m: RegExpMatchArray | null): number =>
    m ? parseFloat(m[1].replace(/\./g, "").replace(",", ".")) : 0;

  const baseReguladora = parseEuro(
    n.match(/Base reguladora\s*(\d[\d.,]*)\s*€/i),
  );
  const porcentaje = parseEuro(
    n.match(/Porcentaje aplicable:\s*(\d[\d.,]*)%/i),
  );
  const pensionInicial = parseEuro(
    n.match(/Pensi[oó]n inicial\s*=.*?=\s*(\d[\d.,]*)\s*€/i),
  );
  const pensionMaxima = parseEuro(
    n.match(/Pensi[oó]n m[aá]xima estimada\s*=\s*(\d[\d.,]*)\s*€/i),
  );

  if (baseReguladora === 0 && pensionInicial === 0) {
    const altPension = parseEuro(
      n.match(
        /Pensi[oó]n\s*(?:mensual|anual|inicial)?\s*[:=]\s*(\d[\d.,]*)\s*€/i,
      ),
    );
    if (altPension > 0) {
      return {
        baseReguladora: 0,
        porcentaje: 0,
        pensionInicial: altPension,
        pensionMaxima: 0,
      };
    }
    const snippet = n.substring(0, 500);
    return { ...EMPTY_RESULT, error: `No results. Snippet: ${snippet}` };
  }

  return { baseReguladora, porcentaje, pensionInicial, pensionMaxima };
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const headed = args.includes("--headed");
  const filterArg = args.find((a) => a.startsWith("--filter="));
  const filter = filterArg ? filterArg.split("=")[1] : null;

  let allCases = generateTestCases();
  if (filter) {
    allCases = allCases.filter(
      (tc) =>
        tc.id.includes(filter.toUpperCase()) ||
        tc.label.toLowerCase().includes(filter.toLowerCase()),
    );
  }

  console.error(
    `Running ${allCases.length} cases against SS calculator (${headed ? "headed" : "headless"})...`,
  );

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  interface ResultRow {
    id: string;
    label: string;
    ss: SSResult;
    enginePension: number;
    engineBaseReg: number;
    delta: number;
    deltaPct: string;
    adjDeltaPct: string; // delta after adjusting for growth offset
  }

  const results: ResultRow[] = [];

  for (const tc of allCases) {
    console.error(`  [${results.length + 1}/${allCases.length}] ${tc.id}...`);
    try {
      const ss = await runSSCase(page, tc);
      const eng = calculateCurrentLaw(tc.engineProfile, tc.engineConfig);

      const delta = eng.monthlyPension - ss.pensionInicial;
      const deltaPct =
        ss.pensionInicial > 0
          ? ((delta / ss.pensionInicial) * 100).toFixed(2)
          : "N/A";

      // Adjusted delta: remove the known growth-offset effect.
      // Our engine's window bases are (1+g)^offset higher than SS's entered base.
      const g = tc.engineConfig.salaryGrowthRate;
      const offset = computeGrowthOffset(
        tc.engineProfile.age,
        tc.engineProfile.yearsWorked,
        tc.engineProfile.desiredRetirementAge,
      );
      const offsetFactor = g > 0 ? Math.pow(1 + g, offset) : 1;
      const adjEnginePension = eng.monthlyPension / offsetFactor;
      const adjDelta = adjEnginePension - ss.pensionInicial;
      const adjDeltaPct =
        ss.pensionInicial > 0
          ? ((adjDelta / ss.pensionInicial) * 100).toFixed(2)
          : "N/A";

      results.push({
        id: tc.id,
        label: tc.label,
        ss,
        enginePension: eng.monthlyPension,
        engineBaseReg: eng.baseReguladora,
        delta,
        deltaPct,
        adjDeltaPct,
      });

      if (ss.error) console.error(`    WARN: ${ss.error.substring(0, 120)}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message.substring(0, 200) : String(err);
      console.error(`    FAIL: ${msg}`);
      results.push({
        id: tc.id,
        label: tc.label,
        ss: { ...EMPTY_RESULT, error: msg },
        enginePension: 0,
        engineBaseReg: 0,
        delta: 0,
        deltaPct: "ERR",
        adjDeltaPct: "ERR",
      });
    }
    await page.waitForTimeout(300);
  }

  await browser.close();

  // ── Output ──────────────────────────────────────────────────────

  console.log("# Comparacion Motor vs SS Oficial (Playwright)");
  console.log(`Fecha: ${new Date().toISOString().split("T")[0]}`);
  console.log(`IPC motor: ${(SS_INTERNAL_IPC * 100).toFixed(3)}%`);
  console.log(`Casos: ${allCases.length}\n`);

  console.log(
    "| id | label | ss_pension | ss_base_reg | ss_pct | eng_pension | eng_base_reg | delta_pct | adj_delta_pct | notas |",
  );
  console.log("|---|---|---:|---:|---:|---:|---:|---:|---:|---|");

  for (const r of results) {
    const notes = r.ss.error ? `WARN: ${r.ss.error.substring(0, 50)}` : "";
    console.log(
      `| ${r.id} | ${r.label} | ${r.ss.pensionInicial.toFixed(2)} | ${r.ss.baseReguladora.toFixed(2)} | ${r.ss.porcentaje}% | ${r.enginePension.toFixed(2)} | ${r.engineBaseReg.toFixed(2)} | ${r.deltaPct}% | ${r.adjDeltaPct}% | ${notes} |`,
    );
  }

  // ── Summary by category ─────────────────────────────────────────
  const valid = results.filter((r) => r.ss.pensionInicial > 0 && !r.ss.error);
  const young = valid.filter(
    (r) =>
      r.id.startsWith("Y32_") && !r.id.includes("INC") && !r.id.includes("IPC"),
  );
  const growth = valid.filter(
    (r) => r.id.includes("INC") || r.id.includes("IPC"),
  );
  const mid = valid.filter((r) => r.id.startsWith("Y40_"));
  const old = valid.filter((r) => r.id.startsWith("Y55_"));

  function summarize(label: string, rows: ResultRow[]) {
    if (rows.length === 0) return;
    const deltas = rows.map((r) => parseFloat(r.deltaPct));
    const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
    const absDeltas = deltas.map(Math.abs);
    const max = Math.max(...absDeltas);
    const min = Math.min(...absDeltas);
    const within1pct = deltas.filter((d) => Math.abs(d) <= 1).length;
    const within5pct = deltas.filter((d) => Math.abs(d) <= 5).length;
    console.log(`\n### ${label} (${rows.length} cases)`);
    console.log(`- Avg delta: ${avg.toFixed(2)}%`);
    console.log(`- Min/Max |delta|: ${min.toFixed(2)}% / ${max.toFixed(2)}%`);
    console.log(`- Within 1%: ${within1pct}/${rows.length}`);
    console.log(`- Within 5%: ${within5pct}/${rows.length}`);
  }

  console.log("\n## Resumen por categoria");
  summarize("32yo flat (cleanest comparison)", young);
  summarize("32yo with growth", growth);
  summarize("40yo (some past in window)", mid);
  summarize("55yo (large past component)", old);
  summarize("All valid cases", valid);
}

main().catch(console.error);
