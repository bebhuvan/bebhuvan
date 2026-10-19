// /notes/<slug>/index.md: the note as Markdown
import { getCollection } from 'astro:content';
import { SITE, smart, fmtLong } from '../../../utils/site';
export async function getStaticPaths() {
  return (await getCollection('notes')).filter((n) => !n.data.draft).map((n) => ({ params: { slug: n.id }, props: { n } }));
}
export function GET({ props }: { props: { n: any } }) {
  const { n } = props;
  const text = `# ${smart(n.data.title)}\n\nBy ${SITE.author} · ${fmtLong(n.data.date)} · ${SITE.url}/notes/${n.id}/\n${n.data.url ? `Source: ${n.data.url}\n` : ''}\n${(n.body ?? '').trim()}\n`;
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
