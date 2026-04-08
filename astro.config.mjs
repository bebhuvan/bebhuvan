// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeMarginNotes from './src/plugins/rehype-margin-notes.js';
import rehypeImageAttrs from './src/plugins/rehype-image-attrs.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://bebhuvan.com',
  // Trailing slashes consistent with how the existing URLs are linked.
  trailingSlash: 'always',
  // HTML compression strips whitespace from the rendered output. Default in
  // Astro 5 is true; making it explicit so it can't drift.
  compressHTML: true,
  // Prefetch links on hover (cheap, no JS framework dep, just a tiny script).
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeMarginNotes, rehypeImageAttrs],
    smartypants: true,
  },
  build: {
    // Inline small stylesheets into the HTML (~4KB threshold), keep larger
    // ones as separate files so they're cacheable across pages.
    inlineStylesheets: 'auto',
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
