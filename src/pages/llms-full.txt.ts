// Every essay in full, as Markdown, for language models.
import { SITE, posts, smart, fmtLong, postHref } from '../utils/site';

export function GET() {
  const parts = posts.map((p) => [
    `# ${smart(p.data.title)}`,
    '',
    `URL: ${new URL(postHref(p), SITE.url)}`,
    `Published: ${fmtLong(p.data.publishDate)}`,
    p.data.description ? `Summary: ${smart(p.data.description)}` : '',
    '',
    (p.body ?? '').trim(),
  ].filter((l, i) => l !== '' || i !== 4).join('\n'));
  const head = `# ${SITE.name}: every essay\n\n> ${SITE.description}\n\n${posts.length} essays, newest first. Notes are listed at ${SITE.url}/llms.txt.\n\n`;
  return new Response(head + parts.join('\n\n---\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
