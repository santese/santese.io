// Display rules for the homelab page. Pure functions with no `astro:*` imports, so they can be
// unit-tested.
import type { ExperimentStatus, Service, ServiceCategory } from '../data/homelab';
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
