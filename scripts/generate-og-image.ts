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
    background: #111827;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 64px;
    position: relative;
    overflow: hidden;
  }
  .bg-accent {
    position: absolute;
    top: -120px;
    right: -120px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  .bg-accent2 {
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 48px;
  }
  .logo-square {
    width: 56px;
    height: 56px;
    background: #2563eb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 800;
    color: white;
    letter-spacing: -1px;
  }
  .logo-text {
    font-size: 22px;
    font-weight: 700;
    color: #f9fafb;
    letter-spacing: -0.5px;
  }
  .title {
    font-size: 64px;
    font-weight: 800;
    color: #f9fafb;
    line-height: 1.1;
    letter-spacing: -2px;
    margin-bottom: 24px;
  }
  .title span {
    color: #60a5fa;
  }
  .subtitle {
    font-size: 26px;
    font-weight: 400;
    color: #d1d5db;
    line-height: 1.4;
    max-width: 800px;
    margin-bottom: 48px;
  }
  .footer {
    position: absolute;
    bottom: 48px;
    left: 64px;
    right: 64px;
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .badge {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    color: #9ca3af;
    font-weight: 500;
  }
</style>
</head>
<body>
  <div class="bg-accent"></div>
  <div class="bg-accent2"></div>
  <div class="logo">
    <div class="logo-square">TJ</div>
    <span class="logo-text">Tu Jubilación</span>
  </div>
  <div class="title">Planifica tu<br /><span>pensión pública</span></div>
  <div class="subtitle">Calculadora de pensión pública bajo diferentes escenarios de reforma</div>
  <div class="footer">
    <div class="badge">Datos SS/IRPF 2025</div>
    <div class="badge">Mortalidad INE 2023</div>
    <div class="badge">5 escenarios de reforma</div>
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
