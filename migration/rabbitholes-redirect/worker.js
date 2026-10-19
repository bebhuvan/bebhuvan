// rabbitholes.garden, papertrails. and booktrails., retired October 2026: every path 301s to its new home on bebhuvan.com.
// The posts became notes with the same slugs; tags became topics; feeds point at the notes feed.
const TO = 'https://bebhuvan.com';
const map = [
  // public on Rabbit Holes, unpublished here: they announced Book Trails, so they go to the books
  [/^\/posts\/(2025-08-27-your-next-good-read|2025-09-06-aggregating-book-mentions)\/?$/, () => '/books/'],
  [/^\/posts\/([^/]+)\/?$/, (m) => `/notes/${m[1]}/`],
  [/^\/tags\/([^/]+)\/?$/, (m) => `/topics/${m[1]}/`],
  [/^\/types\/links\/?$/, () => '/notes/links/'],
  [/^\/types\/verse\/?$/, () => '/notes/verse/'],
  [/^\/types\/.*$/, () => '/notes/notes/'],
  [/^\/(rss\.xml|feed|feed\.xml|atom\.xml)\/?$/, () => '/notes/rss.xml'],
  [/^\/sitemap.*\.xml$/, () => '/sitemap-index.xml'],
  [/^\/(about)\/?$/, () => '/'],
  [/^\/(archive|tags|types|heads|collections|search)(\/.*)?$/, () => '/notes/'],
  // not carried over yet: the study notes (glosses) and the Stardust explainer
  [/^\/(glosses|study-notes|explainers)(\/.*)?$/, () => '/notes/'],
  [/^\/blogroll\/?$/, () => '/trails/'],
];

// Paper Trails and Book Trails (subdomains) are retired with it.
const hosts = { 'papertrails.rabbitholes.garden': '/', 'booktrails.rabbitholes.garden': '/books/' };

export default {
  fetch(request) {
    const url = new URL(request.url);
    if (url.hostname in hosts) return Response.redirect(TO + hosts[url.hostname], 301);
    for (const [re, to] of map) {
      const m = url.pathname.match(re);
      if (m) return Response.redirect(TO + to(m), 301);
    }
    return Response.redirect(TO + '/notes/', 301);
  },
};
