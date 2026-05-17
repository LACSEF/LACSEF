# LACSEF Website

The Los Angeles County Science & Engineering Fair website — a static HTML site rebuild of [lascifair.org](https://www.lascifair.org/).

This README is for **anyone editing site content or making small UI changes**. You don't need to be a JavaScript developer; most updates are editing HTML or JSON files.

---

## What's in this repo

It's a **static website**. No backend, no database, no framework. There are two small build steps — Tailwind CSS compiles into `css/styles.css`, and news articles compile from Markdown into static HTML pages under `news/posts/<id>.html`. **Neither output is committed**; both are regenerated on every deploy by a GitHub Actions workflow that publishes the result to GitHub Pages.

What this means for you, the editor:

- HTML pages live at the repo root and in [students/](students/); per-article pages are generated, not edited.
- Styling uses **Tailwind CSS**, compiled from [src/main.css](src/main.css) using the theme in [tailwind.config.js](tailwind.config.js).
- A few small JavaScript files load shared components (header/footer), render the schedule, and render the news feed.
- Data that changes often (schedule, news articles) lives in JSON files so you don't have to touch HTML to update it.
- **Pushing to `main` deploys** — every push triggers a build + Pages deploy. You can drop a Markdown file via the GitHub web UI and the article will appear on the site within a minute or two; no local build needed.

### Tech stack

| Thing                  | What it is                                                                     | Where                                                        |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Markup                 | Plain HTML                                                                     | `*.html` files                                               |
| Styling source         | `@tailwind` directives + a few custom rules                                    | [src/main.css](src/main.css)                                 |
| Styling output         | Compiled Tailwind CSS (build artifact, gitignored, served from each deploy)    | `css/styles.css`                                             |
| Tailwind theme         | Custom colors / typography / spacing tokens                                    | [tailwind.config.js](tailwind.config.js)                     |
| Header/footer          | Shared HTML snippets injected at runtime                                       | [components/](components/)                                   |
| Schedule data          | One JSON file drives the home + schedule pages                                 | [data/schedule.json](data/schedule.json)                     |
| Gallery data           | One JSON file lists photos with year, path, alt text, and caption              | [data/gallery.json](data/gallery.json)                       |
| Gallery images         | Local photos organized by year                                                 | [images/gallery/](images/gallery/)                           |
| News data              | One JSON file lists articles; bodies are Markdown                              | [news/](news/)                                               |
| Article build script   | Renders Markdown bodies + metadata into static HTML; regenerates `sitemap.xml` | [scripts/build-articles.mjs](scripts/build-articles.mjs)     |
| Article output         | Per-article static HTML (build artifact, gitignored, served from each deploy)  | `news/posts/<id>.html`                                       |
| Deploy workflow        | Builds on every push to `main` and deploys to GitHub Pages                     | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) |
| Design tokens          | Colors, type scale, spacing — the visual system                                | [DESIGN.md](DESIGN.md)                                       |
| Old site nav reference | Map of the previous nav structure for parity                                   | [nav-links.md](nav-links.md)                                 |

---

## Repo layout

```
.
├── index.html                 ← homepage (entry point)
├── schedule.html             ← full schedule + fair day itinerary
├── news.html                 ← news feed listing
├── post_template.html              ← legacy redirect: ?id=foo → news/posts/foo.html
├── judges.html               ← judges info
├── students.html             ← students landing
├── students/                 ← sub-pages linked from students.html
│   ├── how-to-participate.html
│   ├── pre-approval-faq.html
│   ├── student-project-registration.html
│   ├── supervisor-qualifications.html
│   └── understanding-src-results.html
├── gallery.html               ← photo gallery (filtered by year, with lightbox)
├── category-descriptions.html
├── components/               ← injected at runtime by js/components.js
│   ├── header.html
│   └── footer.html
├── src/
│   └── main.css              ← CSS source: @tailwind directives + custom rules
├── css/
│   └── styles.css            ← BUILD ARTIFACT (gitignored) — generated by `bun run build:css`
├── tailwind.config.js        ← Tailwind theme (colors/fonts/spacing tokens) + content scanning
├── scripts/
│   └── build-articles.mjs    ← turns posts.json + Markdown → news/posts/<id>.html + sitemap.xml
├── js/
│   ├── components.js         ← injects header/footer, marks active nav link
│   ├── schedule.js           ← reads data/schedule.json, renders timelines
│   ├── news-feed.js          ← reads data/posts.json, renders ticker + feed
│   ├── gallery.js            ← reads data/gallery.json, renders grid + lightbox
│   └── sponsors.js           ← reads data/sponsors.json, renders home spotlight
├── sitemap.xml               ← BUILD ARTIFACT (gitignored) — regenerated by `bun run build:articles`
├── .github/workflows/
│   ├── deploy.yml            ← on push to main: build + deploy to GH Pages
│   └── build-check.yml       ← on PRs: verify the build doesn't error
├── data/
│   ├── schedule.json         ← schedule single source of truth
│   └── gallery.json          ← photo gallery entries (year, src, alt, caption)
├── news/
│   ├── posts.json         ← list of articles (metadata + ordering)
│   └── posts/
│       ├── <id>.html         ← BUILD ARTIFACT (gitignored) — per-article static page
│       └── <YYYY-MM>/<slug>/
│           ├── <slug>.md     ← article body in Markdown
│           └── *.jpg / *.png ← images for this post live alongside it
├── downloads/                ← static PDFs linked from pages
├── DESIGN.md                 ← design system reference
├── nav-links.md              ← old-site nav inventory
├── package.json              ← dev tooling (Tailwind, marked, Prettier, husky, serve)
├── .prettierrc               ← formatting rules
├── .prettierignore           ← files Prettier shouldn't touch
└── .husky/pre-commit         ← runs Prettier on staged files before commit
```

---

## Running the site locally

You **can't** just double-click `index.html`. The page uses `fetch()` to pull in the header, footer, schedule, and news data — and browsers block `fetch()` on `file://` URLs for security. You need a tiny local web server.

### Recommended: bun start

After running `bun install` (see [First-time setup](#first-time-setup)):

```bash
bun start
```

This builds the CSS once, then starts the [`serve`](https://github.com/vercel/serve) static server. Open the URL it prints — usually <http://localhost:3000/index.html>.

### While editing classes: bun run dev

If you're changing Tailwind classes on a page, run the watcher in a second terminal so `css/styles.css` rebuilds automatically as you save:

```bash
bun run dev
```

Then refresh the page in your browser.

### Alternatives

```bash
# Python 3 (preinstalled on macOS / most Linux)
python3 -m http.server 8000
# → http://localhost:8000/index.html

# VS Code "Live Server" extension — right-click index.html → Open with Live Server
```

> The home page is `index.html`, not `index.html`. If you're hosting somewhere that requires `index.html`, ask whoever set up hosting — it's likely configured at the host level.

---

## How to update common things

### Update the schedule

Edit [data/schedule.json](data/schedule.json). It's the single source of truth for:

- The "2025 Fair Timeline" section on the homepage
- The full "Master Timeline" on the schedule page
- The registration phase boxes and fair-day itinerary on the schedule page

Inside the file:

- `milestones[]` — each milestone has a date, title, short + long description, status (`past` / `current` / `future`), and `featuredOnHome` (true = also show on homepage).
- Other arrays drive the registration phases and fair-day itinerary. The top-of-file `_comment` field documents what each section feeds.

After saving, refresh the page. No code changes needed.

### Add a news article

1. **Write the article body** as a Markdown file at:

   ```
   news/posts/<YYYY-MM>/<slug>/<slug>.md
   ```

   Example: `news/posts/2024-03/judging-tips/judging-tips.md`

2. **Add a metadata entry** to [data/posts.json](data/posts.json):

   ```json
   {
     "id": "judging-tips",
     "file": "2024-03/judging-tips/judging-tips",
     "title": "Tips for First-Time Judges",
     "category": "For Judges",
     "date": "2024-03-10",
     "excerpt": "A short summary that shows up in the feed.",
     "image": "https://…optional cover image URL…",
     "featured": false
   }
   ```

   - `id` must be unique — it's what `post_template.html?id=…` looks up.
   - `file` is the path under `news/posts/` **without** the `.md` extension.
   - `category` should be one of: `Announcement`, `For Judges`, `Success Stories`, `For Teachers`, `For Students` (anything else falls back to a default style).
   - `date` is `YYYY-MM-DD`. Articles are sorted newest-first by this field.
   - `featured: true` highlights the article on the homepage.

3. **Drop any images** the article references into the **same folder as the post** (e.g., `news/posts/2024-03/judging-tips/cover.jpg`) and reference them by filename in the Markdown:

   ```markdown
   ![Cover image](cover.jpg)
   ```

   The build script resolves the path against the article's own directory, so the image will load correctly on the live site.

4. **Commit and push to `main`.** The deploy workflow rebuilds the site (renders your Markdown into `news/posts/<id>.html`, regenerates `sitemap.xml`, recompiles CSS) and publishes it to GitHub Pages. You don't run any build yourself — this works whether you commit from a terminal or upload the file through GitHub's web UI. Allow a minute or two for the workflow to finish.

### Editing or removing an article

- **Edit the body**: change the `.md` file, push, deploy. The article's HTML page is re-rendered with the new content.
- **Edit metadata** (title, excerpt, image, category, date): change the entry in [data/posts.json](data/posts.json), push, deploy.
- **Remove an article**: delete its entry from [data/posts.json](data/posts.json) (and optionally remove its folder under `news/posts/<YYYY-MM>/<slug>/` if you don't want the source around anymore). The next deploy won't emit the article's HTML and will drop its URL from the sitemap.
- **Rename an article** (change its `id` in `posts.json`): the next deploy publishes it at the new URL. Old links die — only do this if you're sure no one is sharing the old URL.

### Edit page text

For most pages, just open the `.html` file and edit the text between the tags. The HTML uses Tailwind utility classes (e.g., `class="text-primary font-headline-lg"`) — leave those alone unless you're intentionally restyling.

### Update the header or footer

Both are shared across every page. Edit them in **one** place:

- [components/header.html](components/header.html) — top nav
- [components/footer.html](components/footer.html) — bottom links

When the page loads, [js/components.js](js/components.js) replaces `<div id="site-header">` / `<div id="site-footer">` placeholders with these files' contents. It also reads `data-page="…"` on each nav link and visually marks the one matching the current page.

So if you add a new top-level nav link, give the `<a>` a `data-page="<filename>.html"` attribute matching the page it links to.

### Add a new page

1. Copy an existing page (e.g., `judges.html`) as your starting point — it already has the right `<head>` setup, header/footer placeholders, and styling.
2. Rename it (e.g., `volunteers.html`) and edit the body.
3. If it should appear in the top nav, add a link in [components/header.html](components/header.html) with `data-page="volunteers.html"`.

### Change colors, fonts, or spacing

Visual tokens are defined in two coordinated places:

- [DESIGN.md](DESIGN.md) — the human-readable spec. Read this first to understand the system before changing values.
- [tailwind.config.js](tailwind.config.js) — where those tokens become actual Tailwind classes (`bg-primary`, `text-on-surface`, etc.).

If you change a color in `tailwind.config.js`, update DESIGN.md to match so they stay in sync. The CSS is a build artifact — you don't need to commit it; the deploy workflow regenerates it on every push.

For one-off custom styles that don't fit Tailwind, add them to [src/main.css](src/main.css) (not the compiled `css/styles.css` — that file is overwritten on every build).

### Add photos to the gallery

The photo gallery ([gallery.html](gallery.html)) is driven entirely by two things: the image files in [images/gallery/](images/gallery/) and the entries in [data/gallery.json](data/gallery.json). The page groups photos by year and lets visitors filter by year. Clicking a photo opens a full-screen lightbox with keyboard navigation.

**To add photos:**

1. **Drop the image file** into `images/gallery/<year>/` — for example, `images/gallery/2026/awards-ceremony.jpg`. Use lowercase-with-hyphens filenames.

2. **Add an entry** to [data/gallery.json](data/gallery.json):

   ```json
   {
     "year": 2026,
     "src": "images/gallery/2026/awards-ceremony.jpg",
     "alt": "Students receiving awards at the 2026 LA County Science Fair",
     "caption": "2026 Awards Ceremony"
   }
   ```

   - `year` — integer; used for the year-filter tabs. A new year value automatically creates a new tab.
   - `src` — path to the image, relative to the repo root.
   - `alt` — screen-reader description; be specific (who/what is in the photo).
   - `caption` — short label shown on hover and in the lightbox.

3. **Commit and push.** No build step needed — the gallery JSON is read at runtime.

**To remove a photo:** delete its entry from `gallery.json` (and optionally delete the image file too).

**To add a new year's worth of photos:** create the folder (`images/gallery/<year>/`), drop the images in, and add entries to `gallery.json` with the matching `year` value. The filter tab appears automatically.

### Add or replace a downloadable PDF

Drop the file in [downloads/](downloads/) and link to it with a relative path:

```html
<a href="downloads/judging-interviews.pdf">Judging & Interviews Guide</a>
```

---

## First-time setup

### 1. Install Bun

Download and install [Bun](https://bun.sh/) — it's the JS runtime and package manager used by this project.

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

To verify:

```bash
bun --version   # should print 1.x or higher
```

> **macOS (Homebrew):** `brew install bun`

### 2. Install project dependencies

In the repo directory, run:

```bash
bun install
```

This installs:

- `tailwindcss` + plugins — the CSS compiler (`bun run build:css`, `bun run dev`).
- `marked` — Markdown → HTML for the article build.
- `serve` — the local dev server (`bun start`).
- Prettier (formatter), husky (git hook manager), lint-staged (runs formatter on staged files).
- Wires up the pre-commit hook automatically (via husky's `prepare` script).

You only need to do this **once per clone** of the repo.

---

## Build & deploy

Three files in this repo are **build artifacts** — they're regenerated from sources and **not committed to git** (they're in `.gitignore`):

- `css/styles.css` — Tailwind output, from [src/main.css](src/main.css) + [tailwind.config.js](tailwind.config.js)
- `news/posts/<id>.html` — one per article in [data/posts.json](data/posts.json), from the article's Markdown body via [scripts/build-articles.mjs](scripts/build-articles.mjs)
- `sitemap.xml` — regenerated alongside articles so the URL list stays in sync

### How deploys work

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs on every push to `main` and on manual `workflow_dispatch`. It:

1. Checks out the repo (sources only — no build outputs to start with)
2. Runs `bun install --frozen-lockfile` and `bun run build`
3. Stages the static site (the just-built outputs + all the regular HTML/CSS/images/JSON) to a temporary `_site/` directory, excluding source-only stuff like `src/`, `scripts/`, `node_modules/`, etc.
4. Uploads `_site/` as a Pages artifact and deploys via [actions/deploy-pages](https://github.com/actions/deploy-pages)

Because the deploy is a clean, fresh build from sources every time, **the live site automatically picks up additions, edits, renames, and deletions** — including ones made through the GitHub web UI by contributors who never run anything locally.

> **One-time repo setup:** in **Settings → Pages**, set **Source** to **GitHub Actions**. Without that, the workflow runs but nothing actually deploys. (If the site is currently configured as "Deploy from a branch", flip it.)

[.github/workflows/build-check.yml](.github/workflows/build-check.yml) runs on pull requests to `main` and just verifies that `bun run build` doesn't error — so build problems are caught before merge, not at deploy time.

### Building locally

```bash
# Build once + start the dev server (the usual local-preview command):
bun start

# CSS watch mode — rebuilds on every save while you tweak classes:
bun run dev

# Just the CSS:
bun run build:css

# Just the articles + sitemap:
bun run build:articles

# Everything:
bun run build
```

**When to rebuild locally:**

- Class change in any HTML / JS / build script → CSS rebuild (or use `bun run dev`).
- New article, edited article, or change to [scripts/build-articles.mjs](scripts/build-articles.mjs) → article rebuild.
- Change to [tailwind.config.js](tailwind.config.js) or [src/main.css](src/main.css) → CSS rebuild.

You don't need to commit any of the build outputs — the deploy workflow does its own clean build. The pre-commit hook still runs `bun run build` locally as a verification step (so build errors are caught at commit time, not after push), but it doesn't stage anything because the outputs are gitignored.

---

## Pre-commit hook (auto-formatting)

Every time you run `git commit`, the hook runs Prettier on the files you staged and re-stages the formatted versions before the commit completes. You don't have to think about it — just write code and commit.

It formats:

- `.html`, `.css`, `.js`, `.json`, `.md`

It ignores:

- Anything in [.prettierignore](.prettierignore) (`node_modules/`, `downloads/`, `.git/`, `package-lock.json`)

### Useful commands

```bash
# Format every file in the repo (run once if you want to clean up the backlog)
bun run format

# Check formatting without changing anything (useful in CI)
bun run format:check
```

### Tweak the formatting rules

Edit [.prettierrc](.prettierrc). Current defaults: 100-char lines, 2-space indent, double quotes, semicolons. After changing, run `bun run format` to apply the new rules everywhere.

### If the hook misbehaves

```bash
# See what the hook actually runs
cat .husky/pre-commit

# Run it manually to debug
.husky/pre-commit

# Re-install hooks (if they got removed somehow)
bun run prepare
```

To **bypass the hook for a single commit** (rare — usually only for an emergency or a commit that's intentionally not in our format):

```bash
git commit --no-verify -m "…"
```

Use sparingly. The hook exists so the repo stays consistent.

---

## Code style notes

- **HTML:** Tailwind utility classes, lowercase tags, double-quoted attributes. Prettier handles indentation.
- **JS:** Plain ES modules, no framework. Keep it small and readable; if a file is starting to get complicated, that's a signal to ask before adding more.
- **CSS:** Add to [src/main.css](src/main.css) when Tailwind utilities can't express what you need. Never edit `css/styles.css` — it's a build artifact that gets overwritten.
- **Filenames:** Lowercase with hyphens (`how-to-participate.html`, not `HowToParticipate.html`).

---

## Workflow for a typical change

1. Pull latest: `git pull`
2. Make your edits.
3. Open the site locally (`bun start`) and check it looks right — including the page on a narrow window (mobile layout). If you're iterating on classes, leave `bun run dev` running in another terminal.
4. `git add <files>` and `git commit -m "short message"` — the hook formats your files and, if any class-affecting or article-affecting source is staged, runs `bun run build` locally to verify it doesn't error.
5. `git push`. The deploy workflow rebuilds and publishes to GitHub Pages within a minute or two.

If you're working on something bigger, make a branch (`git checkout -b your-change`) and open a pull request instead of pushing directly to `main`.

---

## Where to ask for help

- **Design questions** ("what color should this be?", "what's the right type size?") → [DESIGN.md](DESIGN.md) first; if it's not there, ask in chat.
- **Old site behavior** ("what was on this page before?") → [nav-links.md](nav-links.md) is a map of the legacy site's URLs.
- **Something broke after I edited a file** → check the browser console (F12 → Console tab); errors there usually point at the problem (typo in JSON, missing file, etc.).
- **Anything else** → ask the maintainer.
