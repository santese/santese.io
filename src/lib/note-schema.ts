import { z } from 'astro/zod';

// Frontmatter schema for notes. Kept free of `astro:*` imports so it can be unit-tested.
export const noteSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    // Date-only YAML values (2026-11-27) parse as UTC midnight.
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // Notes in src/content/notes/ are public by default; set true to hold one back.
    draft: z.boolean().default(false),
  })
  .refine((data) => !data.updatedAt || data.updatedAt >= data.publishedAt, {
    message: 'updatedAt must not be earlier than publishedAt',
    path: ['updatedAt'],
  });

export type NoteData = z.infer<typeof noteSchema>;
