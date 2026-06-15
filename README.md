# The Folio — bebhuvan.com

My personal website and blog, where I write about finance, economics, markets, books, and whatever else is bothering me that week.

**Live site:** [bebhuvan.com](https://bebhuvan.com)

It's built around an "editorial warmth" design language — a literary-magazine feel with handwritten marginalia, warm paper tones, and a flame-orange accent. Zero client-side JavaScript; every interaction and animation is CSS-only.

## Tech

- **[Astro](https://astro.build)** (v5) — static site generation, content collections
- **Markdown** content, managed via [Pages CMS](https://pagescms.org) (git-based)
- **Cloudflare Pages** for hosting, deployed with [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- Custom rehype plugins for Tufte-style margin notes and responsive images

## Sections

Writing · Marginalia · Trails · Projects · Books · Now

- **Writing** — long-form essays, archived by year
- **Marginalia** — shorter notes, links, and voice memos
- **Trails** — an RSS aggregator pulling from a handful of feeds I keep up with
- **Projects** — things I've built ([Seneca's Letters](https://seneca.ink), [Rabbit Holes](https://rabbitholes.garden), [Smallweb](https://smallweb.blog), and more)
- **Books** — notes and highlights from what I've read
- **Now** — a static snapshot of what I'm currently up to

## Local development

```bash
npm install
npm run dev      # dev server at localhost:4321
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run deploy   # build + deploy to Cloudflare Pages
```

## Structure

```
src/
  pages/        route components (.astro)
  layouts/      page shell, <head> meta, JSON-LD
  components/   Nav, Footer, PageHeader, MarginNote, etc.
  content/      markdown collections + schema (config.ts)
  plugins/      rehype plugins (margin notes, image attrs)
  styles/       global.css
  utils/        RSS aggregator
public/         static assets (images, favicon, robots.txt)
```

Content lives in `src/content/`, with a typed schema per collection in `src/content/config.ts`. Per-page styles are scoped in each page's own `<style>` block; shared styles live in `src/styles/global.css`.
