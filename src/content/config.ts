import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishDate: z.coerce.date(),
    link: z.string().optional(),
    linkTitle: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.enum(['thinking', 'working', 'mindlog', 'voice']).optional(),
    marginNote: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    link: z.string().optional(),
    url: z.string().optional(),
    icon: z.string().optional(),
    story: z.string().optional(),
    status: z.enum(['active', 'completed', 'archived']).optional(),
    order: z.number().optional(),
  }),
});

const now = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    category: z.enum(['thinking', 'working', 'mindlog']),
    title: z.string().optional(),
  }),
});

const books = defineCollection({
  type: 'content',
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
