const http = require('http');
const fs   = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const PORT   = 7789;
const HTML   = path.join(__dirname, 'carousel-v3.html');
const DEST   = 'C:\\Users\\keyla\\Desktop';

const SLIDES = [
  { idx: 0, name: 'enem-master-como-passar-1-dor.png' },
  { idx: 1, name: 'enem-master-como-passar-2-diagnostico.png' },
  { idx: 2, name: 'enem-master-como-passar-3-plano.png' },
  { idx: 3, name: 'enem-master-como-passar-4-tutor-ia.png' },
  { idx: 4, name: 'enem-master-como-passar-5-gamificacao.png' },
  { idx: 5, name: 'enem-master-como-passar-6-resultado.png' },
  { idx: 6, name: 'enem-master-como-passar-7-cta.png' },
];

// ── servidor local ───────────────────────────────────────
const server = http.createServer((req, res) => {
  fs.readFile(HTML, (err, data) => {
    if (err) { res.writeHead(500); res.end('erro'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Servidor em http://127.0.0.1:${PORT}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle0', timeout: 30000 });

    // aguarda fontes
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1500));

    for (const slide of SLIDES) {
      // exibe o slide
      await page.evaluate((i) => {
        if (typeof goTo === 'function') goTo(i);
      }, slide.idx);
      await new Promise(r => setTimeout(r, 600));

      const dest = path.join(DEST, slide.name);
      await page.screenshot({
        path: dest,
        clip: { x: 0, y: 0, width: 1080, height: 1080 },
      });
      console.log(`✓ ${slide.name}`);
    }

    console.log('\nProntos! Imagens salvas em:', DEST);
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await browser.close();
    server.close();
  }
});
