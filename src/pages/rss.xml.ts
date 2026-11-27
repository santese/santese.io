import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { getPublishedNotes } from '../lib/collection';
import { notePath } from '../lib/notes';

export async function GET(context: APIContext) {
  const notes = await getPublishedNotes();
  return rss({
    title: `${site.title} · Notes`,
    description: site.description,
    site: context.site ?? site.url,
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.publishedAt,
      link: notePath(note.id),
      categories: note.data.tags,
    })),
    customData: `<language>${site.locale}</language>`,
  });
}
