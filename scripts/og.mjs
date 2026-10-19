// Makes public/og.jpg, the 1200x630 card shown when a page without its own image is
// shared. Re-run after changing the portrait or the tagline: node scripts/og.mjs
// Needs Chrome at /usr/bin/google-chrome (or CHROME=/path) and puppeteer-core (npx).
import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const f = (p) => pathToFileURL(resolve(p)).href;
const html = `<!doctype html><html><head><style>
@font-face { font-family: G; src: url(${f('node_modules/@fontsource-variable/host-grotesk/files/host-grotesk-latin-wght-normal.woff2')}); font-weight: 300 800; }
@font-face { font-family: S; src: url(${f('node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2')}); font-style: italic; font-weight: 200 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #fff; color: #0f0f0f; font-family: G; display: grid; grid-template-columns: 330px 1fr; gap: 64px; align-items: center; padding: 0 80px; border-top: 14px solid #D9471A; }
img { width: 330px; height: 330px; border-radius: 50%; }
.n { font-size: 30px; font-weight: 600; letter-spacing: -.02em; margin-bottom: 28px; padding-top: 12px; border-top: 3px solid #0f0f0f; }
.n i { font-style: normal; color: #D9471A; }
h1 { font-size: 54px; line-height: 1.04; font-weight: 500; letter-spacing: -.035em; }
p { margin-top: 26px; font-family: S; font-style: italic; font-weight: 300; font-size: 28px; color: #595959; }
</style></head><body><img src="${f('public/profile-pic.webp')}"><div><div class="n">Bhuvan<i>.</i></div><h1>Doer of random things, diver of weird rabbit holes, sharer of fascinating things.</h1><p>Essays, notes and small websites · bebhuvan.com</p></div></body></html>`;

const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
// load from a file so the page may read the local font and portrait files
const file = join(mkdtempSync(join(tmpdir(), 'og-')), 'og.html');
writeFileSync(file, html);
await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 88 });
await browser.close();
console.log('public/og.jpg');
