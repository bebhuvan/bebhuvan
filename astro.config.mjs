// @ts-check
// Dates in content are wall-clock times with no zone ("2026-10-19T23:30", as Pages CMS
// writes them). Reading and printing them all in UTC keeps the date exactly as written,
// whatever machine builds the site.
process.env.TZ = 'UTC';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeMarginNotes from './src/plugins/rehype-margin-notes.js';
import rehypeImageAttrs from './src/plugins/rehype-image-attrs.js';
import rehypeBareLinks from './src/plugins/rehype-bare-links.js';
import { readdirSync, readFileSync } from 'node:fs';

// Sitemap dates and exclusions come straight from frontmatter (the config can't read
// content collections): the date each essay and note was published, and drafts left out.
const fm = (dir, field) => Object.fromEntries(readdirSync(`./src/content/${dir}`).filter((f) => f.endsWith('.md')).map((f) => {
  const t = readFileSync(`./src/content/${dir}/${f}`, 'utf8').split('\n---')[0];
  const date = t.match(new RegExp(`^(?:updatedDate|${field}):\\s*["']?([0-9T:.-]+)`, 'm'))?.[1];
  return [f.replace(/\.md$/, '').toLowerCase(), { date, draft: /^draft:\s*true/m.test(t) }];
}));
const dates = { blog: fm('blog', 'publishDate'), notes: fm('notes', 'date') };

// https://astro.build/config
export default defineConfig({
  site: 'https://bebhuvan.com',
  // Trailing slashes consistent with how the existing URLs are linked.
  trailingSlash: 'always',
  // true keeps whitespace between inline elements (Astro 7's default, 'jsx',
  // would glue "<span>a</span> <em>b</em>" together).
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => {
        const m = page.match(/\/(blog|notes)\/([^/]+)\/$/);
        return !page.endsWith('/404/') && !(m && dates[m[1]]?.[m[2]]?.draft);
      },
      serialize: (item) => {
        const m = item.url.match(/\/(blog|notes)\/([^/]+)\/$/);
        const d = m && dates[m[1]]?.[m[2]]?.date;
        if (d) item.lastmod = new Date(d).toISOString();
        return item;
      },
    }),
  ],
  markdown: {
    // Astro 7 defaults to its native Sätteri processor; the margin-notes rehype
    // plugin needs the unified (remark/rehype) pipeline.
    processor: unified({
      rehypePlugins: [rehypeMarginNotes, rehypeImageAttrs, rehypeBareLinks],
      smartypants: true,
    }),
  },
  build: {
    // The one stylesheet goes inline in every page (about 8KB compressed): most
    // visits are a single page from a shared link, and a separate file held the
    // first paint for a whole round trip (PageSpeed, 19 Oct 2026).
    inlineStylesheets: 'always',
    assets: '_astro',
  },
  vite: {
    build: {
      // Per-page CSS splitting. Caches better than one giant bundle for
      // return visitors who navigate between pages.
      cssCodeSplit: true,
      cssMinify: 'lightningcss',
      minify: 'esbuild',
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        // Modern targets — drops legacy prefixes.
        targets: {
          chrome: 110 << 16,
          firefox: 115 << 16,
          safari: 16 << 16,
        },
      },
    },
  },
});
