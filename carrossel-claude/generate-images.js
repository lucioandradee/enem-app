/**
 * Gera PNGs de alta resolução de cada slide dos carrosséis.
 * Saída: Desktop/<nome-do-carrossel>/slide_01.png ... slide_N.png
 *
 * Uso:
 *   npm install
 *   node generate-images.js
 */

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

/* ─── Configuração ─────────────────────────────── */
const DESKTOP = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop');

const CAROUSELS = [
  { file: 'carousel_01_estudo_errado.html',  name: 'carousel_01_estudo_errado',  slides: 7 },
  { file: 'carousel_02_horas_estudo.html',   name: 'carousel_02_horas_estudo',   slides: 7 },
  { file: 'carousel_03_medicina.html',       name: 'carousel_03_medicina',       slides: 7 },
  { file: 'carousel_04_600_vs_750.html',     name: 'carousel_04_600_vs_750',     slides: 6 },
];

/*
 * 430 × 537 px @ 3× = 1290 × 1611 px
 * Proporção 4:5 — padrão Instagram feed
 */
const VIEWPORT = { width: 430, height: 537, deviceScaleFactor: 3 };

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ─── Main ──────────────────────────────────────── */
async function main() {
  console.log('🚀 ENEM Master — Gerando imagens dos carrosséis\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  for (const carousel of CAROUSELS) {
    const outputDir = path.join(DESKTOP, carousel.name);
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`📸  ${carousel.name}  (${carousel.slides} slides)`);
    console.log(`    → ${outputDir}`);

    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    /* Carrega o arquivo HTML local */
    const filePath = path.resolve(__dirname, carousel.file).replace(/\\/g, '/');
    await page.goto(`file:///${filePath}`, { waitUntil: 'load', timeout: 15_000 });

    /* Aguarda fontes e primeiro render */
    await sleep(1200);

    for (let i = 0; i < carousel.slides; i++) {
      /* Aguarda animações do slide atual (max delay 0.66s + dur 0.6s ≈ 1.3s) */
      await sleep(1500);

      const card = await page.$('.card');
      if (!card) throw new Error(`Elemento .card não encontrado em ${carousel.file}`);

      const slideNum = String(i + 1).padStart(2, '0');
      const outPath  = path.join(outputDir, `slide_${slideNum}.png`);

      await card.screenshot({ path: outPath, type: 'png' });
      console.log(`    ✅  slide ${slideNum}/${carousel.slides}`);

      /* Avança para o próximo slide */
      if (i < carousel.slides - 1) {
        await page.click('#next');
      }
    }

    await page.close();
    console.log();
  }

  await browser.close();

  console.log('✅  Concluído!');
  console.log(`📁  Imagens salvas em: ${DESKTOP}`);
  console.log('\nEstrutura de pastas:');
  CAROUSELS.forEach(c => console.log(`   ${DESKTOP}\\${c.name}\\slide_01.png ... slide_0${c.slides}.png`));
}

main().catch(err => {
  console.error('\n❌  Erro:', err.message);
  process.exit(1);
});
