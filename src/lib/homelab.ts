// Display rules for the homelab page. Pure functions with no `astro:*` imports, so they can be
// unit-tested.
import type { ExperimentStatus, NetworkNode, Service, ServiceCategory } from '../data/homelab';
import { notePath } from './notes';

/** Production shows only verified entries; the dev server shows everything so it can be reviewed. */
export function visibleItems<T extends { verified: boolean }>(
  items: readonly T[],
  { dev }: { dev: boolean },
): T[] {
  return dev ? [...items] : items.filter((item) => item.verified);
}

/** Link to a related note only when it is published, so drafts are never linked. */
export function relatedNoteHref(
  slug: string | undefined,
  publishedIds: ReadonlySet<string>,
): string | undefined {
  return slug && publishedIds.has(slug) ? notePath(slug) : undefined;
}

const statusLabels: Record<ExperimentStatus, string> = {
  planned: 'Planned',
  'in-progress': 'In progress',
  completed: 'Completed',
};

export function statusLabel(status: ExperimentStatus): string {
  return statusLabels[status];
}

const categoryOrder: { category: ServiceCategory; label: string }[] = [
  { category: 'core', label: 'Core' },
  { category: 'media', label: 'Media' },
  { category: 'build', label: 'Build and testing' },
];

/** Services grouped by category in a fixed order; empty groups are dropped. */
export function groupServices<T extends Pick<Service, 'category'>>(services: readonly T[]) {
  return categoryOrder
    .map(({ category, label }) => ({
      label,
      services: services.filter((s) => s.category === category),
    }))
    .filter((group) => group.services.length > 0);
}

/** Geometry for the network diagram, in SVG user units (1 unit = 1 CSS px at full size). */
export const networkLayout = {
  padding: 4,
  rowHeight: 32,
  indent: 28,
  marker: 8,
  labelGap: 10,
  fontSize: 13,
  /** Generous advance width for a monospace glyph at fontSize, so labels never clip. */
  charWidth: 8,
} as const;

export interface NetworkRow {
  label: string;
  depth: number;
  /** Centre of the node's marker. */
  x: number;
  y: number;
  /** Index of the parent row; undefined for the root. */
  parent?: number;
}

/** Lays the network out as an indented tree: one row per node, in preorder. */
export function layoutNetwork(root: NetworkNode) {
  const { padding, rowHeight, indent, marker, labelGap, charWidth } = networkLayout;
  const rows: NetworkRow[] = [];

  const visit = (node: NetworkNode, depth: number, parent?: number) => {
    const index = rows.length;
    rows.push({
      label: node.label,
      depth,
      x: padding + depth * indent + marker / 2,
      y: padding + index * rowHeight + rowHeight / 2,
      parent,
    });
    for (const child of node.children ?? []) visit(child, depth + 1, index);
  };
  visit(root, 0);

  const labelX = (row: NetworkRow) => row.x + marker / 2 + labelGap;
  const width = Math.ceil(
    Math.max(...rows.map((row) => labelX(row) + row.label.length * charWidth)) + padding,
  );
  const height = padding * 2 + rows.length * rowHeight;

  return { rows, width, height, labelX };
}
