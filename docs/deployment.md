# Deployment

santese.io is a static Astro build served by [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/). This page covers the one-time setup, the custom domain, the launch checklist and rollback. Nothing here has been done yet. Each step happens in the Cloudflare dashboard, done by hand by the owner.

## How it works

- **GitHub Actions** (`.github/workflows/ci.yml`) runs lint, `astro check`, the unit tests, the build, the draft-leak check and `wrangler deploy --dry-run` on pull requests and on pushes to `main`. It has read-only repository access and no Cloudflare credentials.
- **Workers Builds**, Cloudflare's Git integration, watches the GitHub repository. On a push to `main` it builds and deploys to production. On any other branch it uploads a preview version.
- **`wrangler.jsonc`** describes the Worker. It's assets-only: no Worker script, so requests are static asset requests (free and unlimited on Cloudflare's current pricing).
  - `html_handling: "auto-trailing-slash"` serves `/notes/index.html` at `/notes/` and redirects `/notes` to `/notes/`.
  - `not_found_handling: "404-page"` serves `dist/404.html` with a 404 status for unknown paths.

No API tokens or account IDs live in the repository or in GitHub secrets.

## 1. Create the Worker

In the owner's Cloudflare account:

1. **Workers & Pages → Create → Import a repository.** Connect GitHub and pick the `santese.io` repository.
2. Fill in the build settings:

   | Setting                       | Value                                                |
   | ----------------------------- | ---------------------------------------------------- |
   | Project name                  | `santese-io` (must match `name` in `wrangler.jsonc`) |
   | Production branch             | `main`                                               |
   | Build command                 | `pnpm test && pnpm build && pnpm verify:build`       |
   | Deploy command                | `pnpm exec wrangler deploy`                          |
   | Non-production branch builds  | Enabled                                              |
   | Non-production deploy command | `pnpm exec wrangler versions upload`                 |
   | Root directory                | (leave empty)                                        |

   The build command runs the tests and the draft-leak check, so a failure stops the deploy even if GitHub Actions didn't run.

3. Save and let the first build run.

### Node and pnpm versions

You don't need any environment variables for these:

- **Node** comes from `.nvmrc`. When this page was written, the build image preinstalled Node 24.22.1, and `.nvmrc` pins 24.22.3. Check the first build log for the Node version it used. If 24.22.3 isn't available, set `.nvmrc` to a version the image has, or set the `NODE_VERSION` build variable.
- **pnpm** comes from `packageManager` in `package.json` through Corepack. The lockfile decides which package manager installs.
- **Wrangler** comes from the pinned devDependency.

### Preview versions

- Every non-`main` branch push gets a preview URL on `workers.dev`. **Preview URLs are public by default.** If that matters, protect them with Cloudflare Access.
- Private drafts in `src/content/drafts/` are gitignored, so they never reach any build. The repository is public, so anything committed is public anyway.
- Workers Builds posts check runs and PR comments with the preview link.

## 2. Check the deployment

Before you touch DNS, open the Worker's `workers.dev` URL from the dashboard. Check:

- The home page, `/notes/` and `/homelab/` load.
- `/notes` redirects to `/notes/`.
- An unknown path such as `/nope/` shows the 404 page.
- `/rss.xml` and `/sitemap-index.xml` load.

Canonical URLs and the sitemap already point at `https://santese.io`, so the temporary host won't compete for search.

## 3. DNS and Google Workspace safety

The domain already handles Google Workspace mail and Google sign-in. Its DNS zone is already on Cloudflare, in the same account, so no nameserver change is needed. DNSSEC can stay on as it is.

Before changing anything:

1. **Export the zone.** Go to DNS → Records → Import and Export → Export, and keep the file somewhere safe. It's your rollback record.
2. **Note the current apex record.** A proxied record for `santese.io` answered with a 404 when this page was written. Write down its type, value and what serves it (an old Worker route, a Page Rule or a parked record) before you remove it.

While you work:

- **Never edit or delete** the MX records, the SPF and DKIM TXT records, the Google site-verification TXT record, or any record you don't recognize.
- **Never import a replacement zone** or bulk-delete records. Only touch the `santese.io` apex record and `www`.

## 4. Custom domain

1. Remove the existing apex record you noted in step 3. A Worker Custom Domain can't be attached while a conflicting record exists for the same hostname.
2. In the Worker: **Settings → Domains & Routes → Add → Custom domain**. Enter `santese.io`. Cloudflare creates the DNS record and issues the certificate.
3. Wait for the domain to show as active, then load `https://santese.io/`.

The site goes down from step 1 until step 2 finishes. Today the apex only returns a 404, so nothing real is lost in that window.

### Redirect `www` to the apex

`https://santese.io` is the only canonical host. To send `www` there:

1. **DNS → Records → Add record.** Type `AAAA`, name `www`, IPv6 address `100::`, **Proxied**. This is a reserved placeholder address; it never receives traffic because the redirect rule answers first.
2. **Rules → Redirect Rules → Create rule**, using the "Redirect from WWW to root" template or these values:
   - When incoming requests match: hostname equals `www.santese.io`
   - Then: dynamic redirect to `concat("https://santese.io", http.request.uri.path)`
   - Status code: `301`
   - Preserve query string: on

## 5. After launch

1. **Turn off the `workers.dev` host.** Add `"workers_dev": false` to `wrangler.jsonc`, commit it and let it deploy. Change it in the config file rather than only in the dashboard: a deploy from a config without the setting turns the host back on.
2. **Optional:** in GitHub, add branch protection on `main` that requires the `CI / check` status.

## Launch checklist

- [ ] `https://santese.io/` loads over HTTPS with a valid certificate.
- [ ] `http://santese.io/` redirects to HTTPS.
- [ ] `https://www.santese.io/notes/` redirects to `https://santese.io/notes/` with a 301.
- [ ] `/notes` redirects to `/notes/`, and `/nope/` returns a 404 with the site's 404 page.
- [ ] `/rss.xml` and `/sitemap-index.xml` load. Their URLs use `https://santese.io`.
- [ ] Mail sent to the domain from an outside account arrives, and mail sent from the domain is delivered.
- [ ] Signing in with the domain's Google account still works for the apps that use it.
- [ ] The DNS export from step 3 is saved.

Quick checks from a terminal:

```sh
curl -sI https://santese.io/ | head -1
curl -sI https://www.santese.io/notes/ | grep -iE '^(HTTP|location)'
curl -sI https://santese.io/notes | grep -iE '^(HTTP|location)'
curl -sI https://santese.io/nope/ | head -1
dig +short MX santese.io
```

## Rollback

- **Bad deploy:** in the Worker, go to **Deployments**, pick an earlier version and roll back. Or revert the commit on `main`.
- **DNS problem:** remove the Custom Domain, then restore the earlier apex and `www` records from the export. Compare the MX and TXT records with the export, too.

## Limits

Free plan values when this page was written. Check [Workers Builds limits](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/) and [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) for current numbers.

- 3,000 build minutes a month, one build at a time, 20-minute build timeout.
- 20,000 files per version, 25 MiB per file.

## References

- [Astro: Deploy to Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Workers static assets](https://developers.cloudflare.com/workers/static-assets/) and [routing options](https://developers.cloudflare.com/workers/static-assets/routing/)
- [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) and [build image](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/)
- [Custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Redirect www to root](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/)
- [workers.dev routes](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)
