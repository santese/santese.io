// Post-build check: make sure no private draft (src/content/drafts/), held-back note
// (draft: true) or future-dated note leaks into dist/.
// Run after `pnpm build`: `pnpm verify:build`. Exits non-zero on any problem.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const notesDir = join(root, 'src/content/notes');
const draftsDir = join(root, 'src/content/drafts');
const dist = join(root, 'dist');
const problems = [];

if (!existsSync(dist)) {
  console.error('dist/ not found. Run `pnpm build` first.');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

// Minimal frontmatter reader for the fields the publishing rules depend on.
function readNote(file, isPrivateDraft) {
  const match = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = match?.[1] ?? '';
  const field = (key) =>
    fm
      .match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]
      ?.trim()
      .replace(/^['"]|['"]$/g, '');
  return {
    slug: basename(file).replace(/\.md$/, ''),
    title: field('title') ?? '',
    draft: isPrivateDraft || field('draft') === 'true', // schema default is false
    publishedAt: new Date(`${field('publishedAt')}T00:00:00Z`),
  };
}

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');

const now = new Date();
const readDir = (dir, isPrivateDraft) =>
  existsSync(dir)
    ? walk(dir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => readNote(f, isPrivateDraft))
    : [];
const notes = [...readDir(notesDir, false), ...readDir(draftsDir, true)];
const hidden = notes.filter(
  (n) => n.draft || Number.isNaN(n.publishedAt.getTime()) || n.publishedAt > now,
);

const outputs = walk(dist)
  .filter((f) => /\.(html|xml|txt|json)$/.test(f))
  .map((f) => ({ path: relative(root, f), text: readFileSync(f, 'utf8') }));

for (const note of hidden) {
  if (existsSync(join(dist, 'notes', note.slug))) {
    problems.push(`route emitted for hidden note: dist/notes/${note.slug}/`);
  }
  const needles = [`/notes/${note.slug}/`, note.title, escapeHtml(note.title)].filter(Boolean);
  for (const { path, text } of outputs) {
    for (const needle of new Set(needles)) {
      if (text.includes(needle)) problems.push(`${path} contains hidden note "${needle}"`);
    }
  }
}

for (const required of [
  'notes/index.html',
  'homelab/index.html',
  'rss.xml',
  'sitemap-index.xml',
  '404.html',
]) {
  if (!existsSync(join(dist, required))) problems.push(`missing dist/${required}`);
}

for (const { path, text } of outputs) {
  if (path.includes('sitemap') && text.includes('/404'))
    problems.push(`${path} lists the 404 page`);
}

// Private network details must never be published (see AGENTS.md).
const privatePatterns = [
  [
    'private IPv4 address',
    /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/,
  ],
  ['MAC address', /\b[0-9a-f]{2}(?::[0-9a-f]{2}){5}\b/i],
  ['internal hostname', /\b[a-z0-9-]+\.(?:local|lan|internal|home\.arpa)\b/i],
];
for (const { path, text } of outputs) {
  for (const [label, pattern] of privatePatterns) {
    const hit = text.match(pattern);
    if (hit) problems.push(`${path} contains a ${label}: "${hit[0]}"`);
  }
}

if (problems.length > 0) {
  console.error(`Build check failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}

console.log(
  `Build check passed: ${notes.length} note(s) in source, ${hidden.length} hidden, ` +
    `${outputs.length} output file(s) scanned.`,
);
