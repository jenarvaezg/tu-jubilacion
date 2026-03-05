import { test } from '@playwright/test';

const LOGIN_URL = 'https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccess?ARQ.SPM.ACTION=LOGIN&ARQ.SPM.APPTYPE=SERVICE&ARQ.IDAPP=ACBR0001&utm_source=prestaciones.seg-social.es&utm_medium=referral&utm_campaign=Prestaciones';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

test('inspect SS browser flow payloads', async ({ playwright }) => {
  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const posts: Array<{
    index: number;
    action: string;
    pageName: string;
    keyCount: number;
    keys: string[];
    sample: Record<string, string>;
  }> = [];

  page.on('request', async (req) => {
    if (req.method() !== 'POST' || !req.url().includes('OnlineAccessUtf8')) return;
    const raw = req.postData() ?? '';
    const params = new URLSearchParams(raw);
    const keys = [...params.keys()];
    const actionKey = keys.find((k) => k.startsWith('SPM.ACC.')) ?? '-';
    const sampleKeys = [
      'fechaNacimiento',
      'aniosCotizados',
      'mesesCotizados',
      'diasCotizados',
      'seguirCotizando',
      'legislacion',
      'fechaJubilacion',
      'añosCotizadosFuturos',
      'mesesCotizadosFuturos',
      'diasCotizadosFuturos',
      'aniosDeJubilacion',
      'mesesDeJubilacion',
      'diasDeJubilacion',
      'incrementoAnual',
    ];
    const sample: Record<string, string> = {};
    for (const k of sampleKeys) {
      const v = params.get(k);
      if (v !== null) sample[k] = v;
    }

    posts.push({
      index: posts.length + 1,
      action: actionKey,
      pageName: await page.title(),
      keyCount: keys.length,
      keys,
      sample,
    });
  });

  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

  await page.locator('[name="SPM.ACC.INICIO"]').first().click();

  await page.fill('#nombre', 'Jose');
  await page.fill('#apellidos', 'Prueba');
  await page.fill('#fechaNacimiento', '11/03/1994');
  await page.fill('#aniosCotizados', '10');
  await page.fill('#mesesCotizados', '2');
  await page.fill('#diasCotizados', '24');
  await page.check('input[name="seguirCotizando"][value="1"]');
  await page.check('input[name="legislacion"][value="1"]');
  await page.locator('[name="SPM.ACC.DATOSPERSONALES_CONTINUAR"]').click();

  await page.fill('#fechaJubilacion', '11/03/2057');
  await page.locator('[name="SPM.ACC.DATOSJUBILACION_CONTINUAR"]').click();

  await page.locator('[name="SPM.ACC.COTIZACIONESPASADAS_CONTINUAR"]').click();

  await page.fill('#incrementoAnual', '2');
  const monthInputs = page.locator('input[name^="1_"] , input[name^="2_"] , input[name^="3_"] , input[name^="4_"] , input[name^="5_"] , input[name^="6_"] , input[name^="7_"] , input[name^="8_"] , input[name^="9_"] , input[name^="10_"] , input[name^="11_"] , input[name^="12_"]');
  const count = await monthInputs.count();
  for (let i = 0; i < count; i++) {
    const input = monthInputs.nth(i);
    const name = await input.getAttribute('name');
    if (!name) continue;
    const m = name.match(/^(\d+)_(\d{4})$/);
    if (!m) continue;
    const year = Number(m[2]);
    const value = (5101 * Math.pow(1.02, year - 2026)).toFixed(2).replace('.', ',');
    await input.fill(value);
  }
  await page.locator('[name="SPM.ACC.COTIZACIONESFUTURAS_CONTINUAR"]').click();

  const y = await page.locator('#añosCotizadosFuturos').inputValue();
  const m = await page.locator('#mesesCotizadosFuturos').inputValue();
  const d = await page.locator('#diasCotizadosFuturos').inputValue();
  console.log('BC06 visible future cotizados:', { y, m, d });

  await page.locator('[name="SPM.ACC.PORCENTAJE_CONTINUAR"]').click();
  await page.locator('[name="SPM.ACC.CONFIRMACION_CONTINUAR"]').click();

  const pension = await page.locator('text=/Pensión inicial|pensionInicial/i').first().textContent().catch(() => null);
  console.log('Final page title:', await page.title());
  console.log('Final pension text snippet:', pension);

  console.log('--- POST TRACE START ---');
  for (const p of posts) {
    console.log(JSON.stringify({
      index: p.index,
      action: p.action,
      keyCount: p.keyCount,
      sample: p.sample,
    }));
  }
  console.log('--- POST TRACE END ---');

  await context.close();
  await browser.close();
});
