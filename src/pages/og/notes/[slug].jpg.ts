// A 1200x630 social card for each note without its own image: the title, set like
// public/og.jpg (scripts/og.mjs), so a shared note shows what it is about.
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { readFileSync } from 'node:fs';
import satori from 'satori';
import sharp from 'sharp';
import { fmtLong, kindLabel, smart } from '../../../utils/site';

export async function getStaticPaths() {
  return (await getCollection('notes')).filter((n) => !n.data.draft && !n.data.image).map((n) => ({ params: { slug: n.id }, props: { n } }));
}

// satori reads woff, not woff2, so the static fontsource cuts stand in for the variable ones
const font = (p: string) => readFileSync(`node_modules/@fontsource/${p}`);
const fonts = [
  { name: 'G', data: font('host-grotesk/files/host-grotesk-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'G', data: font('host-grotesk/files/host-grotesk-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'S', data: font('source-serif-4/files/source-serif-4-latin-300-italic.woff'), weight: 300 as const, style: 'italic' as const },
];
let portrait: Promise<string> | undefined;
const face = () => (portrait ??= sharp('public/profile-pic-160.webp').png().toBuffer().then((b) => `data:image/png;base64,${b.toString('base64')}`));

const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}) => ({ type, props: { style, children, ...extra } });

export const GET: APIRoute = async ({ props }) => {
  const d = (props.n as CollectionEntry<'notes'>).data;
  // the card's fonts have no emoji, so those drop out rather than showing as empty boxes
  const title = smart(d.title).replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').trim();
  // long titles step down so they still fit in four lines
  const size = title.length > 90 ? 52 : title.length > 55 ? 62 : 74;
  const svg = await satori(
    el('div', { width: 1200, height: 630, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff', color: '#0f0f0f', fontFamily: 'G', borderTop: '14px solid #D9471A', padding: '56px 80px 60px' }, [
      el('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
        el('img', { width: 64, height: 64, borderRadius: 32 }, undefined, { src: await face(), width: 64, height: 64 }),
        el('div', { display: 'flex', fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }, [el('span', {}, 'Bhuvan'), el('span', { color: '#D9471A' }, '.')]),
      ]),
      el('div', { display: 'flex', fontSize: size, fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.035em' }, title),
      el('div', { display: 'flex', justifyContent: 'space-between', fontFamily: 'S', fontStyle: 'italic', fontWeight: 300, fontSize: 28, color: '#595959', borderTop: '3px solid #0f0f0f', paddingTop: 18 }, [
        el('span', {}, `${kindLabel[d.kind] ?? 'Note'} · ${fmtLong(d.date)}`),
        el('span', {}, 'bebhuvan.com'),
      ]),
    ]),
    { width: 1200, height: 630, fonts },
  );
  const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 86 }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
