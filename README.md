# Bhuvan's Blog Theme

A clean, minimal Astro blog theme for long-form writing with a micro-blog feed. Typography-focused, modern design with personality without being corporate.

## Features

- **Clean Typography**: Source Sans Pro font throughout
- **Minimal Design**: Lots of whitespace, orange accents (#ff6b35)
- **Multiple Content Types**:
  - Long-form blog posts
  - Quick updates/micro-blog
  - Project showcase
- **Link Previews**: Support for link previews in updates feed
- **PagesCMS Integration**: Content management with `.pages.yml` configuration
- **SEO Optimized**: Meta tags, Open Graph, Twitter cards
- **RSS Feeds**: Separate feeds for blog posts and updates
- **Static Generation**: Fast performance with Astro
- **Mobile Responsive**: Works great on all devices

## Quick Start

```bash
# Clone or download the theme
cd bhuvan-blog-theme

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
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
│   ├── blog/
│   │   ├── index.astro       # Blog listing
│   │   └── [slug].astro      # Individual blog posts
│   ├── updates/
│   │   ├── index.astro       # Updates listing
│   │   └── [slug].astro      # Individual updates
│   ├── projects.astro        # Projects page
│   ├── rss.xml.ts           # Blog RSS feed
│   └── updates-rss.xml.ts   # Updates RSS feed
└── styles/
    └── global.css            # Global styles
```

## Content Management

### Using PagesCMS

The theme includes PagesCMS configuration (`.pages.yml`) for easy content management:

1. Deploy your site to a hosting platform
2. Set up PagesCMS following their documentation
3. Use the web interface to manage your content

### Manual Content Creation

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

## RSS Feeds

The theme generates two RSS feeds:
- `/rss.xml` - Blog posts
- `/updates-rss.xml` - Updates/micro-blog

## SEO Features

- Automatic meta tags and Open Graph data
- Sitemap generation
- RSS feed auto-discovery
- Canonical URLs
- Twitter card support

## Deployment

### Netlify/Vercel/GitHub Pages
```bash
npm run build
# Deploy the dist/ folder
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
