# Agent guidelines for santese.io

These rules apply to any AI coding agent working in this repository (CLAUDE.md points here).

## What this site is

A small static personal engineering site for Santese: introduction, notes, and a homelab journal. Astro static output, TypeScript strict, plain CSS. No database, auth, CMS, server runtime, client framework, external fonts, analytics or tracking.

## Rules

- **No AI attribution** in commits, commit trailers, PR descriptions, code comments or public copy unless the owner explicitly asks for it.
- **Do not commit or push** unless asked.
- **Do not fabricate.** Never invent social URLs, email addresses, employers, accomplishments, benchmark numbers, commands, hardware specs, experiment outcomes or first-person experiences. Mark missing facts as TODOs in drafts.
- **Privacy.** Never publish IP addresses, VLAN IDs, internal hostnames, ports, serial numbers, device identifiers, credentials, VPN endpoints, private management URLs, physical layout, or proprietary Superendpoint/employer details. Strip EXIF from photos.
- **Single source of truth.** Personal metadata and links live in `src/data/site.ts`; homelab inventory lives in `src/data/homelab.ts`. Don't hardcode those values in components.
- **Navigation** only links to routes that exist. No empty sections or placeholder links.
- **Design.** Editorial and understated: single column, system fonts, warm off-white / near-black, one accent. No gradients, glassmorphism, decorative cards, pill clouds, fake terminals, stock images or generic hero layouts. Keep client-side JavaScript to concrete needs (currently only the theme toggle, inlined, no framework).
- **URLs.** Production site is `https://santese.io` with trailing slashes on every route. Keep slugs stable.
- **Verify** with `pnpm lint`, `pnpm check`, `pnpm test`, `pnpm build` and `pnpm verify:build` before reporting work as done. Report real results only.
- **Homelab.** `src/data/homelab.ts` lists only real, owner-confirmed equipment, services and experiment statuses. Anything unconfirmed goes in with `verified: false` (dev only). Don't invent specs or mark experiments in progress or completed without the owner saying so.
- **Notes.** Published notes live in `src/content/notes/`; private drafts live in the gitignored `src/content/drafts/` and are rendered only by the dev server. Write new drafts there, and never move a file into `notes/` (publishing) unless the owner asks. Publishing rules live in `src/lib/notes.ts`. Use `getPublishedNotes()` for anything always public (homepage, RSS); only note pages and the notes index use `getVisibleNotes()`, which adds drafts in dev.

## Development

Use pnpm (version pinned in `package.json` `packageManager`); do not add npm or yarn lockfiles. Start the dev server in background mode:

```
pnpm astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build. Check it for the installed Astro version before using version-sensitive APIs.

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling](https://docs.astro.build/en/guides/styling/)
