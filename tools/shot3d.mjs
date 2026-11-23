// Tira capturas de ecrã das cenas 3D de teste. Uso: node tools/shot3d.mjs [cena...] [--wait=ms] [--q=high]
import puppeteer from 'puppeteer-core';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const waitArg = args.find(a => a.startsWith('--wait='));
const qArg = args.find(a => a.startsWith('--q='));
const wait = waitArg ? +waitArg.split('=')[1] : 4000;
const q = qArg ? qArg.split('=')[1] : 'high';
const scenes = args.filter(a => !a.startsWith('--'));
const list = scenes.length ? scenes : ['hemicycle'];
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
page.on('console', m => { const t = m.text(); if (!/GPU stall|Automatic fallback/.test(t)) console.log('[console]', m.type(), t); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
for (const s of list) {
  const url = pathToFileURL(path.join(here, 'test3d.html')).href + '?s=' + encodeURIComponent(s) + '&q=' + q;
  const t0 = Date.now();
  await page.goto(url);
  await new Promise(r => setTimeout(r, wait));
  const fps = await page.evaluate(() => window.__frames || 0);
  await page.screenshot({ path: path.join(here, 'shots', s + '.png') });
  console.log('shot', s, 'frames:', fps, 'ms:', Date.now() - t0);
}
await browser.close();
