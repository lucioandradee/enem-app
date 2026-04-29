/**
 * generate-viral-carousels.js
 * Gera 14 PNGs (7 slides × 2 carrosseis) no Desktop
 *
 * Como usar:
 *   node generate-viral-carousels.js
 */

'use strict';

const puppeteer = require('puppeteer');
const http      = require('http');
const fs        = require('fs');
const path      = require('path');
const { exec }  = require('child_process');

// ── CONFIG ──────────────────────────────────────────────────
const DESKTOP = 'C:\\Users\\keyla\\Desktop';
const PORT    = 7799;
const ROOT    = __dirname;

const CAROUSELS = [
  {
    file:   'carousel-erros-enem.html',
    prefix: 'enem-erros',
    slides: [
      '01-capa-hook',
      '02-erro-estudar-ja-sabe',
      '03-erro-acertar-tudo',
      '04-erro-sem-medicao',
      '05-erro-redacao-ultimo-mes',
      '06-erro-sem-consistencia',
      '07-cta-final',
    ],
  },
  {
    file:   'carousel-checklist.html',
    prefix: 'enem-checklist',
    slides: [
      '01-capa-hook',
      '02-semana-de-estudos',
      '03-habitos-de-estudo',
      '04-estrategia-de-prova',
      '05-redacao',
      '06-mindset-consistencia',
      '07-cta-final',
    ],
  },
];

// ── HTTP SERVER ──────────────────────────────────────────────
function startServer () {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const url      = req.url === '/' ? '/index.html' : req.url;
      const filePath = path.join(ROOT, url.split('?')[0]);

      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ext  = path.extname(filePath).toLowerCase();
        const mime = {
          '.html': 'text/html; charset=utf-8',
          '.css':  'text/css',
          '.js':   'application/javascript',
          '.svg':  'image/svg+xml',
          '.png':  'image/png',
        }[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
      });
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`✔ Servidor local em http://127.0.0.1:${PORT}\n`);
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

  console.log('\n🚀 Gerando carrosseis virais do ENEM Master...\n');
  console.log('═'.repeat(58));

  const server  = await startServer();
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
      '--disable-lcd-text',
    ],
    defaultViewport: { width: 1080, height: 1080, deviceScaleFactor: 2 },
  });

  let totalSaved = 0;

  try {
    for (const carousel of CAROUSELS) {
      console.log(`\n📦 Carrossel: ${carousel.file}`);
      console.log('─'.repeat(50));

      const page = await browser.newPage();

      await page.goto(`http://127.0.0.1:${PORT}/${carousel.file}`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Injeta Twemoji para emojis consistentes
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
        await page.waitForFunction(
          () => {
            const imgs = document.querySelectorAll('img.twemoji');
            return imgs.length === 0 || [...imgs].every(img => img.complete && img.naturalWidth > 0);
          },
          { timeout: 15000 }
        );
      } catch (e) {
        console.warn('  ⚠ Twemoji indisponível (sem internet?), usando emoji do sistema.');
      }

      // Pausa para renderização de fontes e glows
      await new Promise(r => setTimeout(r, 1200));

      const slides = await page.$$('.slide');
      if (slides.length === 0) throw new Error(`Nenhum slide encontrado em ${carousel.file}`);

      for (let i = 0; i < slides.length; i++) {
        const slideName = carousel.slides[i] || `slide-${String(i + 1).padStart(2, '0')}`;
        const outFile   = path.join(DESKTOP, `${carousel.prefix}-${slideName}.png`);

        // Mostra apenas o slide atual (fundo limpo, sem sobreposição)
        await page.evaluate(idx => {
          document.querySelectorAll('.slide').forEach((s, j) => {
            s.style.display = j === idx ? 'flex' : 'none';
          });
        }, i);

        await new Promise(r => setTimeout(r, 80));

        const box = await slides[i].boundingBox();
        await page.screenshot({
          path: outFile,
          clip: { x: box.x, y: box.y, width: 1080, height: 1080 },
          type: 'png',
        });

        totalSaved++;
        console.log(`  ✅ [${i + 1}/${slides.length}] ${path.basename(outFile)}`);
      }

      await page.close();
    }

    console.log('\n' + '═'.repeat(58));
    console.log(`\n🎉 ${totalSaved} slides salvos no Desktop com sucesso!\n`);
    console.log('📁 Pasta: ' + DESKTOP);
    console.log('\n💡 Dica: Cada pasta de slides = um carrossel completo para postar.');
    console.log('   Poste na ordem numérica dos arquivos.\n');

    exec(`explorer "${DESKTOP}"`);

  } catch (err) {
    console.error('\n❌ Erro:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
}

main();
