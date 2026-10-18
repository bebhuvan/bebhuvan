import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// one folder per collection under src/content/; the entry id is the file name
const md = (dir: string) => glob({ pattern: '**/[^_]*.md', base: `./src/content/${dir}` });

const blog = defineCollection({
  loader: md('blog'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    image: z.string().optional(),
    imageCaption: z.string().optional(),
    readingTime: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

const updates = defineCollection({
  loader: md('updates'),
  schema: z.object({
    title: z.string(),
    publishDate: z.coerce.date(),
    link: z.string().optional(),
    linkTitle: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.enum(['thinking', 'working', 'mindlog', 'voice']).optional(),
    marginNote: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: md('projects'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // a few words for the home page list
    tagline: z.string().optional(),
    link: z.string().optional(),
    url: z.string().optional(),
    icon: z.string().optional(),
    story: z.string().optional(),
    status: z.enum(['active', 'completed', 'archived']).optional(),
    // groups the projects page: library | numbers | reading | street
    kind: z.enum(['library', 'numbers', 'reading', 'street']).optional(),
    order: z.number().optional(),
  }),
});

const now = defineCollection({
  loader: md('now'),
  schema: z.object({
    date: z.coerce.date(),
    category: z.enum(['thinking', 'working', 'mindlog']),
    title: z.string().optional(),
  }),
});

const books = defineCollection({
  loader: md('books'),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    finishedDate: z.string().optional(),
    year: z.number().optional(),
    pull: z.string().optional(),
    tags: z.array(z.string()).optional(),
    hand: z.string().optional(),
    rating: z.string().optional(),
    coverColor: z.enum(['flame', 'blue', 'green', 'gold', 'purple']).optional(),
  }),
});

export const collections = { blog, updates, projects, now, books };
