// llms.txt (https://llmstxt.org): what this site is and where everything is, for language models.
import { SITE, posts, notes, projects, books, topics, smart, short, postHref, noteHref, bookHref, topicHref } from '../utils/site';

export function GET() {
  const u = (p: string) => new URL(p, SITE.url).toString();
  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    `Bhuvan lives in ${SITE.city} and works at Zerodha on markets, data and curation. This site holds his long essays (/blog/), short notes and links (/notes/, a commonplace book that used to live at rabbitholes.garden), the small websites he builds (/projects/), the books he reads (/books/) and a /now page. Every essay and note is also available as plain Markdown at the same URL with index.md appended. The full text of every essay is in ${u('/llms-full.txt')}.`,
    '',
    '## Essays',
    '',
    ...posts.map((p) => `- [${smart(p.data.title)}](${u(postHref(p))})${short(p.data.description) ? `: ${short(p.data.description)}` : ''}`),
    '',
    '## Projects',
    '',
    ...projects.map((p) => `- [${smart(p.data.title)}](${p.data.link}): ${smart(p.data.description)}`),
    '',
    '## Notes',
    '',
    `- [All notes](${u('/notes/')}): ${notes.length} short notes and links, newest first`,
    `- [Notes feed](${u('/notes/rss.xml')})`,
    ...notes.slice(0, 40).map((n) => `- [${smart(n.data.title)}](${u(noteHref(n))})`),
    '',
    '## Optional',
    '',
    `- [Now](${u('/now/')}): what he is doing at the moment`,
    `- [Books](${u('/books/')}): ${books.length} books, with notes`,
    ...books.map((b) => `- [${smart(b.data.title)} by ${b.data.author}](${u(bookHref(b))})`),
    `- [Topics](${u('/topics/')}): ${topics.slice(0, 20).map((t) => `[${t.tag}](${u(topicHref(t.tag))})`).join(', ')}`,
    `- [Everything feed](${u('/rss.xml')})`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
