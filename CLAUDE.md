# Claude context — LACSEF website

Static HTML site for the LA County Science & Engineering Fair, deployed to GitHub Pages by a GH Actions workflow on every push to `main`. No backend, no framework. Two small build steps:

1. **CSS** — Tailwind compiles `src/main.css` → `css/styles.css`.
2. **Articles + sitemap** — `scripts/build-articles.mjs` reads `news/articles.json` + each post's Markdown body and emits `news/posts/<id>.html` plus a fresh `sitemap.xml`.

**Build outputs are not committed** — they're in `.gitignore` and regenerated from sources by [.github/workflows/deploy.yml](.github/workflows/deploy.yml) on every deploy. This is what lets non-technical contributors push a Markdown file via the GitHub web UI and have it appear on the live site without running anything locally — the deploy workflow does a clean build from sources, so adds / edits / renames / deletions all propagate automatically.

README.md has the full editor-facing guide; this file is the short version with the rules I should always follow.

## Always use `uv` for Python

If a task calls for running Python — a one-off script, a local server, anything — invoke it through `uv`, not `python` / `python3` / `pip` directly.

- Run a script: `uv run script.py`
- Run a module: `uv run python -m http.server 8000`
- Add a dependency for a script: `uv add <pkg>` (or `uv run --with <pkg> ...` for one-offs)

Do not call bare `python`, `python3`, `pip`, or `pipx`. If `uv` isn't available, stop and tell the user instead of falling back.

## Stack at a glance

- Plain HTML at the repo root and in [students/](students/).
- Tailwind compiled — theme tokens live in [tailwind.config.js](tailwind.config.js); CSS source (with `@tailwind` directives + custom rules) is [src/main.css](src/main.css); the build emits `css/styles.css` (gitignored, regenerated on every deploy).
- Header/footer are shared snippets in [components/](components/), injected at runtime by [js/components.js](js/components.js). The injection rewrites relative `<a href>` values against the site root, so nav links work from any depth (root, `students/`, `news/posts/`).
- Schedule data: [data/schedule.json](data/schedule.json) drives both the home timeline and the schedule page.
- News: metadata in [news/articles.json](news/articles.json), bodies as Markdown under `news/posts/<YYYY-MM>/<slug>/`. The build script renders each entry into a static `news/posts/<id>.html` page (canonical article URL, gitignored); legacy `article.html?id=<id>` links redirect to it.
- Design system reference: [DESIGN.md](DESIGN.md). Keep it in sync with `tailwind.config.js`.

## Local dev

- `bun start` runs `bun run build` (CSS + articles + sitemap) once, then `serve` on the static files. Don't open files via `file://` — `fetch()` for header/footer/JSON will fail.
- `bun run dev` runs Tailwind in `--watch` mode for iterating on classes. Pair it with `bun start` in a second terminal. (Articles aren't watched — re-run `bun run build:articles` manually if you're editing Markdown.)
- Python alternative (if asked): `uv run python -m http.server 8000`.

## Build & deploy (important)

Three files in this repo are **build artifacts**, regenerated from sources by `bun run build`. They are **not committed** — they're in `.gitignore`:

- `css/styles.css` ← `src/main.css` + `tailwind.config.js` + Tailwind class scan
- `news/posts/<id>.html` (one per article) ← `news/articles.json` + the matching Markdown body, rendered through [scripts/build-articles.mjs](scripts/build-articles.mjs)
- `sitemap.xml` ← regenerated alongside articles (the static-page list is hardcoded in `scripts/build-articles.mjs`; update it when adding a new top-level page)

How deploys work:

- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs on every push to `main`. It does a clean checkout, `bun install --frozen-lockfile`, `bun run build`, stages the static site to a temporary `_site/` directory (excluding `src/`, `scripts/`, `node_modules/`, `*.md`, the build config files, etc.), uploads it as a Pages artifact, and deploys via [actions/deploy-pages](https://github.com/actions/deploy-pages).
- Because each deploy is a fresh build from sources, adds / edits / renames / deletions in `news/articles.json` + the Markdown bodies all propagate to the live site without anyone running a build manually. This is the whole point — non-technical contributors can push via the GitHub web UI.
- One-time repo setting: **Settings → Pages → Source: GitHub Actions**. If the repo is currently set to "Deploy from a branch", flip it. (If you find the deploy workflow runs but the site doesn't update, this is almost certainly why.)
- [.github/workflows/build-check.yml](.github/workflows/build-check.yml) runs on PRs and just verifies `bun run build` succeeds, so build errors are caught before merge.

Rules:

- **Never edit a build output by hand.** They're gitignored, but if a stale local copy exists from a prior `bun run build`, it'll be wiped on the next build. Edit the source instead (`src/main.css`, the relevant Markdown, or the build script).
- **The pre-commit hook runs `bun run build` locally** (without staging anything) when sources affecting outputs are staged, purely as fast-feedback so build errors surface at commit time instead of at deploy time. If you bypass with `--no-verify` and a build error sneaks through, the deploy workflow will fail loudly — not silently serve a stale site.
- For iterating on classes without committing every time, run `bun run dev` (Tailwind in watch mode) so the browser sees changes on save.
- All build outputs (`css/styles.css`, `news/posts/*.html`, `sitemap.xml`) are in `.prettierignore` — no point formatting compiled output.

## House rules when editing

- Prefer editing existing files. The repo is intentionally small — don't add scaffolding or frameworks.
- HTML: lowercase tags, double-quoted attrs, Tailwind utility classes. Don't strip existing utility classes when changing copy.
- Filenames: lowercase-with-hyphens (`how-to-participate.html`).
- Nav: new top-level pages need a `data-page="<filename>.html"` link in [components/header.html](components/header.html) so the active-link logic works.
- Design tokens: changing a color in `tailwind.config.js` means updating [DESIGN.md](DESIGN.md) too. (No need to commit any rebuilt CSS — the deploy workflow does that.)
- New HTML or JS files outside the existing `content` globs in `tailwind.config.js` won't get their classes compiled. Either keep new files inside the existing patterns (`./*.html`, `./components/**/*.html`, `./students/**/*.html`, `./js/**/*.js`, `./scripts/**/*.{js,mjs}`) or update the globs.
- Adding a new top-level HTML page also means adding it to the `STATIC_PAGES` list at the top of [scripts/build-articles.mjs](scripts/build-articles.mjs) so the sitemap picks it up.
- Don't touch `node_modules/`, `package-lock.json`, `bun.lock`, or `downloads/` files unless the task is specifically about them.

## Formatting & commits

- Prettier runs via the husky pre-commit hook on staged `.html`/`.js`/`.mjs`/`.json`/`.md` and `src/**/*.css`. Don't bypass with `--no-verify`.
- If formatting fails on commit, fix it and re-stage — don't `--amend` and don't skip the hook.
- Rules in [.prettierrc](.prettierrc): 100-char lines, 2-space indent, double quotes, semicolons.

## Things to avoid

- No gradient-clipped text — solid colors only (reads as AI-generated otherwise).
- No bundler or JS framework. The build step is intentionally limited to Tailwind's CSS compile; don't add Vite, webpack, etc.
- No mocking up "future" abstractions; this site is meant to stay simple enough for non-developers to edit.
- No emojis in committed files unless the user explicitly asks.
