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
