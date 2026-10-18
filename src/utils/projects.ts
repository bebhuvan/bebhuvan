// Project groups, shared by the home page and /projects. `lead` opens that
// clause of the /projects sentence; `label` heads the group in a margin.
export const kinds = [
  { key: 'library', lead: 'Rooms for old words:', label: 'Rooms for old words' },
  { key: 'numbers', lead: 'Ways to read India and the world in numbers:', label: 'In numbers' },
  { key: 'reading', lead: 'Places to keep what I read:', label: 'What I read' },
  { key: 'street', lead: 'And one for the street:', label: 'The street' },
  { key: 'other', lead: 'And', label: 'Elsewhere' },
];

export function groupProjects<T extends { data: { kind?: string } }>(projects: T[]) {
  return kinds
    .map((k) => ({ ...k, items: projects.filter((p) => (p.data.kind ?? 'other') === k.key) }))
    .filter((g) => g.items.length);
}
