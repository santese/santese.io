import { describe, expect, it } from 'vite-plus/test';
import { homelab } from '../src/data/homelab';
import {
  groupServices,
  layoutNetwork,
  networkLayout,
  relatedNoteHref,
  statusLabel,
  visibleItems,
} from '../src/lib/homelab';

const items = [
  { name: 'confirmed', verified: true },
  { name: 'unconfirmed', verified: false },
];

describe('visibleItems', () => {
  it('drops unverified entries in production', () => {
    expect(visibleItems(items, { dev: false }).map((i) => i.name)).toEqual(['confirmed']);
  });

  it('keeps everything in dev for review', () => {
    expect(visibleItems(items, { dev: true }).map((i) => i.name)).toEqual([
      'confirmed',
      'unconfirmed',
    ]);
  });
});

describe('relatedNoteHref', () => {
  const published = new Set(['published-note']);

  it('links a published note', () => {
    expect(relatedNoteHref('published-note', published)).toBe('/notes/published-note/');
  });

  it('does not link drafts, unknown slugs or missing slugs', () => {
    expect(relatedNoteHref('draft-note', published)).toBeUndefined();
    expect(relatedNoteHref(undefined, published)).toBeUndefined();
  });
});

describe('statusLabel', () => {
  it('maps every status', () => {
    expect(statusLabel('planned')).toBe('Planned');
    expect(statusLabel('in-progress')).toBe('In progress');
    expect(statusLabel('completed')).toBe('Completed');
  });
});

describe('groupServices', () => {
  it('groups in a fixed order and drops empty groups', () => {
    const groups = groupServices([
      { name: 'b', category: 'build' as const },
      { name: 'c', category: 'core' as const },
    ]);
    expect(groups.map((g) => g.label)).toEqual(['Core', 'Build and testing']);
  });
});

describe('layoutNetwork', () => {
  const tree = {
    label: 'root',
    children: [{ label: 'a', children: [{ label: 'a1' }] }, { label: 'b' }],
  };
  const { rows, width, height, labelX } = layoutNetwork(tree);

  it('lays nodes out in preorder with depth and parent links', () => {
    expect(rows.map((r) => [r.label, r.depth, r.parent])).toEqual([
      ['root', 0, undefined],
      ['a', 1, 0],
      ['a1', 2, 1],
      ['b', 1, 0],
    ]);
  });

  it('puts each row below the last and indents children', () => {
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i]!.y).toBeGreaterThan(rows[i - 1]!.y);
      const parent = rows[rows[i]!.parent!]!;
      expect(rows[i]!.x).toBeGreaterThan(parent.x);
    }
  });

  it('sizes the canvas to fit every row and label', () => {
    expect(height).toBe(networkLayout.padding * 2 + rows.length * networkLayout.rowHeight);
    for (const row of rows) {
      expect(labelX(row) + row.label.length * networkLayout.charWidth).toBeLessThanOrEqual(width);
    }
  });

  it('includes every node from the homelab data', () => {
    const labels: string[] = [];
    const collect = (n: typeof homelab.network) => {
      labels.push(n.label);
      n.children?.forEach(collect);
    };
    collect(homelab.network);
    expect(layoutNetwork(homelab.network).rows.map((r) => r.label)).toEqual(labels);
  });
});

describe('homelab data', () => {
  const json = JSON.stringify(homelab);

  it('only links to public https pages', () => {
    for (const service of homelab.services) {
      if (service.href) expect(new URL(service.href).protocol).toBe('https:');
    }
  });

  it('contains no private network details', () => {
    expect(json).not.toMatch(
      /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/,
    );
    expect(json).not.toMatch(/\b[0-9a-f]{2}(?::[0-9a-f]{2}){5}\b/i);
    expect(json).not.toMatch(/\b[a-z0-9-]+\.(?:local|lan|internal|home\.arpa)\b/i);
  });

  it('has a valid manual review date when set', () => {
    if (homelab.lastReviewed) {
      expect(homelab.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(`${homelab.lastReviewed}T00:00:00Z`).getTime())).toBe(false);
    }
  });
});
