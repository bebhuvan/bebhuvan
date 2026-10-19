# bebhuvan.com

My personal website: long essays, short notes and links, the small websites I build, the books I read and a /now page.

**Live site:** [bebhuvan.com](https://bebhuvan.com)

The design is *Contributor on the grid* (October 2026): a 12-column grid with numbered sections on ink rules, Host Grotesk for headlines and labels, Source Serif 4 for everything read at length, margin notes in their own columns beside the text, and one flame accent. White ground, no dark mode, zero client-side JavaScript.

The notes are a commonplace book that used to live at rabbitholes.garden; all of it moved here in October 2026 with the same slugs.

## Writing from a phone

Everything is edited in [Pages CMS](https://app.pagescms.org) (`.pages.yml`). Saving commits to this repo, and the site deploys itself a minute or two later.

- **Notes**: title, kind (note, link, quote, verse), the source link if there is one, and the text. The date fills itself in.
- **Essays**: plain Markdown, so margin notes (`[^1]`) and embeds survive. New essays start as drafts: readable at their address, not listed anywhere. Untick *Draft* to publish.
- **Books**: title, author, reading/read, and a one-line verdict. Notes optional.
- **Now**: add a new entry; the newest is the /now page and older ones stay below it.

## Tech

- [Astro](https://astro.build) 7, static, Markdown content collections (`src/content.config.ts`)
- Cloudflare Workers (static assets + a small redirect Worker, `src/worker.js`), deployed by GitHub Actions on push to `master`
- Rehype plugins: margin notes from footnotes, image sizes and srcsets, tidy bare links
- `scripts/images.mjs` runs before every build: sizes for every image, WebP copies of heavy uploads

## Local development

```bash
npm install
npm run dev      # dev server at localhost:4321
npm run build    # production build to dist/
npm run preview  # preview the build
```

Feeds: `/rss.xml` (everything), `/writing/rss.xml` (essays), `/notes/rss.xml` (notes). For language models: `/llms.txt`, `/llms-full.txt`, and any essay or note as Markdown at `<its address>index.md`.
