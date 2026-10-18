// Typographic quotes for frontmatter strings (titles, descriptions), which
// don't pass through smartypants the way markdown bodies do.
export function smart<T extends string | undefined>(s: T): T {
  if (!s) return s;
  return s
    .replace(/(^|[\s(\[{“‘—-])"/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(^|[\s(\[{“—-])'/g, '$1‘')
    .replace(/'/g, '’') as T;
}
