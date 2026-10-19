// Link previews, fetched before the build (npm run build runs this).
//
// Every link that will show as a preview gets its title, description, site name and
// image fetched once and kept in src/data/link-previews.json (committed). Pages
// render the preview as plain HTML, with no scripts and nothing loaded from the other site:
// preview images are saved as small WebPs in public/link-images/.
//
// Which links: a note's source (`url`), and any paragraph in an essay or note that
// is nothing but a pasted URL. Tweets (x.com, twitter.com) and YouTube come from their
// public oEmbed endpoints (a tweet's text and author; a video's title and thumbnail);
// everything else from the page's Open Graph / Twitter card tags. Sites that refuse
// bots (most paywalled news) fail, and the page shows a text card made from the URL.
//
// Already-fetched links are skipped, so a build only fetches what's new. Failures are
// remembered and retried after 30 days; the page falls back to a plain link line.
// Re-fetch one link: delete its entry from the JSON. Skip all fetching: NO_PREVIEWS=1.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import sharp from 'sharp';

const DATA = 'src/data/link-previews.json';
const IMG_DIR = 'public/link-images';
const UA = 'Mozilla/5.0 (compatible; bebhuvan.com link preview; +https://bebhuvan.com/)';
const RETRY_FAILED_AFTER = 30 * 864e5;
const TIMEOUT = 10_000;
const CONCURRENCY = 6;

export const key = (u) => u.trim();
export const hash = (u) => createHash('sha1').update(key(u)).digest('hex').slice(0, 16);

// --- which links -------------------------------------------------------------
function links() {
  const out = new Set();
  for (const dir of ['notes', 'blog']) {
    const base = join('src/content', dir);
    if (!existsSync(base)) continue;
    for (const f of readdirSync(base).filter((f) => f.endsWith('.md'))) {
      const text = readFileSync(join(base, f), 'utf8');
      const [, fm = '', body = ''] = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/) ?? [];
      if (/^draft:\s*true/m.test(fm)) continue;
      const src = fm.match(/^url:\s*["']?(https?:\/\/[^\s"']+)/m);
      if (src) out.add(key(src[1]));
      for (const p of body.split(/\n{2,}/)) {
        const m = p.trim().match(/^(?:\[(https?:\/\/[^\]]+)\]\((https?:\/\/[^)\s]+)\)|<?(https?:\/\/[^\s<>]+?)>?)$/);
        if (m) out.add(key(m[2] || m[3]));
      }
    }
  }
  return [...out];
}

// --- fetching ------------------------------------------------------------------
async function get(url, accept = 'text/html') {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: accept, 'Accept-Language': 'en' }, redirect: 'follow', signal: ctl.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

const decode = (s = '') => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim();

function meta(html, names) {
  for (const n of names) {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${n}["'][^>]*>`, 'i');
    const tag = html.match(re)?.[0];
    const c = tag?.match(/content=["']([^"']*)["']/i)?.[1] ?? tag?.match(/content=([^\s>]+)/i)?.[1];
    if (c) return decode(c);
  }
  return '';
}

async function tweet(url) {
  const u = url.replace(/\/\/(mobile\.)?x\.com\//, '//twitter.com/').replace(/\?.*$/, '');
  const res = await get(`https://publish.twitter.com/oembed?omit_script=1&dnt=1&url=${encodeURIComponent(u)}`, 'application/json');
  if (!res.ok) throw new Error(`oembed ${res.status}`);
  const j = await res.json();
  const html = j.html ?? '';
  const text = decode(html.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1]?.replace(/<br\s*\/?>/g, '\n').replace(/<a[^>]*>(pic\.twitter\.com\/\w+)<\/a>/g, '').replace(/<[^>]+>/g, '') ?? '');
  const date = decode(html.match(/<a[^>]*>([^<]*)<\/a>\s*<\/blockquote>/)?.[1] ?? '');
  if (!text) throw new Error('empty tweet');
  return { kind: 'tweet', title: j.author_name ?? '', author: j.author_name ?? '', handle: (j.author_url ?? '').split('/').pop(), text, date, site: 'X' };
}

async function youtube(url) {
  const res = await get(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`, 'application/json');
  if (!res.ok) throw new Error(`oembed ${res.status}`);
  const j = await res.json();
  return { kind: 'video', title: j.title, description: j.author_name ? `${j.author_name} on YouTube` : '', site: 'YouTube', image: j.thumbnail_url ?? '' };
}

async function page(url) {
  const res = await get(url);
  if (!res.ok) throw new Error(`http ${res.status}`);
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('html')) throw new Error(`not html: ${type}`);
  const html = (await res.text()).slice(0, 600_000);
  const head = html.split(/<\/head>/i)[0];
  const title = meta(head, ['og:title', 'twitter:title']) || decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  if (!title) throw new Error('no title');
  let image = meta(head, ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src']);
  if (image) try { image = new URL(image, res.url).toString(); } catch { image = ''; }
  return {
    kind: 'page',
    title,
    description: meta(head, ['og:description', 'twitter:description', 'description']),
    site: meta(head, ['og:site_name']) || new URL(res.url).hostname.replace(/^www\./, ''),
    image,
  };
}

async function saveImage(src, id) {
  const res = await get(src, 'image/*');
  if (!res.ok) throw new Error(`image ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const file = join(IMG_DIR, `${id}.webp`);
  const info = await sharp(buf, { animated: false }).resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true }).webp({ quality: 72 }).toFile(file);
  return { src: `/link-images/${id}.webp`, w: info.width, h: info.height };
}

async function preview(url) {
  const host = new URL(url).hostname.replace(/^www\.|^mobile\./, '');
  const p = host === 'x.com' || host === 'twitter.com' ? await tweet(url)
    : host === 'youtu.be' || host.endsWith('youtube.com') ? await youtube(url)
    : await page(url);
  if (p.image) {
    try { p.img = await saveImage(p.image, hash(url)); } catch { /* card without a picture */ }
    delete p.image;
  }
  return { ...p, fetched: new Date().toISOString().slice(0, 10) };
}

// --- run -----------------------------------------------------------------------
if (process.env.NO_PREVIEWS) {
  console.log('link previews: skipped (NO_PREVIEWS)');
  process.exit(0);
}
mkdirSync(IMG_DIR, { recursive: true });
const data = existsSync(DATA) ? JSON.parse(readFileSync(DATA, 'utf8')) : {};
const todo = links().filter((u) => {
  const d = data[u];
  if (!d) return true;
  return d.failed && Date.now() - Date.parse(d.fetched) > RETRY_FAILED_AFTER;
});
let ok = 0, bad = 0;
const queue = [...todo];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  for (let u = queue.shift(); u; u = queue.shift()) {
    try {
      data[u] = await preview(u);
      ok++;
    } catch (e) {
      data[u] = { failed: String(e.message ?? e).slice(0, 80), fetched: new Date().toISOString().slice(0, 10) };
      bad++;
    }
  }
}));
const sorted = Object.fromEntries(Object.keys(data).sort().map((k) => [k, data[k]]));
writeFileSync(DATA, JSON.stringify(sorted, null, 1) + '\n');
console.log(`link previews: ${Object.keys(data).length} known, ${ok} fetched, ${bad} failed`);
