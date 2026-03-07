import { chromium } from '@playwright/test';
import * as path from 'path';

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    background: #fdfcfb;
    font-family: 'Charter', 'Bitstream Charter', 'Sitka Text', 'Cambria', 'Georgia', serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px;
    position: relative;
    overflow: hidden;
    color: #0f172a;
  }
  .border-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 12px;
    background: #0f172a;
  }
  .accent-bar {
    position: absolute;
    top: 80px;
    left: 80px;
    width: 60px;
    height: 4px;
    background: #c2410c;
  }
  .logo-text {
    font-family: ui-monospace, monospace;
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 4px;
    margin-bottom: 40px;
  }
  .title {
    font-size: 84px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1;
    letter-spacing: -3px;
    margin-bottom: 32px;
    max-width: 900px;
  }
  .title span {
    color: #c2410c;
    font-style: italic;
  }
  .subtitle {
    font-size: 32px;
    font-style: italic;
    color: #475569;
    line-height: 1.4;
    max-width: 800px;
    margin-bottom: 60px;
  }
  .footer {
    position: absolute;
    bottom: 80px;
    left: 80px;
    right: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(15, 23, 42, 0.1);
    padding-top: 32px;
  }
  .badge-container {
    display: flex;
    gap: 16px;
  }
  .badge {
    border: 1px solid rgba(15, 23, 42, 0.2);
    padding: 6px 12px;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .domain {
    font-family: ui-monospace, monospace;
    font-size: 14px;
    color: #0f172a;
    font-weight: bold;
  }
</style>
</head>
<body>
  <div class="border-top"></div>
  <div class="accent-bar"></div>
  <div class="logo-text">Tu Jubilación</div>
  <div class="title">Análisis de<br /><span>Sostenibilidad</span></div>
  <div class="subtitle">Calculadora interactiva de pensión pública y planificación de ahorro complementario.</div>
  <div class="footer">
    <div class="badge-container">
      <div class="badge">Modelado SS/IRPF 2025</div>
      <div class="badge">Datos INE 2023</div>
    </div>
    <div class="domain">tu-jubilacion.web.app</div>
  </div>
</body>
</html>`;

async function generateOgImage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(html, { waitUntil: 'networkidle' });

  const outputPath = path.resolve(process.cwd(), 'public/og-image.png');
  await page.screenshot({ path: outputPath, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();
  console.log(`OG image saved to ${outputPath}`);
}

generateOgImage().catch((err) => {
  console.error(err);
  process.exit(1);
});
