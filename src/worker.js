// Cloudflare Worker in front of the static site. Static files are served straight from
// the assets binding; this runs only for paths that aren't a file, which is where the
// old URLs live, so it redirects them and otherwise hands back the 404 page.
const exact = {
  '/blog/why-you-should-back-the-protesters-especially-if-you-cant-stand-them': '/blog/defend-their-right-to-protest/',
  // notes used to be "updates" and their page was "marginalia"
  '/marginalia': '/notes/',
  '/updates': '/notes/',
  '/feed': '/rss.xml',
  '/feed.xml': '/rss.xml',
  '/atom.xml': '/rss.xml',
};
const patterns = [
  [/^\/updates\/([^/]+)\/?$/, '/notes/$1/'],
  // Rabbit Holes paths, in case a link to one lands here
  [/^\/posts\/([^/]+)\/?$/, '/notes/$1/'],
  [/^\/tags\/([^/]+)\/?$/, '/topics/$1/'],
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    let to = exact[path];
    if (!to) for (const [re, t] of patterns) if (re.test(path)) { to = path.replace(re, t); break; }
    if (to) return Response.redirect(new URL(to + url.search, url.origin).toString(), 301);

    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    out.headers.set('X-Content-Type-Options', 'nosniff');
    out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return out;
  },
};
