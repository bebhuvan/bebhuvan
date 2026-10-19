// Shared data and formatting for every page. Collections are read once here.
import { getCollection } from 'astro:content';
import { imageAttrs, imageInfo } from '../plugins/rehype-image-attrs.js';
import { host } from '../plugins/link-preview.js';
import { smart } from './typo';
export { smart };

export const SITE = {
  url: 'https://bebhuvan.com',
  name: 'Bhuvan',
  author: 'Bhuvan',
  tagline: 'Doer of random things, diver of weird rabbit holes, sharer of fascinating things.',
  description: 'Essays, notes and small websites by Bhuvan, from Bangalore: money, technology, history, books, and whatever rabbit hole he fell into this week.',
  city: 'Bangalore, India',
  github: 'https://github.com/bebhuvan',
  twitter: 'https://x.com/bebhuvan',
  handle: '@bebhuvan',
  linkedin: 'https://www.linkedin.com/in/bebhuvan/',
};

const byDate = <T extends { data: { publishDate?: Date; date?: Date } }>(a: T, b: T) =>
  (b.data.publishDate ?? b.data.date!).valueOf() - (a.data.publishDate ?? a.data.date!).valueOf();

export const posts = (await getCollection('blog')).filter((p) => !p.data.draft).sort(byDate);
export const notes = (await getCollection('notes')).filter((n) => !n.data.draft).sort(byDate);
export const projects = (await getCollection('projects'))
  .filter((p) => p.data.status !== 'archived')
  .sort((a, b) => a.data.order - b.data.order);
export const nowEntries = (await getCollection('now')).sort(byDate);
export const books = (await getCollection('books')).sort((a, b) => bookTime(b) - bookTime(a));

export function bookTime(b: { data: { date?: Date; year?: number; finishedDate?: string } }) {
  if (b.data.date) return b.data.date.valueOf();
  const y = b.data.year ?? parseInt(b.data.finishedDate ?? '', 10);
  return y ? new Date(y, 11, 31).valueOf() : 0;
}
export const bookYear = (b: Parameters<typeof bookTime>[0]) => {
  const t = bookTime(b);
  return t ? new Date(t).getFullYear() : undefined;
};

export const postHref = (p: { id: string }) => `/blog/${p.id}/`;
export const noteHref = (n: { id: string }) => `/notes/${n.id}/`;
export const bookHref = (b: { id: string }) => `/books/${b.id}/`;
export const topicHref = (t: string) => `/topics/${tagSlug(t)}/`;
// same rule Rabbit Holes used, so its /tags/<slug> links map onto /topics/<slug>/
export const tagSlug = (t: string) => t.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const fmtLong = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const fmtMonth = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
export const iso = (d: Date) => d.toISOString();

// a description is shown only if it doesn't trail off
export const dek = (d?: string) => (d && !/(\.\.\.|…)\s*$/.test(d) ? smart(d.trim()) : '');
// a description cut to its first sentence when it runs long
export const short = (d?: string) => {
  const t = dek(d);
  if (t.length <= 150) return t;
  const m = t.match(/^.{20,150}?[.?!](?=\s|$)/);
  return m ? m[0] : '';
};
export const words = (body?: string) => (body ?? '').split(/\s+/).filter(Boolean).length;
export const minutes = (p: { body?: string }) => Math.max(1, Math.round(words(p.body) / 230));

// plain text from markdown, for excerpts and meta descriptions
export function plain(md = '') {
  return md
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;/g, '’').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[\^[^\]]+\](:.*)?/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/^\s*(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_`~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
export const clip = (s: string, n: number) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n)).replace(/[,;:—–-]$/, '') + '…' : s);
export const excerpt = (n: { body?: string; data: { description?: string } }, len = 240) =>
  smart(n.data.description || clip(plain(n.body), len));

export const domain = (u?: string) => (u ? host(u) : '');

export const kindLabel: Record<string, string> = { note: 'Note', link: 'Link', quote: 'Quote', verse: 'Verse' };
export const projectKinds = [
  { key: 'library', label: 'Rooms for old words', blurb: 'Old letters, speeches and books, set to be read' },
  { key: 'numbers', label: 'In numbers', blurb: 'Indian data, explained in plain language' },
  { key: 'reading', label: 'What I read', blurb: 'Reading, kept in the open' },
  { key: 'street', label: 'The street', blurb: 'Bengaluru, on the record' },
] as const;

// topics: every tag used by at least two essays or notes
export type Topic = { tag: string; slug: string; posts: typeof posts; notes: typeof notes; count: number };
export const topics: Topic[] = (() => {
  const m = new Map<string, Topic>();
  const add = (tag: string) => {
    const slug = tagSlug(tag);
    if (!slug) return undefined;
    if (!m.has(slug)) m.set(slug, { tag, slug, posts: [], notes: [], count: 0 });
    return m.get(slug)!;
  };
  for (const p of posts) for (const t of p.data.tags) { const x = add(t); if (x && !x.posts.includes(p)) { x.posts.push(p); x.count++; } }
  for (const n of notes) for (const t of n.data.tags) { const x = add(t); if (x && !x.notes.includes(n)) { x.notes.push(n); x.count++; } }
  return [...m.values()].filter((t) => t.count >= 2).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
})();
const topicSlugs = new Set(topics.map((t) => t.slug));
export const hasTopic = (tag: string) => topicSlugs.has(tagSlug(tag));

// responsive variants from scripts/images.mjs (see src/plugins/rehype-image-attrs.js)
export const srcset = (image?: string, _widths?: number[]) => (image ? imageAttrs(image).srcset : undefined);
export function thumb(image?: string) {
  const v = imageInfo(image)?.variants ?? [];
  return v.find(([w]: [number, string]) => w >= 480 && w <= 800)?.[1] ?? image ?? '';
}

// the streams on /notes/: [url segment, label, kind]
export const noteStreams = [['', 'Everything', ''], ['links', 'Links', 'link'], ['notes', 'Notes', 'note'], ['verse', 'Verse', 'verse']] as const;
