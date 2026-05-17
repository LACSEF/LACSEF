---
name: new-article
description: Use this skill when the user wants to create, add, or publish a new news article on the LACSEF website. Triggers on requests like "write an article about X", "add this markdown as a news post", "publish this article", "create a news post for Y", "I have a zip with an article", or any request to add content to the news section. Use it even if the user just says "new article" or pastes article content without explicit instructions.
version: 1.0.0
---

# New Article Skill

Creates and registers a new LACSEF news article. Handles two input modes:

1. **Write from prompt** — user describes what the article should cover; you draft it.
2. **Import from file** — user provides a `.md` file path or a `.zip` containing a `.md` (and optionally images).

---

## Article structure

Articles have two parts:

**Markdown body** — stored at `news/posts/<YYYY-MM>/<slug>/<slug>.md`
(e.g. `news/posts/2026-05/isef-results-2026/isef-results-2026.md`)

**Metadata entry** in `data/posts.json` (prepend to the array — newest first):

```json
{
  "id": "isef-results-2026",
  "file": "2026-05/isef-results-2026/isef-results-2026",
  "title": "2026 ISEF Results Announced",
  "category": "Success Stories",
  "date": "2026-05-17",
  "excerpt": "One or two sentence summary shown on the news listing page.",
  "image": "https://...",
  "featured": true
}
```

`image` and `featured` are optional. Omit them unless the user provides an image URL or explicitly marks the article as featured.

Valid categories (use exact strings):

- `Announcement`
- `For Students`
- `For Teachers`
- `For Judges`
- `Success Stories`

---

## Step-by-step process

### 1. Gather metadata

If the user hasn't already provided all of these, ask in a single message:

- **Title** — the article headline
- **Category** — one of the five valid categories above
- **Date** — publication date (default: today, `2026-05-17`)
- **Excerpt** — 1–2 sentence teaser (you can draft one from the content if not given)
- **Image URL** (optional) — featured image for the article header and social cards
- **Featured** (optional, boolean) — whether to pin this article as featured on the news page

For **Mode 2 (file import)**, also ask for the file path if it wasn't provided.

Don't ask for the slug — derive it from the title: lowercase, words joined by hyphens, no special characters (e.g. "2026 ISEF Results!" → `isef-results-2026` if the year isn't redundant with the date; otherwise just `isef-results`). Keep it short and descriptive.

### 2. Prepare the Markdown body

**Mode 1 (write from prompt):**
Write a well-structured article in Markdown. Use:

- An H2 for the opening section if needed (skip the H1 — the build script renders the title separately)
- Short paragraphs, subheadings where appropriate
- No filler or placeholder text — write real content based on the user's brief

Match the tone of existing articles: informative, professional, warm. Avoid AI-sounding filler phrases ("In conclusion…", "It is worth noting…").

**Mode 2 (import .md file):**
Read the provided file. If the content has an H1 that duplicates the title, strip it — the template adds the title automatically. Otherwise leave the content as-is.

**Mode 2 (import .zip file):**

```bash
# Unzip to a temp dir
mkdir -p /tmp/article-import
unzip -o <zip-path> -d /tmp/article-import

# Find the markdown file
find /tmp/article-import -name "*.md" | head -1
```

Use the first `.md` found as the article body. Note any image files — you'll need to move them alongside the Markdown.

### 3. Create the directory and write the file

```bash
mkdir -p news/posts/<YYYY-MM>/<slug>
```

Write the Markdown content to `news/posts/<YYYY-MM>/<slug>/<slug>.md`.

If there were images in a zip, copy them into the same directory:

```bash
cp /tmp/article-import/*.{jpg,jpeg,png,gif,webp,svg} news/posts/<YYYY-MM>/<slug>/ 2>/dev/null || true
```

Reference images in the Markdown with relative paths (e.g. `![Alt text](image.jpg)`) — the build script resolves these correctly.

### 4. Register in posts.json

Read `data/posts.json`. Prepend the new entry (newest first) and write it back. The `file` field value is `<YYYY-MM>/<slug>/<slug>` — no leading slash, no `.md` extension.

Use the Edit tool for targeted JSON updates rather than rewriting the whole file where possible. If rewriting, preserve all existing entries exactly.

### 5. Verify and build

Run the article build to confirm the new post renders without errors:

```bash
bun run build:articles
```

If it fails, read the error and fix the cause (usually a missing Markdown file or a malformed `posts.json` entry).

### 6. Report back

Tell the user:

- The slug / article ID
- The Markdown file path
- That they can preview it by running `bun start` and navigating to `news/posts/<id>.html`
- Whether the article is set as featured

---

## Edge cases

- **Duplicate slug**: if a slug derived from the title already exists in `posts.json`, append `-2` (or the year if that's meaningful).
- **No excerpt provided**: draft one from the first paragraph of the article body, ≤ 25 words.
- **Date in the past or future**: use whatever the user gives; don't second-guess it.
- **Category not in the valid list**: pick the closest match and tell the user. Don't invent new category strings.
- **Zip with multiple .md files**: ask the user which one is the article body.
