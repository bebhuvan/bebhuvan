# Retiring rabbitholes.garden

In October 2026 every Rabbit Holes post moved into the notes here
(`scripts/migrate-rabbitholes.py`), keeping its slug:
`rabbitholes.garden/posts/<slug>` → `bebhuvan.com/notes/<slug>/`.

This folder is a tiny Worker that replaces the Rabbit Holes site with 301 redirects.
Deploy it only after bebhuvan.com is live with the notes:

```sh
cd migration/rabbitholes-redirect
npx wrangler deploy        # needs a token that can manage rabbitholes.garden routes
```

Paper Trails and Book Trails are retired too: their subdomains redirect to the home
page and /books/. Before deploying, delete their old Workers or Pages projects in the
Cloudflare dashboard (and any custom-domain binding on them), otherwise the routes clash.
If either is served by a custom domain rather than a route, the redirect also needs a
DNS record for that name (a proxied AAAA to 100:: is enough for a route-only Worker).

Then, in the bebhuvan/rabbit-holes repo, stop its deploy workflow (or archive the
repo) so a push there doesn't put the old site back.

What goes where:

| Old | New |
|---|---|
| /posts/<slug> | /notes/<slug>/ |
| /tags/<tag> | /topics/<tag>/ |
| /types/links, /types/verse | /notes/links/, /notes/verse/ |
| /rss.xml | /notes/rss.xml |
| everything else | /notes/ |
| papertrails.rabbitholes.garden/* | / |
| booktrails.rabbitholes.garden/* | /books/ |

Not carried over yet: the study note on industrial policy (/glosses/…) and the
Stardust explainer (/explainers/stardust). Both redirect to /notes/ until they are.

Check after deploying:

```sh
curl -sI https://rabbitholes.garden/posts/2025-08-18-the-greatest-anonymous-poem | grep -i location
```
