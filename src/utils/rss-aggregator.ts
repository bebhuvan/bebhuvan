import Parser from 'rss-parser';

const parser = new Parser();

// RSS feeds to aggregate
const RSS_FEEDS = [
  { url: 'https://bhuvan.substack.com/feed', source: 'Substack' },
  { url: 'https://fromthedumpsterfire.com/rss.xml', source: 'FromTheDumpsterFire' },
  { url: 'https://rabbitholes.garden/rss.xml', source: 'Rabbit Holes' },
  { url: 'https://paperlanterns.ink/rss.xml', source: 'Paper Lanterns' },
];

export interface RSSUpdate {
  title: string;
  link: string;
  excerpt: string;
  pubDate: Date;
  source: string;
}

// Strip HTML tags and get first paragraph
function getExcerpt(content: string, maxLength: number = 200): string {
  // Remove HTML tags
  const stripped = content.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  const decoded = stripped
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Get first paragraph or first maxLength characters
  const firstPara = decoded.split('\n\n')[0] || decoded;

  if (firstPara.length > maxLength) {
    return firstPara.substring(0, maxLength).trim() + '...';
  }

  return firstPara.trim();
}

// Fetch and aggregate RSS feeds
export async function aggregateRSSFeeds(limit: number = 5): Promise<RSSUpdate[]> {
  const allItems: RSSUpdate[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const result = await parser.parseURL(feed.url);

      if (result.items) {
        const items = result.items.slice(0, 5).map(item => ({
          title: item.title || 'Untitled',
          link: item.link || '',
          excerpt: getExcerpt(item.contentSnippet || item.content || '', 200),
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: feed.source,
        }));

        allItems.push(...items);
      }
    } catch (error) {
      console.error(`Error fetching feed ${feed.url}:`, error);
      // Continue with other feeds even if one fails
    }
  }

  // Sort by date (newest first) and return limited results
  return allItems
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, limit);
}
