# santese.io

Personal engineering site and homelab journal. Static [Astro](https://astro.build) site, TypeScript strict, plain CSS.

## Requirements

- Node.js 24.22.3 (pinned in `.nvmrc`; `package.json` `engines` lists the minimum that Astro and Vite+ both support)
- pnpm (version pinned via `packageManager` in `package.json`; `corepack enable` will provide it)

## Setup

```sh
pnpm install
pnpm dev          # http://localhost:4321
```

## Scripts

Package scripts can be run with `pnpm <script>` or `pnpm exec vp run <script>`.

| Command                  | What it does                                        |
| ------------------------ | --------------------------------------------------- |
| `pnpm exec vp run dev`   | Start the Astro dev server                          |
| `pnpm exec vp run build` | Build the static site into `dist/` (Astro)          |
| `pnpm preview`           | Serve the built `dist/` locally                     |
| `pnpm check`             | Astro diagnostics and type-check (`astro check`)    |
| `pnpm test`              | Unit tests for the publishing rules (`vp test`)     |
| `pnpm verify:build`      | After a build, fail if a draft leaked into `dist/`  |
| `pnpm lint`              | Check formatting and lint (`vp check`)              |
| `pnpm deploy:dry-run`    | After a build, validate `wrangler.jsonc` (no login) |
| `pnpm fix`               | Format files and apply lint fixes                   |

If you have the global Vite+ CLI installed, `vp run dev` and `vp run build` work too. Nothing requires it.

## Toolchain

[Vite+](https://viteplus.dev/) (`vite-plus`) is a pinned local devDependency. This project uses it only for its bundled Oxfmt (formatting) and Oxlint (linting), configured in `vite.config.ts`, and for `vp run`. Astro keeps its own dev server, build, preview and `astro check`; it does not read `vite.config.ts`.

- **No `vite` override.** The Vite+ manual-install guide adds a pnpm override that swaps every `vite` for `@voidzero-dev/vite-plus-core`. This project leaves it out so Astro keeps the Vite version it ships with. Nothing here runs Astro through Vite+ (no `vp dev` or `vp build`), so the version-mismatch problem that override prevents doesn't arise.
- **Tests** use the Vitest bundled with Vite+ (`vp test`), so there's no separate test dependency. Tests import only plain TypeScript modules (`src/lib/notes.ts`, `src/lib/note-schema.ts`) and never load Astro, which keeps them independent of Astro's Vite.
- **Astro formatting** goes through Oxfmt's bundled Prettier Astro plugin (`fmt.astro: true`), which needs the `@astrojs/compiler-rs` devDependency. Oxlint lints only the script parts of `.astro` files; `astro check` covers templates and types.
- **Editor:** install the recommended extensions (`.vscode/extensions.json`). `.vscode/settings.json` sets Oxc as the formatter, with format on save.
- **Wrangler** is a pinned devDependency, used only for the deploy dry run, local `wrangler dev` and Workers Builds. `pnpm-workspace.yaml` blocks the build scripts of `esbuild` and `workerd`, which nothing here needs.
- **CI** (`.github/workflows/ci.yml`) runs `vp check`, `astro check`, the unit tests, the production build, the draft-leak check and a Wrangler dry run on pushes to `main` and on pull requests.

## Structure

```text
docs/                deployment.md (Cloudflare setup, DNS safety, launch checklist)
public/              brand kit assets (logos in brand/, favicons, manifest, og-image.png), robots.txt
scripts/             check-build.mjs (draft-leak and private-detail check over dist/)
src/
  components/        Header, Footer, NoteList, NetworkDiagram (SVG) + NetworkTree, ThemeToggle (light/dark, saved in localStorage)
  content/notes/     published notes, one Markdown file each; the file name is the URL slug
  content/drafts/    private drafts (gitignored, dev server only)
  content.config.ts  notes and drafts collections (glob loader + shared schema)
  data/site.ts       name, description, nav, social links, featured project, feed path, brand assets
  data/homelab.ts    homelab hardware, services, network overview, experiments
  layouts/           BaseLayout (metadata, skip link, header/footer), NoteLayout
  lib/               notes.ts (publishing rules), note-schema.ts, collection.ts (Astro wrapper),
                     homelab.ts (homelab display rules)
  pages/             index, 404, homelab, notes/index, notes/[...slug], rss.xml
  styles/global.css  design tokens, base and prose styles
tests/               unit tests (vp test)
```

To edit personal details, links, or navigation, change `src/data/site.ts`. Components read from it, so you don't need to touch them.

## Notes

Two folders, and the file name is the URL slug in both:

- `src/content/drafts/` holds private drafts. It's gitignored, so nothing in it is committed or deployed. Only the dev server reads it.
- `src/content/notes/` holds published notes. `src/content/notes/my-note.md` is served at `/notes/my-note/`. Don't rename a note once it's published.

### Write a draft

Create `src/content/drafts/<slug>.md`:

```yaml
---
title: A short, specific title
description: One sentence for the notes index, RSS and search results.
publishedAt: 2026-12-01 # date only, interpreted as UTC
updatedAt: 2026-12-15 # optional; must not be earlier than publishedAt
tags: [macos, infrastructure] # optional
---
```

A structure that works well: problem, context, what I tried, result, tradeoffs, references. Only include commands you've run, and redact credentials, identifiers and internal details.

### Preview

Run `pnpm dev` and open `/notes/`. The dev server lists everything in `drafts/` alongside published notes, with a "Draft" label, and renders each one at the URL it will have once published. Drafts never appear on the homepage or in RSS, even in dev. If you add a file while a dev server that predates the folder is running, restart it.

### Publish

1. Set `publishedAt` to the real publication date.
2. Move the file from `src/content/drafts/` to `src/content/notes/`. The URL stays the same.
3. Run `pnpm test`, `pnpm build` and `pnpm verify:build`.
4. Commit and push.

A note in `notes/` is public when `publishedAt` is today or earlier, judged at build time. To hold back a note that's already in `notes/` (and committed), add `draft: true`. Held-back and future-dated notes behave like drafts: dev only. The site is static, so a future-dated note only goes live with the first build on or after its date (any push, or a manual redeploy). Publication rules live in `src/lib/notes.ts` and apply to the homepage, notes index, note pages, RSS and sitemap.

Anything committed in `notes/` is readable in the repository even if it's held back or future-dated, so if the repo is public, keep unfinished writing in `drafts/`. That folder lives only on your machine, so back it up some other way if you need to.

## Homelab

`/homelab/` is a hand-maintained snapshot, not a live dashboard. All of its content lives in `src/data/homelab.ts`, so you never need to touch `src/pages/homelab.astro` to update it.

- **Hardware**: `name`, `role`, and optional `details` (known specs only, e.g. `'Intel Core i9'`). Leave out what you don't know. Empty fields don't render.
- **Services**: `name`, `purpose`, `category` (`core`, `media` or `build`), and an optional `href` to the project's official public site. Never link a management interface.
- **Network**: a conceptual tree of labels. It isn't a wiring map, so keep it at the level of roles.
- **Experiments**: `title`, `summary`, `status` (`planned`, `in-progress` or `completed`), and an optional `noteSlug`. The experiment links to that note only once the note is published, so a draft is never linked.
- **`verified`**: every entry has one. `verified: false` entries show in `pnpm dev` with an "Unverified" label and stay out of production builds. Add new things as unverified, check them, then flip the flag.
- **`lastReviewed`**: a `YYYY-MM-DD` date you set by hand when you've checked the whole inventory. Remove it to hide the line.

Never put IP addresses, VLAN IDs, hostnames, ports, serial numbers, MAC addresses, VPN endpoints or physical layout in this file. `pnpm test` checks the data and `pnpm verify:build` checks the built site for private IPs, MAC addresses and `.local`/`.lan` hostnames, but those checks don't catch everything, so review before committing. Strip EXIF data from any photos you add.

## Deployment

The site is served by [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/) from the owner's Cloudflare account. It's an assets-only Worker with no script, configured in `wrangler.jsonc`. Workers Builds, Cloudflare's Git integration, builds and deploys `main`, and uploads a preview version for other branches. GitHub Actions runs the checks only and holds no Cloudflare credentials.

The setup steps, DNS and Google Workspace safety steps, launch checklist and rollback are in [docs/deployment.md](docs/deployment.md). Nothing has been deployed yet.

## Contributing rules

See [AGENTS.md](AGENTS.md).
