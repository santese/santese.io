import { getCollection, type CollectionEntry } from 'astro:content';
import { selectPublished, sortNotes } from './notes';

export type Note = CollectionEntry<'notes'> | CollectionEntry<'drafts'>;

/** Published notes only, newest first. Use for anything that is always public: homepage, RSS. */
export async function getPublishedNotes(): Promise<CollectionEntry<'notes'>[]> {
  return selectPublished(await getCollection('notes'), new Date());
}

/**
 * Notes to render as pages and in the notes index. In `astro dev` this also includes
 * src/content/drafts/, held-back notes (draft: true) and future-dated notes, all labelled
 * as drafts, so they can be previewed locally. Production builds only get published notes.
 */
export async function getVisibleNotes(): Promise<Note[]> {
  if (!import.meta.env.DEV) return getPublishedNotes();

  const now = new Date();
  const notes = await getCollection('notes');
  const published = new Set(selectPublished(notes, now));
  const ids = new Set(notes.map((n) => n.id));
  // A note in notes/ wins over a draft with the same slug.
  const drafts = (await getCollection('drafts')).filter((d) => !ids.has(d.id));

  const all: Note[] = [...notes, ...drafts].map((entry) =>
    published.has(entry as CollectionEntry<'notes'>)
      ? entry
      : { ...entry, data: { ...entry.data, draft: true } },
  );
  return sortNotes(all);
}
