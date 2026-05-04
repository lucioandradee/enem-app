import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlFile = path.resolve(__dirname, 'carousel-instagram.html');
const desktopDir = 'C:/Users/keyla/Desktop/enem-master-carrossel';

fs.mkdirSync(desktopDir, { recursive: true });

const slides = [
  { index: 0, name: '01-hook-dados-reais' },
  { index: 1, name: '02-dashboard-real' },
  { index: 2, name: '03-questao-real-enem' },
  { index: 3, name: '04-resultado-tri' },
  { index: 4, name: '05-professor-24h-ia' },
  { index: 5, name: '06-cta-comeca-gratis' },
];

console.log('🚀 Iniciando captura dos slides...\n');

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: null,
});

const page = await browser.newPage();

// 1080x1080 + espaço para UI da página
await page.setViewport({ width: 1200, height: 1280, deviceScaleFactor: 2 });

await page.goto(`file:///${htmlFile.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

// Aguarda fontes e animações iniciais
await new Promise(r => setTimeout(r, 2000));

for (const slide of slides) {
  // Navega para o slide via JS
  await page.evaluate((i) => {
    const track = document.getElementById('slides');
    const dots  = document.querySelectorAll('.dot');
    const ctr   = document.getElementById('counter');
    track.style.transition = 'none'; // sem animação para captura limpa
    track.style.transform = `translateX(-${i * 1080}px)`;
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
    ctr.textContent = `${i + 1} / 6`;
  }, slide.index);

  // Aguarda render
  await new Promise(r => setTimeout(r, 600));

  // Captura exatamente o elemento .carousel-wrap
  const el = await page.$('.carousel-wrap');
  const outputPath = path.join(desktopDir, `${slide.name}.png`);

  await el.screenshot({
    path: outputPath,
    type: 'png',
  });

  console.log(`  ✅ Slide ${slide.index + 1}/6 salvo → ${slide.name}.png`);
}

await browser.close();

console.log(`\n🎉 Pronto! 6 imagens salvas em:\n   ${desktopDir}\n`);
console.log('📐 Resolução: 2160×2160px (2× para alta qualidade Instagram)\n');
