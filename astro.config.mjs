// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://bebhuvan.com',
  integrations: [sitemap()],
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            critical: ['./src/styles/critical.css']
          }
        }
      }
    }
  }
});
