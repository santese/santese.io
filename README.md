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

| Command                  | What it does                                     |
| ------------------------ | ------------------------------------------------ |
| `pnpm exec vp run dev`   | Start the Astro dev server                       |
| `pnpm exec vp run build` | Build the static site into `dist/` (Astro)       |
| `pnpm preview`           | Serve the built `dist/` locally                  |
| `pnpm check`             | Astro diagnostics and type-check (`astro check`) |
| `pnpm lint`              | Check formatting and lint (`vp check`)           |
| `pnpm fix`               | Format files and apply lint fixes                |

If you have the global Vite+ CLI installed, `vp run dev` and `vp run build` work too. Nothing requires it.

## Toolchain

[Vite+](https://viteplus.dev/) (`vite-plus`) is a pinned local devDependency. This project uses it only for its bundled Oxfmt (formatting) and Oxlint (linting), configured in `vite.config.ts`, and for `vp run`. Astro keeps its own dev server, build, preview and `astro check`; it does not read `vite.config.ts`.

- **No `vite` override.** The Vite+ manual-install guide adds a pnpm override that swaps every `vite` for `@voidzero-dev/vite-plus-core`. This project leaves it out so Astro keeps the Vite version it ships with. Nothing here runs Vite through Vite+ (no `vp dev`, `vp build` or `vp test`), so the version-mismatch problem that override prevents doesn't arise.
- **Astro formatting** goes through Oxfmt's bundled Prettier Astro plugin (`fmt.astro: true`), which needs the `@astrojs/compiler-rs` devDependency. Oxlint lints only the script parts of `.astro` files; `astro check` covers templates and types.
- **Editor:** install the recommended extensions (`.vscode/extensions.json`). `.vscode/settings.json` sets Oxc as the formatter, with format on save.
- **CI** (`.github/workflows/ci.yml`) runs `vp check`, `astro check` and the production build on pushes to `main` and on pull requests.

## Structure

```text
public/              favicon.svg, robots.txt
src/
  components/        Header, Footer, ThemeToggle (light/dark, saved in localStorage)
  data/site.ts       name, description, nav, social links, featured project
  layouts/           BaseLayout (metadata, skip link, header/footer)
  pages/             index, 404
  styles/global.css  design tokens and base styles
```

To edit personal details, links, or navigation, change `src/data/site.ts`. Components read from it, so you don't need to touch them.

## Deployment

The plan is Cloudflare Pages static hosting through Git integration, under the Cloudflare account **santese@santese.io**. Build command `pnpm build` (plain `astro build`, so no global Vite+ CLI is needed), output directory `dist`. Node comes from `.nvmrc` and pnpm from `packageManager`. The full setup and the DNS/Google Workspace safety steps come in a later phase. Nothing has been deployed yet.

## Contributing rules

See [AGENTS.md](AGENTS.md).
