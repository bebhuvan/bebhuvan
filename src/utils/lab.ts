// Shared data for the /lab/ structure mockups (branch design-next-pass only).
import { getCollection } from 'astro:content';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { smart } from './typo';

export const posts = (await getCollection('blog'))
  .filter((p) => !p.data.draft)
  .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
export const notes = (await getCollection('updates'))
  .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
export const projects = (await getCollection('projects'))
  .filter((p) => p.data.status !== 'archived')
  .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
export const books = await getCollection('books');

// find an essay / project / book by a fragment of its id
export const post = (k: string) => posts.find((p) => p.id.includes(k))!;
export const project = (k: string) => projects.find((p) => p.id.includes(k))!;
export const book = (k: string) => books.find((b) => b.id.includes(k))!;
export const note = (k: string) => notes.find((n) => n.id.includes(k))!;

// the small variant of a cover image, if one was generated
export function thumb(image?: string) {
  if (!image) return '';
  const small = image.replace(/\.webp$/, '-480w.webp');
  return existsSync(join(process.cwd(), 'public', small)) ? small : image;
}

export const dek = (d?: string) => (d && !/(\.\.\.|…)\s*$/.test(d) ? smart(d.trim()) : '');
export const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtMonth = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
export const href = (p: { id: string }) => `/blog/${p.id}/`;
export { smart };

// ---- directions round (A magazine, B book, C grid) ----
import rabbitRaw from '../data/lab-rabbitholes.json';

export const nowEntries = (await getCollection('now'))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

const strip = (h: string) => h.replace(/<[^>]*>/g, ' ').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_#>]+/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, '’').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
const domain = (u: string) => { try { return new URL(u).hostname.replace(/^www\.|\.cdn\.ampproject\.org$/g, '').replace(/^www-/, '').replace(/-/g, '.'); } catch { return ''; } };
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n)) + '…' : s);

// one stream: Rabbit Holes link posts and musings (a snapshot of its feed) plus the site's own notes
export type StreamItem = { kind: 'link' | 'note'; title: string; date: Date; text: string; html: string; source: string; domain: string; href: string };
export const stream: StreamItem[] = [
  ...rabbitRaw.map((r) => {
    // a paragraph that is only a bare URL becomes the item's source line instead
    const bare = /<p>\s*<a href="([^"]+)">https?:[^<]*<\/a>\s*<\/p>/g;
    const source = r.source || (bare.exec(r.html)?.[1] ?? '');
    return {
      kind: (source ? 'link' : 'note') as 'link' | 'note',
      title: smart(r.title.trim()),
      date: new Date(r.date),
      text: smart(clip(strip(r.html), 260)),
      html: r.html.replace(/<(script|iframe)[\s\S]*?<\/\1>/g, '').replace(bare, ''),
      source,
      domain: domain(source),
      href: source || '#',
    };
  }),
  ...notes.map((n) => ({
    kind: 'note' as const,
    title: smart(n.data.title),
    date: n.data.publishDate,
    text: smart(clip(strip(n.body ?? ''), 260)),
    html: '',
    source: n.data.link ?? '',
    domain: n.data.link ? domain(n.data.link) : '',
    href: `/updates/${n.id}/`,
  })),
].sort((a, b) => b.date.valueOf() - a.date.valueOf());

// the essay every mock typesets: quotes, charts, links and headings
export const essay = post('who-are-you-without-a-job');
export const shot = (id: string) => `/lab/shots/${id}.webp`;
export const GITHUB = 'https://github.com/bebhuvan';
export const TWITTER = 'https://twitter.com/bhuvanesh2007';
export const yearsWriting = posts.length;
export const kindLabel: Record<string, string> = { library: 'Rooms for old words', numbers: 'In numbers', reading: 'What I read', street: 'The street' };
export const kinds = ['library', 'numbers', 'reading', 'street'] as const;
export const today = new Date();
export const fmtLong = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
export const minutes = (p: { body?: string }) => Math.max(1, Math.round((p.body ?? '').split(/\s+/).length / 230));
// a description cut to its first sentence when it runs long
export const short = (d?: string) => { const t = dek(d); if (t.length <= 150) return t; const m = t.match(/^.{20,150}?[.?!](?=\s|$)/); return m ? m[0] : ''; };
