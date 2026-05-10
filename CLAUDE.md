# Claude context — LACSEF website

Static HTML site for the LA County Science & Engineering Fair, deployed via GitHub Pages. No backend, no framework. There is one small build step: Tailwind compiles `src/main.css` → `css/styles.css`, which is committed to the repo so GH Pages can serve it directly. README.md has the full editor-facing guide; this file is the short version with the rules I should always follow.

## Always use `uv` for Python

If a task calls for running Python — a one-off script, a local server, anything — invoke it through `uv`, not `python` / `python3` / `pip` directly.

- Run a script: `uv run script.py`
- Run a module: `uv run python -m http.server 8000`
- Add a dependency for a script: `uv add <pkg>` (or `uv run --with <pkg> ...` for one-offs)

Do not call bare `python`, `python3`, `pip`, or `pipx`. If `uv` isn't available, stop and tell the user instead of falling back.

## Stack at a glance

- Plain HTML at the repo root and in [students/](students/).
- Tailwind compiled locally — theme tokens live in [tailwind.config.js](tailwind.config.js); CSS source (with `@tailwind` directives + custom rules) is [src/main.css](src/main.css); the build output is [css/styles.css](css/styles.css), committed so GH Pages serves it as-is.
- Header/footer are shared snippets in [components/](components/), injected at runtime by [js/components.js](js/components.js).
- Schedule data: [data/schedule.json](data/schedule.json) drives both the home timeline and the schedule page.
- News: metadata in [news/articles.json](news/articles.json), bodies as Markdown under `news/posts/<YYYY-MM>/<slug>/`.
- Design system reference: [DESIGN.md](DESIGN.md). Keep it in sync with `tailwind.config.js`.

## Local dev

- `npm start` builds the CSS once, then runs `serve` on the static files. Don't open files via `file://` — `fetch()` for header/footer/JSON will fail.
- `npm run dev` runs Tailwind in `--watch` mode for iterating on classes. Pair it with `npm start` in a second terminal.
- Python alternative (if asked): `uv run python -m http.server 8000`.

## CSS build step (important)

- Source of truth for styling: [tailwind.config.js](tailwind.config.js) + [src/main.css](src/main.css). The Tailwind CLI scans the `content` globs (HTML + JS) for class usage and generates [css/styles.css](css/styles.css).
- Never edit `css/styles.css` by hand — it's a build artifact and gets overwritten on the next build. Custom rules go in `src/main.css`.
- **The pre-commit hook auto-rebuilds CSS** when an HTML/JS file, `src/main.css`, or `tailwind.config.js` is staged, and it stages the regenerated `css/styles.css` into the same commit. So the committed CSS can never lag behind a class change as long as the hook runs (i.e., no `--no-verify`, and `npm install` has been run in this clone).
- **CI backstop:** the [CSS up to date](.github/workflows/css-up-to-date.yml) workflow runs on every push/PR to `main`. It rebuilds the CSS in a clean environment and fails if the committed `css/styles.css` doesn't match. So even if the local hook is bypassed (`--no-verify`, fresh clone without `npm install`, or a web-UI edit), CI catches it before it reaches the deployed site.
- For iterating without committing every time, run `npm run dev` (Tailwind in watch mode) so the browser sees changes on save.
- `css/styles.css` is in `.prettierignore` (no point formatting compiled output).

## House rules when editing

- Prefer editing existing files. The repo is intentionally small — don't add scaffolding or frameworks.
- HTML: lowercase tags, double-quoted attrs, Tailwind utility classes. Don't strip existing utility classes when changing copy.
- Filenames: lowercase-with-hyphens (`how-to-participate.html`).
- Nav: new top-level pages need a `data-page="<filename>.html"` link in [components/header.html](components/header.html) so the active-link logic works.
- Design tokens: changing a color in `tailwind.config.js` means updating [DESIGN.md](DESIGN.md) too — and rebuilding CSS.
- New HTML or JS files outside the existing `content` globs in `tailwind.config.js` won't get their classes compiled. Either keep new files inside the existing patterns (`./*.html`, `./components/**/*.html`, `./students/**/*.html`, `./js/**/*.js`) or update the globs.
- Don't touch `node_modules/`, `package-lock.json`, or `downloads/` files unless the task is specifically about them.

## Formatting & commits

- Prettier runs via the husky pre-commit hook on staged `.html`/`.js`/`.json`/`.md` and `src/**/*.css`. Don't bypass with `--no-verify`.
- If formatting fails on commit, fix it and re-stage — don't `--amend` and don't skip the hook.
- Rules in [.prettierrc](.prettierrc): 100-char lines, 2-space indent, double quotes, semicolons.

## Things to avoid

- No gradient-clipped text — solid colors only (reads as AI-generated otherwise).
- No bundler or JS framework. The build step is intentionally limited to Tailwind's CSS compile; don't add Vite, webpack, etc.
- No mocking up "future" abstractions; this site is meant to stay simple enough for non-developers to edit.
- No emojis in committed files unless the user explicitly asks.
