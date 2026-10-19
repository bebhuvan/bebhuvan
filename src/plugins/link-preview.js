// Link previews: the card for a URL, as a hast tree, from src/data/link-previews.json
// (filled by scripts/link-previews.mjs). Used by rehype-bare-links for links pasted on
// their own line, and by templates (via toHtml) for a note's source.
import { readFileSync, existsSync } from 'node:fs';
import { h } from 'hastscript';
import { toHtml } from 'hast-util-to-html';

const DATA = 'src/data/link-previews.json';
let data;
const load = () => (data ??= existsSync(DATA) ? JSON.parse(readFileSync(DATA, 'utf8')) : {});

// news.example.com, also when it was shared as a Google AMP link (www-example-com.cdn.ampproject.org)
export const host = (u) => {
  try {
    let h = new URL(u).hostname;
    if (h.endsWith('.cdn.ampproject.org')) h = h.replace(/\.cdn\.ampproject\.org$/, '').replace(/--/g, '\u0000').replace(/-/g, '.').replace(/\u0000/g, '-');
    return h.replace(/^(www|m|mobile|amp)\./, '');
  } catch {
    return '';
  }
};

// a readable title from the address itself, for sites that refuse previews:
// nytimes.com/2025/10/12/business/ai-bubble-economy.html -> "Ai bubble economy"
export function slugTitle(u) {
  try {
    const segs = new URL(u).pathname.split('/').map((s) => decodeURIComponent(s).replace(/\.(html?|php|aspx?)$/i, ''));
    const best = segs.filter((s) => /[a-z][-_][a-z]/i.test(s)).sort((a, b) => b.length - a.length)[0];
    if (!best) return '';
    const tokens = best.split(/[-_]+/).filter(Boolean);
    // words only: ids, hashes and dates (anything with a digit) are dropped, and a
    // segment that is mostly ids isn't a title at all
    const words = tokens.filter((w) => /^[a-z']+$/i.test(w));
    if (words.length < 3 || words.length < tokens.length * 0.7) return '';
    const t = words.join(' ');
    return t.charAt(0).toUpperCase() + t.slice(1);
  } catch {
    return '';
  }
}

const clip = (s, n) => (s && s.length > n ? s.slice(0, s.lastIndexOf(' ', n)) + '…' : s);

export function previewFor(url) {
  return load()[String(url).trim()];
}

// hast for the card, or null when there's nothing better than a plain link
export function cardHast(url) {
  const p = previewFor(url);
  const site = host(url);
  const a = (cls, kids) => h('a', { className: ['lp', ...cls], href: url, rel: 'noopener' }, kids);
  if (p && p.kind === 'tweet') {
    // X appends a t.co link to the tweet's own media or quote; it means nothing here
    const lines = p.text.replace(/\s*https:\/\/t\.co\/\w+\s*$/g, '').trim().split('\n');
    return a(['lp-tweet'], [
      h('span', { className: ['lp-site'] }, [`${p.author}`, p.handle ? h('span', ` @${p.handle}`) : '', p.date ? ` · ${p.date}` : '', ' ↗']),
      h('span', { className: ['lp-quote'] }, lines.flatMap((l, i) => (i ? [h('br'), l] : [l]))),
    ]);
  }
  if (p && !p.failed) {
    const txt = h('span', { className: ['lp-txt'] }, [
      h('span', { className: ['lp-site'] }, [p.site && p.site.toLowerCase() !== site ? `${p.site} · ${site}` : site, ' ↗']),
      h('span', { className: ['lp-title'] }, clip(p.title, 140)),
      p.description ? h('span', { className: ['lp-desc'] }, clip(p.description, 220)) : '',
    ]);
    const img = p.img
      ? h('span', { className: ['lp-img', p.kind === 'video' ? 'lp-video' : ''] }, [h('img', { src: p.img.src, width: p.img.w, height: p.img.h, alt: '', loading: 'lazy', decoding: 'async' })])
      : '';
    return a(p.img ? ['lp-has-img'] : [], [txt, img]);
  }
  const t = slugTitle(url);
  if (!t) return null;
  return a(['lp-bare'], [h('span', { className: ['lp-txt'] }, [h('span', { className: ['lp-site'] }, [site, ' ↗']), h('span', { className: ['lp-title'] }, t)])]);
}

export const cardHtml = (url) => {
  const c = cardHast(url);
  return c ? toHtml(c) : '';
};
