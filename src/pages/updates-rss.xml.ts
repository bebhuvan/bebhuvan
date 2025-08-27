import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const updates = await getCollection('updates');
  const sortedUpdates = updates
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  return rss({
    title: "Bhuvan's Updates",
    description: "Quick updates, links, and thoughts",
    site: context.site!,
    items: sortedUpdates.map((update) => ({
      title: `Update: ${update.data.publishDate.toLocaleDateString()}`,
      pubDate: update.data.publishDate,
      description: update.body,
      link: `/updates/${update.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}