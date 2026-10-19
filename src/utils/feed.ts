// RSS for essays, notes, or both. Items carry the full rendered post with absolute URLs.
import rss from '@astrojs/rss';
import { SITE, posts, notes, smart, plain, clip, domain, postHref, noteHref } from './site';

type Which = 'all' | 'essays' | 'notes';
// characters XML forbids (an old essay carries a stray \x02)
const clean = (s = '') => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');
const abs = (html = '') => clean(html).replace(/(\s(?:src|href|srcset)=")\/(?!\/)/g, `$1${SITE.url}/`).replace(/(,\s*)\/(?!\/)([^\s,"]+\s\d+w)/g, `$1${SITE.url}/$2`);
const titles: Record<Which, string> = { all: 'Bhuvan', essays: 'Bhuvan: essays', notes: 'Bhuvan: notes' };
const blurbs: Record<Which, string> = {
  all: 'Essays and notes by Bhuvan, from Bangalore.',
  essays: 'Long essays by Bhuvan on money, technology, history and books.',
  notes: 'Short notes and links by Bhuvan: a commonplace book kept in the open. Formerly rabbitholes.garden.',
};

export function feed(which: Which, self: string) {
  const items = [
    ...(which !== 'notes' ? posts.map((p) => ({
      title: smart(p.data.title),
      link: postHref(p),
      pubDate: p.data.publishDate,
      description: clean(smart(p.data.description) || clip(plain(p.body), 200)),
      content: abs(p.rendered?.html),
      categories: p.data.tags,
    })) : []),
    ...(which !== 'essays' ? notes.map((n) => ({
      title: smart(n.data.title),
      link: noteHref(n),
      pubDate: n.data.date,
      description: clean(smart(n.data.description) || clip(plain(n.body), 200)),
      content: (n.data.url ? `<p>Source: <a href="${n.data.url}">${domain(n.data.url)}</a></p>` : '') + abs(n.rendered?.html),
      categories: n.data.tags,
    })) : []),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()).slice(0, which === 'essays' ? 100 : 60);
  return rss({
    title: titles[which],
    description: blurbs[which],
    site: SITE.url,
    items,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en-in</language><atom:link href="${SITE.url}${self}" rel="self" type="application/rss+xml" /><image><url>${SITE.url}/profile-pic-160.webp</url><title>${titles[which]}</title><link>${SITE.url}/</link></image>`,
    trailingSlash: true,
  });
}
