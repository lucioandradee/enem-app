// screenshot-carousel.js
// Abre o HTML dos slides, tira screenshot de cada um e salva no Desktop
'use strict';
const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

const HTML_FILE = path.resolve(__dirname, 'carousel-instagram.html');
const DESKTOP   = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop');
const SLIDES    = ['s1', 's2', 's3', 's4', 's5', 's6'];
const LABELS    = [
  '01-hook',
  '02-app-overview',
  '03-gamificacao',
  '04-tutor-ia',
  '05-analise-quiz',
  '06-cta',
];

(async () => {
  console.log('\n🚀 Iniciando captura dos slides...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1080, height: 6480, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();

  // Aguarda fontes do Google carregarem
  await page.goto(`file://${HTML_FILE}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Espera extra para renderização de fontes e glows
  await new Promise(r => setTimeout(r, 800));

  for (let i = 0; i < SLIDES.length; i++) {
    const id    = SLIDES[i];
    const label = LABELS[i];
    const outPath = path.join(DESKTOP, `enem-master-${label}.png`);

    const el = await page.$(`#${id}`);
    if (!el) { console.error(`❌ Slide #${id} não encontrado`); continue; }

    await el.screenshot({ path: outPath, type: 'png' });
    console.log(`✅ Slide ${i + 1}/6 salvo: ${outPath}`);
  }

  await browser.close();
  console.log('\n🎉 Todos os 6 slides salvos no Desktop!\n');
  console.log('📁 Pasta: ' + DESKTOP);
})().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
