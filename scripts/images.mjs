// Runs before `astro build` (and `astro dev`). Two jobs:
// 1. Heavy uploads (wider than 1400px or over 350KB, typically a phone photo
//    added through Pages CMS) get resized WebP copies next to the original:
//    <stem>-768w.webp and <stem>-1400w.webp. Other images wider than 1000px get a
//    768w copy, so phones and half-width slots (covers, project screenshots)
//    don't download the full width. Originals are never touched.
// 2. Writes src/data/images.generated.json: width, height and variants for every
//    image, so pages can set width/height (no layout shift) and srcset.
// Results are cached by path, size and mtime in node_modules/.cache, so repeat
// builds only look at new files.
import sharp from 'sharp';
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const PUBLIC = 'public';
const DIRS = ['blog-images', 'note-images', 'project-images', 'update-images', 'book-images'];
const VARIANT = /-(\d+)w\.webp$/;
const HEAVY_W = 1400;
const HEAVY_BYTES = 350_000;
const WIDE = 1000;
const CACHE = 'node_modules/.cache/site-images.json';
const OUT = 'src/data/images.generated.json';

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
const manifest = {};
let made = 0;

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));

for (const dir of DIRS) {
  const root = join(PUBLIC, dir);
  if (!existsSync(root)) continue;
  const files = walk(root).filter((f) => /\.(webp|png|jpe?g|gif|avif)$/i.test(f));
  const set = new Set(files);
  for (const file of files) {
    if (VARIANT.test(file)) continue;
    const st = statSync(file);
    const key = `${file}:${st.size}:${st.mtimeMs}`;
    let meta = cache[file]?.key === key ? cache[file] : null;
    if (!meta) {
      try {
        const m = await sharp(file, { animated: false }).metadata();
        meta = { key, w: m.width, h: m.height };
      } catch {
        continue; // not an image sharp can read
      }
      cache[file] = meta;
    }
    const stem = file.replace(/\.[a-z0-9]+$/i, '');
    const heavy = !/\.gif$/i.test(file) && (meta.w > HEAVY_W || st.size > HEAVY_BYTES);
    const widths = heavy ? [768, 1400] : meta.w > WIDE && !/\.gif$/i.test(file) ? [768] : [];
    if (widths.length) {
      for (const w of widths) {
        const out = `${stem}-${w}w.webp`;
        if (w >= meta.w && w !== 1400) continue;
        if (!existsSync(out)) {
          await sharp(file).resize({ width: Math.min(w, meta.w), withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
          set.add(out);
          made++;
        }
      }
    }
    // every variant on disk, made here or committed earlier (-480w, -768w, -1408w)
    const variants = [...set]
      .filter((f) => f.startsWith(stem + '-') && VARIANT.test(f) && f.slice(stem.length).match(/^-\d+w\.webp$/))
      .map((f) => [Number(f.match(VARIANT)[1]), '/' + relative(PUBLIC, f).split('\\').join('/')])
      .sort((a, b) => a[0] - b[0]);
    manifest['/' + relative(PUBLIC, file).split('\\').join('/')] = { w: meta.w, h: meta.h, heavy, variants };
  }
}

mkdirSync('node_modules/.cache', { recursive: true });
writeFileSync(CACHE, JSON.stringify(cache));
writeFileSync(OUT, JSON.stringify(manifest));
console.log(`images: ${Object.keys(manifest).length} indexed, ${made} variants made`);
