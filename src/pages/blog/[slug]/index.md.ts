// /blog/<slug>/index.md: the essay as Markdown, for people and machines that want the source
import { getCollection } from 'astro:content';
import { SITE, smart, fmtLong } from '../../../utils/site';
export async function getStaticPaths() {
  return (await getCollection('blog')).filter((p) => !p.data.draft).map((p) => ({ params: { slug: p.id }, props: { p } }));
}
export function GET({ props }: { props: { p: any } }) {
  const { p } = props;
  const text = `# ${smart(p.data.title)}\n\nBy ${SITE.author} · ${fmtLong(p.data.publishDate)} · ${SITE.url}/blog/${p.id}/\n\n${p.data.description ? `> ${smart(p.data.description)}\n\n` : ''}${(p.body ?? '').trim()}\n`;
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
