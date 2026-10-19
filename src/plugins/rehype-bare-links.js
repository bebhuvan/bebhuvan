// rehype-bare-links
// ----------------------------------------------------------------------------
// A paragraph that is nothing but a pasted URL (common in notes: a tweet, an
// article) becomes a link preview card (src/plugins/link-preview.js, data fetched
// by scripts/link-previews.mjs). With no preview, it becomes a tidy source line,
// "x.com/user/status/… ↗" with class "linkline", instead of a raw address.
import { cardHast } from './link-preview.js';

export default function rehypeBareLinks() {
  return (tree) => walk(tree);
}

function walk(node) {
  if (!node.children) return;
  for (const c of node.children) {
    if (c.type === 'element' && c.tagName === 'p') {
      const kids = c.children.filter((k) => !(k.type === 'text' && !k.value.trim()));
      const a = kids[0];
      if (kids.length === 1 && a.type === 'element' && a.tagName === 'a') {
        const text = a.children.map((k) => k.value ?? '').join('').trim();
        const href = String(a.properties?.href ?? '');
        if (/^https?:\/\//.test(text) && /^https?:\/\//.test(href)) {
          const card = cardHast(href);
          if (card) {
            node.children[node.children.indexOf(c)] = card;
            continue;
          }
          c.properties = { ...(c.properties || {}), className: ['linkline'] };
          a.children = [{ type: 'text', value: pretty(href) }];
          continue;
        }
      }
    }
    walk(c);
  }
}

function pretty(href) {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^(www|m|mobile)\./, '');
    const path = decodeURIComponent(u.pathname).replace(/\/$/, '');
    const short = path.length > 38 ? path.slice(0, 36) + '…' : path;
    return `${host}${short} ↗`;
  } catch {
    return href;
  }
}
