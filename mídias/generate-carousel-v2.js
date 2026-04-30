/**
 * generate-carousel-v2.js
 * Gera 6 PNGs do carrossel Instagram do ENEM Master (versão premium)
 * Salva em: C:\Users\keyla\Desktop\
 *
 * Como usar:
 *   node generate-carousel-v2.js
 */

const puppeteer = require('puppeteer');
const http      = require('http');
const fs        = require('fs');
const path      = require('path');

// ── CONFIG ──────────────────────────────────────────────────
const DESKTOP = 'C:\\Users\\keyla\\Desktop';
const PORT    = 7788;
const ROOT    = __dirname;

const SLIDE_NAMES = [
  '1-hook',
  '2-app-overview',
  '3-gamificacao',
  '4-tutor-ia',
  '5-analise',
  '6-cta',
];

// ── HTTP SERVER (serve arquivos locais) ─────────────────────
function startServer () {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const url = req.url === '/' ? '/carousel-v2.html' : req.url;
      const filePath = path.join(ROOT, url.split('?')[0]);

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const mime = {
          '.html': 'text/html; charset=utf-8',
          '.css':  'text/css',
          '.js':   'application/javascript',
          '.svg':  'image/svg+xml',
          '.png':  'image/png',
          '.jpg':  'image/jpeg',
          '.jpeg': 'image/jpeg',
        }[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
      });
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`✔ Servidor local em http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

// ── MAIN ────────────────────────────────────────────────────
async function main () {
  if (!fs.existsSync(DESKTOP)) {
    console.error(`❌ Desktop não encontrado: ${DESKTOP}`);
    process.exit(1);
  }

  const server  = await startServer();
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    defaultViewport: { width: 1080, height: 1080, deviceScaleFactor: 2 },
  });

  try {
    const page = await browser.newPage();

    // ── Carrega o carrossel via servidor local ────────────
    console.log('⏳ Carregando página...');
    await page.goto(`http://127.0.0.1:${PORT}/carousel-v2.html`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // ── Injecta Twemoji (converte emoji texto → SVG) ──────
    console.log('⏳ Injectando Twemoji...');
    try {
      await page.addScriptTag({
        url: 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/dist/twemoji.min.js',
      });
      await page.evaluate(() => {
        twemoji.parse(document.body, {
          folder: 'svg',
          ext: '.svg',
          base: 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/',
          className: 'twemoji',
          attributes: () => ({
            style: 'height:1.1em;width:1.1em;vertical-align:-0.1em;display:inline-block;object-fit:contain;',
          }),
        });
      });
      // Aguarda todas as imagens de emoji carregarem
      await page.waitForFunction(
        () => {
          const imgs = document.querySelectorAll('img.twemoji');
          return imgs.length === 0 || [...imgs].every(img => img.complete && img.naturalWidth > 0);
        },
        { timeout: 15000 }
      );
      console.log('✔ Twemoji carregado.');
    } catch (e) {
      console.warn('⚠ Twemoji não disponível (sem internet?), usando emoji do sistema:', e.message);
    }

    // Pequena pausa extra para renderização de fontes
    await new Promise(r => setTimeout(r, 800));

    // ── Screenshot por slide ──────────────────────────────
    const slides = await page.$$('.slide');
    if (slides.length === 0) {
      throw new Error('Nenhum slide encontrado na página!');
    }

    console.log(`\n📸 Capturando ${slides.length} slides...\n`);

    for (let i = 0; i < slides.length; i++) {
      const name    = SLIDE_NAMES[i] || `slide-${i + 1}`;
      const outFile = path.join(DESKTOP, `enem-master-carrossel-${name}.png`);

      // Mostra apenas o slide atual (garante fundo limpo)
      await page.evaluate((idx) => {
        document.querySelectorAll('.slide').forEach((s, j) => {
          s.style.display = j === idx ? 'block' : 'none';
        });
      }, i);

      // Pega o bounding box atualizado
      const box = await slides[i].boundingBox();
      await page.screenshot({
        path: outFile,
        clip: { x: box.x, y: box.y, width: 1080, height: 1080 },
      });

      console.log(`  ✔ Slide ${i + 1}/6 → ${outFile}`);
    }

    console.log('\n✅ Todos os slides gerados com sucesso!\n');

    // Abre a pasta Desktop no Explorer
    const { exec } = require('child_process');
    exec(`explorer "${DESKTOP}"`);

  } catch (err) {
    console.error('\n❌ Erro ao gerar carrossel:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    console.log('🔒 Browser e servidor encerrados.');
  }
}

main();
