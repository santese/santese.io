import { describe, expect, it } from 'vite-plus/test';
import { noteSchema } from '../src/lib/note-schema';
import {
  formatDate,
  isPublished,
  notePath,
  selectPublished,
  sortNotes,
  toISODate,
  toStaticPaths,
  type NoteLike,
} from '../src/lib/notes';

const now = new Date('2026-11-27T12:00:00Z');

function note(id: string, date: string, draft = false): NoteLike {
  return { id, data: { publishedAt: new Date(`${date}T00:00:00Z`), draft } };
}

describe('sortNotes', () => {
  it('orders newest first', () => {
    const notes = [note('a', '2026-01-01'), note('b', '2026-03-01'), note('c', '2026-02-01')];
    expect(sortNotes(notes).map((n) => n.id)).toEqual(['b', 'c', 'a']);
  });

  it('breaks date ties by slug so order is stable', () => {
    const notes = [
      note('zeta', '2026-01-01'),
      note('alpha', '2026-01-01'),
      note('mid', '2026-01-01'),
    ];
    expect(sortNotes(notes).map((n) => n.id)).toEqual(['alpha', 'mid', 'zeta']);
    expect(sortNotes([...notes].reverse()).map((n) => n.id)).toEqual(['alpha', 'mid', 'zeta']);
  });

  it('does not mutate its input', () => {
    const notes = [note('a', '2026-01-01'), note('b', '2026-03-01')];
    sortNotes(notes);
    expect(notes.map((n) => n.id)).toEqual(['a', 'b']);
  });
});

describe('publication rules', () => {
  it('excludes drafts', () => {
    expect(isPublished(note('d', '2026-01-01', true), now)).toBe(false);
  });

  it('excludes future-dated notes', () => {
    expect(isPublished(note('f', '2026-11-28'), now)).toBe(false);
  });

  it('includes a note dated today and earlier', () => {
    expect(isPublished(note('today', '2026-11-27'), now)).toBe(true);
    expect(isPublished(note('past', '2025-06-01'), now)).toBe(true);
  });

  it('selectPublished filters and sorts', () => {
    const notes = [
      note('old', '2026-01-01'),
      note('draft', '2026-06-01', true),
      note('future', '2027-01-01'),
      note('new', '2026-10-01'),
    ];
    expect(selectPublished(notes, now).map((n) => n.id)).toEqual(['new', 'old']);
  });

  it('handles an empty collection', () => {
    expect(selectPublished([], now)).toEqual([]);
    expect(toStaticPaths(selectPublished([], now))).toEqual([]);
  });

  it('returns nothing when every note is a draft or future-dated', () => {
    const notes = [note('a', '2026-01-01', true), note('b', '2030-01-01')];
    expect(selectPublished(notes, now)).toEqual([]);
  });
});

describe('route generation', () => {
  it('creates one static path per published note, keyed by slug', () => {
    const notes = [note('one', '2026-01-01'), note('two', '2026-02-01', true)];
    const paths = toStaticPaths(selectPublished(notes, now));
    expect(paths).toHaveLength(1);
    expect(paths[0]?.params).toEqual({ slug: 'one' });
    expect(paths[0]?.props.note.id).toBe('one');
  });

  it('builds trailing-slash note URLs', () => {
    expect(notePath('my-note')).toBe('/notes/my-note/');
  });
});

describe('dates', () => {
  it('formats date-only values in UTC without shifting the day', () => {
    const d = new Date('2026-11-27T00:00:00Z');
    expect(formatDate(d)).toBe('November 27, 2026');
    expect(toISODate(d)).toBe('2026-11-27');
  });
});

describe('noteSchema', () => {
  const base = { title: 'T', description: 'D', publishedAt: '2026-11-27' };

  it('defaults draft to false and tags to empty', () => {
    const data = noteSchema.parse(base);
    expect(data.draft).toBe(false);
    expect(data.tags).toEqual([]);
    expect(toISODate(data.publishedAt)).toBe('2026-11-27');
  });

  it('rejects updatedAt earlier than publishedAt', () => {
    expect(noteSchema.safeParse({ ...base, updatedAt: '2026-11-26' }).success).toBe(false);
  });

  it('accepts updatedAt on or after publishedAt', () => {
    expect(noteSchema.safeParse({ ...base, updatedAt: '2026-11-27' }).success).toBe(true);
    expect(noteSchema.safeParse({ ...base, updatedAt: '2026-12-01' }).success).toBe(true);
  });

  it('requires title, description and publishedAt', () => {
    expect(noteSchema.safeParse({ title: 'T' }).success).toBe(false);
  });
});
