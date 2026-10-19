// rehype-image-attrs
// ----------------------------------------------------------------------------
// For every <img> in markdown: loading="lazy", decoding="async", and, for local
// images, width/height (so the page doesn't shift as images arrive) and a srcset
// from the resized copies scripts/images.mjs made. A heavy original (a phone
// photo uploaded through the CMS) is swapped for its largest WebP copy.
import { readFileSync, existsSync } from 'node:fs';

const MANIFEST = 'src/data/images.generated.json';
const SIZES = '(max-width: 860px) calc(100vw - 40px), 680px';
let manifest;
const load = () => (manifest ??= existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {});

export function imageInfo(src) {
  if (typeof src !== 'string' || !src.startsWith('/')) return undefined;
  let key = src.split(/[?#]/)[0];
  try { key = decodeURI(key); } catch {}
  return load()[key];
}

export function imageAttrs(src) {
  const info = imageInfo(src);
  if (!info) return {};
  const out = { width: info.w, height: info.h };
  const v = info.variants || [];
  if (v.length) {
    const list = v.map(([w, f]) => `${encodeURI(f)} ${w}w`);
    if (!info.heavy) list.push(`${src} ${info.w}w`);
    out.srcset = list.join(', ');
    out.sizes = SIZES;
    if (info.heavy) {
      const [w, f] = v[v.length - 1];
      out.src = encodeURI(f);
      out.width = w;
      out.height = Math.round((info.h * w) / info.w);
    }
  }
  return out;
}

export default function rehypeImageAttrs() {
  return (tree) => {
    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'img') return;
      const p = (node.properties ||= {});
      if (p.loading === undefined) p.loading = 'lazy';
      if (p.decoding === undefined) p.decoding = 'async';
      if (p.width === undefined && p.srcSet === undefined) {
        const a = imageAttrs(p.src);
        if (a.src) p.src = a.src;
        if (a.width) { p.width = a.width; p.height = a.height; }
        if (a.srcset) { p.srcSet = a.srcset; p.sizes = a.sizes; }
      }
    });
  };
}

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  if (node.children) for (const c of node.children) walk(c, visit);
}
