import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  // Get blog posts
  const blog = await getCollection('blog');
  const blogPosts = blog
    .filter(post => !post.data.draft)
    .map(post => ({ ...post, type: 'blog' }));

  // Get updates (if they exist)
  let updates = [];
  try {
    const updatesCollection = await getCollection('updates');
    updates = updatesCollection.map(update => ({ ...update, type: 'update' }));
  } catch (e) {
    // Updates collection doesn't exist or is empty
  }

  // Combine and sort all posts
  const allPosts = [...blogPosts, ...updates]
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  return rss({
    title: "Bhuvan",
    description: "Long-form writing, quick updates, and fascinating discoveries",
    site: context.site!,
    items: await Promise.all(allPosts.map(async (post) => {
      return {
        title: post.data.title,
        pubDate: post.data.publishDate,
        description: post.data.description,
        content: post.body,
        link: `/${post.type === 'blog' ? 'blog' : 'updates'}/${post.slug}/`,
      };
    })),
    customData: `<language>en-us</language>`,
  });
}