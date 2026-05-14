const puppeteer = require('puppeteer');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 538, deviceScaleFactor: 2.51 });

  const filePath = path.resolve(__dirname, 'carousel_05_tela_inicio.html');
  await page.goto('file:///' + filePath.replace(/\\/g, '/'));
  await sleep(900); // fonts + first animation

  const desktop = 'C:/Users/keyla/Desktop';
  const total = 6;

  for (let i = 0; i < total; i++) {
    await sleep(450);
    const slide = String(i + 1).padStart(2, '0');
    const outFile = `${desktop}/carousel_05_tela_inicio_${slide}.png`;
    const el = await page.$('.card');
    await el.screenshot({ path: outFile, type: 'png' });
    console.log(`✓ slide ${i + 1} → ${outFile}`);
    if (i < total - 1) {
      await page.click('#next');
      await sleep(550);
    }
  }

  await browser.close();
  console.log('\nPronto! 6 imagens salvas no Desktop.');
})();
