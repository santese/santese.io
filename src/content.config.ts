import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { noteSchema } from './lib/note-schema';

// Entry ids (and URL slugs) come from file names. Don't rename published notes.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: noteSchema,
});

// Private drafts: gitignored, and only rendered by the dev server (see src/lib/collection.ts).
// Moving a file from here to src/content/notes/ publishes it at the same URL.
const drafts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/drafts' }),
  schema: noteSchema,
});

export const collections = { notes, drafts };
