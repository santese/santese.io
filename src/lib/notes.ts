// Publishing rules for notes. Pure functions with no `astro:*` imports, so they can be unit-tested.

export interface NoteLike {
  id: string;
  data: { publishedAt: Date; draft: boolean };
}

/** A note is public when it isn't a draft and its publication date has arrived. */
export function isPublished(note: NoteLike, now: Date): boolean {
  return !note.data.draft && note.data.publishedAt.getTime() <= now.getTime();
}

/** Newest first; notes with the same date are ordered by slug so output is stable. */
export function sortNotes<T extends NoteLike>(notes: readonly T[]): T[] {
  return [...notes].sort(
    (a, b) =>
      b.data.publishedAt.getTime() - a.data.publishedAt.getTime() || a.id.localeCompare(b.id),
  );
}

export function selectPublished<T extends NoteLike>(notes: readonly T[], now: Date): T[] {
  return sortNotes(notes.filter((note) => isPublished(note, now)));
}

export function toStaticPaths<T extends NoteLike>(notes: readonly T[]) {
  return notes.map((note) => ({ params: { slug: note.id }, props: { note } }));
}

export function notePath(id: string): string {
  return `/notes/${id}/`;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

/** e.g. "November 27, 2026". Always UTC so dates don't shift with the build machine's timezone. */
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/** YYYY-MM-DD in UTC, for <time datetime>. */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
