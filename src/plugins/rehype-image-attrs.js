// rehype-image-attrs
// ----------------------------------------------------------------------------
// Adds loading="lazy" and decoding="async" to every <img> in markdown content,
// unless the image already declares them. Cheap perf win for body images.

export default function rehypeImageAttrs() {
  return (tree) => {
    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'img') return;
      node.properties = node.properties || {};
      if (node.properties.loading === undefined) node.properties.loading = 'lazy';
      if (node.properties.decoding === undefined) node.properties.decoding = 'async';
    });
  };
}

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  if (node.children) for (const c of node.children) walk(c, visit);
}
