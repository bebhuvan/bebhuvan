import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// one folder per collection under src/content/; the entry id is the file name.
// Every field Pages CMS writes is described in .pages.yml; keep the two in step.
const md = (dir: string) => glob({ pattern: '**/[^_]*.md', base: `./src/content/${dir}` });

// Pages CMS leaves optional fields as empty strings or nulls; treat those as absent
const opt = <T extends z.ZodTypeAny>(t: T) => z.preprocess((v) => (v === '' || v === null ? undefined : v), t.optional());
// tags: trimmed, lower case, "ai, work" split in two, and a few synonyms folded together
const tagAlias: Record<string, string> = {
  'artificial intelligence': 'ai',
  'large language models': 'llms',
  llm: 'llms',
  'indian economy': 'india',
};
const tags = z.preprocess(
  (v) => {
    const list = (Array.isArray(v) ? v : typeof v === 'string' ? [v] : []).flatMap((t) => String(t).split(','));
    const out = list.map((t) => t.trim().toLowerCase().replace(/\s+/g, ' ')).map((t) => tagAlias[t] ?? t).filter(Boolean);
    return [...new Set(out)];
  },
  z.array(z.string()),
);

const blog = defineCollection({
  loader: md('blog'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: opt(z.coerce.date()),
    image: opt(z.string()),
    imageCaption: opt(z.string()),
    readingTime: opt(z.string()),
    tags,
    draft: z.boolean().default(false),
  }),
});

// short form: notes, links, verse. Rabbit Holes was folded in here in October 2026.
const notes = defineCollection({
  loader: md('notes'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['note', 'link', 'quote', 'verse']).default('note'),
    // the thing a link note points at
    url: opt(z.string().url()),
    via: opt(z.string()),
    description: opt(z.string()),
    // a one-line aside, set apart under the note
    note: opt(z.string()),
    tags,
    further: opt(z.array(z.object({ title: z.string(), url: z.string(), note: opt(z.string()) }))),
    image: opt(z.string()),
    imageAlt: opt(z.string()),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: md('projects'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // a few words for lists
    tagline: opt(z.string()),
    link: opt(z.string()),
    url: opt(z.string()),
    story: opt(z.string()),
    status: z.enum(['active', 'completed', 'archived']).default('active'),
    // groups the projects page: library | numbers | reading | street
    kind: z.enum(['library', 'numbers', 'reading', 'street']).default('library'),
    // featured projects get a screenshot on the home and projects pages
    featured: z.boolean().default(false),
    image: opt(z.string()),
    order: z.number().default(99),
  }),
});

const now = defineCollection({
  loader: md('now'),
  schema: z.object({
    date: z.coerce.date(),
    title: opt(z.string()),
    category: opt(z.string()),
  }),
});

const books = defineCollection({
  loader: md('books'),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    status: z.enum(['reading', 'read', 'abandoned']).default('read'),
    // when it was finished (or started, while reading)
    date: opt(z.coerce.date()),
    // legacy: finishedDate "2025" and year 2025 before `date` existed
    finishedDate: opt(z.string()),
    year: opt(z.number()),
    // a one-line verdict
    hand: opt(z.string()),
    // a line from the book
    pull: opt(z.string()),
    link: opt(z.string()),
    tags,
    rating: opt(z.string()),
    coverColor: opt(z.string()),
  }),
});

export const collections = { blog, notes, projects, now, books };
