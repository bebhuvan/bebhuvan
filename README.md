# Bhuvan's Personal Website

My personal website and blog built with Astro. A clean, minimal design for sharing long-form writing, quick updates, and project showcases.

**Live Site**: [bebhuvan.com](https://bebhuvan.com) | **Worker**: [bhuvan-blog.r-bhuvanesh2007.workers.dev](https://bhuvan-blog.r-bhuvanesh2007.workers.dev)

## Features

- **Modern Typography**: Inter font for readability
- **Clean Design**: Minimal layout with orange accents (#ff6b35) 
- **Multiple Content Types**:
  - Long-form blog posts about finance, markets, and random thoughts
  - Quick updates and interesting links
  - Project showcase
- **SEO Optimized**: Meta tags, Open Graph, Twitter cards, JSON-LD structured data
- **Combined RSS Feed**: Single feed for all content types
- **Static Generation**: Fast performance with Astro and Cloudflare Workers
- **Mobile Responsive**: Works great on all devices
- **😲 Favicon**: Because why not?

## About

This is my personal website where I share:

- Long-form writing about finance, economics, markets, and whatever else bothers me
- Quick updates and interesting links I discover
- Projects I'm working on like [Paper Lanterns](https://paperlanterns.ink/) and [Rabbit Holes](https://www.rabbitholes.garden/)

I work at [Zerodha](https://zerodha.com/) doing [hard to describe things] and occasionally write on [Z-Connect](https://zerodha.com/z-connect/author/bhuvanesh-r).

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
wrangler deploy
```

## Project Structure

```
src/
├── components/
│   ├── Header.astro          # Site navigation
│   ├── Footer.astro          # Site footer
│   ├── BlogCard.astro        # Blog post preview
│   ├── UpdateCard.astro      # Update/micro-post card
│   ├── ProjectCard.astro     # Project showcase card
│   └── LinkPreview.astro     # Link preview component
├── content/
│   ├── blog/                 # Blog posts (markdown)
│   ├── updates/              # Micro-blog posts (markdown)
│   ├── projects/             # Project descriptions (markdown)
│   └── config.ts             # Content collections config
├── layouts/
│   └── Layout.astro          # Base page layout
├── pages/
│   ├── index.astro           # Homepage
│   ├── about.astro          # About page
│   ├── blog/
│   │   ├── index.astro       # Blog listing
│   │   └── [slug].astro      # Individual blog posts
│   ├── updates/
│   │   ├── index.astro       # Updates listing
│   │   └── [slug].astro      # Individual updates
│   ├── projects.astro        # Projects page
│   ├── rss.xml.ts           # Combined RSS feed
│   └── updates-rss.xml.ts   # Updates RSS feed (legacy)
└── styles/
    └── global.css            # Global styles
```

## Tech Stack

- **Framework**: [Astro](https://astro.build/) for static site generation
- **Hosting**: [Cloudflare Workers](https://workers.cloudflare.com/) with static assets
- **Fonts**: [Inter](https://rsms.me/inter/) for clean, readable typography
- **Styling**: Custom CSS with CSS custom properties
- **Content**: Markdown files with frontmatter

## Content Management

#### Blog Posts

Create markdown files in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "A brief description of your post"
publishDate: 2024-03-15
readingTime: "12 min read"
tags: ["tag1", "tag2"]
draft: false
---

Your markdown content here...
```

#### Updates/Micro-blog

Create markdown files in `src/content/updates/`:

```markdown
---
publishDate: 2024-03-16T10:30:00Z
link: "https://example.com/interesting-article"
linkTitle: "Interesting Article Title"
tags: ["links"]
---

Your quick thought or comment about the link...
```

#### Projects

Create markdown files in `src/content/projects/`:

```markdown
---
title: "Project Name"
description: "Brief project description"
link: "https://github.com/username/project"
status: "active"
order: 1
---

Detailed project description...
```

## Customization

### Colors and Branding

Edit the CSS variables in `src/styles/global.css`:

```css
:root {
    --primary-orange: #ff6b35;    /* Primary accent color */
    --soft-orange: #ffb5a3;       /* Soft accent color */
    --text-dark: #2c2c2c;         /* Main text color */
    --text-medium: #666;          /* Secondary text */
    --text-light: #999;           /* Light text */
    --bg-white: #ffffff;          /* Background */
    --bg-off-white: #fefefe;      /* Alt background */
    --border-light: #f0f0f0;      /* Borders */
}
```

### Site Configuration

Update `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://yourdomain.com', // Your actual domain
  integrations: [sitemap()],
});
```

### Personal Information

Update the hero section in `src/pages/index.astro`:

```astro
<h1>Hey, I'm <span class="accent">YourName</span></h1>
<p class="hero-subtitle">Your tagline here</p>
```

### Navigation

Update navigation links in `src/components/Header.astro`.

## Link Previews

The theme supports link previews in the updates feed. To enable rich link previews:

1. Integrate with a service like Microlink API
2. Update `src/components/LinkPreview.astro` with API calls
3. Add environment variables for API keys

## RSS Feed

The site has a combined RSS feed at `/rss.xml` that includes both blog posts and updates.

## Contact

- **Email**: [bhuvan@bebhuvan.com](mailto:bhuvan@bebhuvan.com)
- **Twitter**: [@bebhuvan](https://twitter.com/bebhuvan)  
- **LinkedIn**: [bebhuvan](https://www.linkedin.com/in/bebhuvan/)
- **Substack**: [bhuvan.substack.com](https://bhuvan.substack.com/)

---

*Welcome to my small little corner on the dumpster fire that is the interweb where I share the things I do, write and discover.*
