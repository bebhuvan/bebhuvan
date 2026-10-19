#!/usr/bin/env python3
"""One-off migration (October 2026): Rabbit Holes posts and the old `updates`
collection become the single `notes` collection.

usage: python3 -I scripts/migrate-rabbitholes.py <rabbit-holes checkout> <this repo>

- Rabbit Holes posts keep their file names, so /posts/<slug> on rabbitholes.garden
  maps to /notes/<slug>/ here.
- type: links (with a source URL) -> kind: link; verse -> verse; everything else
  (musings, reflections, practical) -> note.
- published: false or draft: true -> draft: true (kept, not shown).
- Images under /images/ are copied to public/note-images/ and their paths rewritten.
- A paragraph that is only the source URL is dropped: the page shows the source.
- Tags are trimmed, lower-cased and de-duplicated.
- An update that duplicates a Rabbit Holes post is merged into it (its link and
  margin note are kept); the rest become notes too.
"""
import re, shutil, sys
from urllib.parse import unquote
from pathlib import Path
import yaml

src_repo, dst_repo = Path(sys.argv[1]), Path(sys.argv[2])
posts_dir = src_repo / 'src/content/posts'
out_dir = dst_repo / 'src/content/notes'
img_src = src_repo / 'public/images'
img_dst = dst_repo / 'public/note-images'
out_dir.mkdir(parents=True, exist_ok=True)
img_dst.mkdir(parents=True, exist_ok=True)

FM = re.compile(r'^---\n(.*?)\n---\n?(.*)$', re.S)

def split(text):
    m = FM.match(text)
    return (yaml.safe_load(m.group(1)) or {}, m.group(2)) if m else ({}, text)

def tags_of(v):
    out = []
    for t in v or []:
        t = re.sub(r'\s+', ' ', str(t)).strip().lower()
        if t and t not in out:
            out.append(t)
    return out

def norm_url(u):
    return re.sub(r'[?#].*$', '', (u or '').strip()).rstrip('/').replace('://www.', '://')

missing_images = []

def fix_body(body, url):
    # images: copy local ones, drop blob: (never uploaded), emoji SVGs become their alt text
    def img(m):
        alt, target = m.group(1), m.group(2)
        bare = target.strip('<>').split(' "')[0]
        if bare.startswith('blob:'):
            return ''
        if 'twimg.com/emoji' in bare:
            return alt
        if bare.startswith('/images/'):
            name = bare[len('/images/'):]
            f = img_src / unquote(name)
            if f.exists():
                shutil.copy2(f, img_dst / unquote(name))
            else:
                missing_images.append(name)
            return f'![{alt}]({target.replace("/images/", "/note-images/", 1)})'
        return m.group(0)
    # targets may contain one level of parentheses: foo-(1).png
    body = re.sub(r'!\[([^\]]*)\]\((<[^>]+>|(?:[^()\s]|\([^()\s]*\))+(?: "[^"]*")?)\)', img, body)
    # a paragraph that is only the source URL (bare, or linked as itself)
    if url:
        def only_source(p):
            s = p.strip()
            m = re.fullmatch(r'\[([^\]]+)\]\(([^)]+)\)|<?(https?://\S+?)>?', s)
            if not m:
                return False
            href = m.group(2) or m.group(3)
            text = m.group(1) or href
            return norm_url(href) == norm_url(url) and text.startswith('http')
        paras = re.split(r'\n{2,}', body.strip())
        body = '\n\n'.join(p for p in paras if not only_source(p))
    # links between Rabbit Holes posts now point at the notes here
    body = re.sub(r'https?://(?:www\.)?rabbitholes\.garden/posts/([\w.-]+?)/?(?=[)\s>\]"])', r'/notes/\1/', body)
    return body.strip() + '\n'

def further_of(v):
    out = []
    for item in v or []:
        if isinstance(item, str):
            out.append({'title': item.strip(), 'url': item.strip()})
        elif isinstance(item, dict) and item.get('url'):
            d = {'title': str(item.get('text') or item['url']).strip(), 'url': item['url'].strip()}
            if item.get('description'):
                d['note'] = str(item['description']).strip()
            out.append(d)
    return out

def write(name, data, body):
    # notes carry a time (Pages CMS writes yyyy-MM-ddTHH:mm), so old dates get midnight
    if not isinstance(data['date'], str):
        data['date'] = f"{data['date']:%Y-%m-%d}T00:00"
    fm = yaml.safe_dump(data, sort_keys=False, allow_unicode=True, width=10_000)
    (out_dir / name).write_text(f'---\n{fm}---\n{body}', encoding='utf-8')

kinds = {}
written = {}
for f in sorted(posts_dir.glob('*.md')):
    fm, body = split(f.read_text(encoding='utf-8'))
    url = (fm.get('url') or '').strip() or None
    t = fm.get('type', 'musings')
    kind = 'verse' if t == 'verse' else ('link' if t == 'links' and url else 'note')
    data = {'title': str(fm['title']).strip(), 'date': fm['date'], 'kind': kind}
    if url: data['url'] = url
    desc = fm.get('description') or (fm.get('seo') or {}).get('meta_description')
    if desc: data['description'] = re.sub(r'\s+', ' ', str(desc)).strip()
    tg = tags_of(fm.get('tags'))
    if tg: data['tags'] = tg
    fr = further_of(fm.get('dive_deeper'))
    if fr: data['further'] = fr
    if fm.get('published') is False or fm.get('draft') is True:
        data['draft'] = True
    write(f.name, data, fix_body(body, url))
    written[f.name] = data
    kinds[kind] = kinds.get(kind, 0) + 1

# the site's own updates
for f in sorted((dst_repo / 'src/content/updates').glob('*.md')):
    fm, body = split(f.read_text(encoding='utf-8'))
    if f.name in written:
        # same note was posted in both places: keep Rabbit Holes' copy, add the aside
        data = written[f.name]
        if fm.get('marginNote'): data['note'] = fm['marginNote']
        if not data.get('url') and fm.get('link'):
            data['url'] = fm['link']
        _, rbody = split((out_dir / f.name).read_text(encoding='utf-8'))
        write(f.name, data, rbody)
        continue
    url = (fm.get('link') or '').strip() or None
    data = {'title': str(fm['title']).strip(), 'date': fm['publishDate'], 'kind': 'note'}
    if url: data['url'] = url
    tg = tags_of(fm.get('tags'))
    if tg: data['tags'] = tg
    if fm.get('marginNote'): data['note'] = fm['marginNote']
    if fm.get('image'): data['image'] = fm['image']
    if fm.get('imageAlt'): data['imageAlt'] = fm['imageAlt']
    write(f.name, data, fix_body(body, url))
    kinds['note'] += 1

print('notes:', sum(kinds.values()), kinds)
print('drafts:', sum(1 for d in written.values() if d.get('draft')))
print('missing images:', missing_images)
