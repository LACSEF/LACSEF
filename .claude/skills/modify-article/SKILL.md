---
name: modify-article
description: Use this skill when the user wants to edit, update, correct, replace, or modify an existing news article on the LACSEF website. Triggers on requests like "update the article about X", "fix this article", "change the title of Y", "replace the body of Z", "edit the excerpt", "swap out the image", "correct the date on", or any request that involves changing existing news content. Use it even if the user just says "edit article" or pastes replacement content without explicit instructions.
version: 1.0.0
---

# Modify Article Skill

Edits or replaces content in an existing LACSEF news article. Handles two scopes:

1. **Metadata change** — update fields in `data/posts.json` (title, category, date, excerpt, image, featured).
2. **Body change** — edit or fully replace the Markdown file at `news/posts/<YYYY-MM>/<slug>/<slug>.md`.

Both scopes can apply in the same operation.

---

## Locating the article

First, identify which article the user means. If they gave a slug/ID (e.g. `isef-results-2026`), use it directly. Otherwise search `data/posts.json` by title keyword — read the file and find the closest match. If there's ambiguity, list the candidates and ask.

Once found, note:

- `id` — the slug, used as the HTML output filename
- `file` — path relative to `news/posts/`, without `.md` (e.g. `2026-05/isef-results-2026/isef-results-2026`)
- Full metadata entry (title, category, date, excerpt, image, featured)

The Markdown body lives at `news/posts/<file>.md`.

---

## Step-by-step process

### 1. Understand the requested change

Identify what needs changing. Common cases:

| What user asks                      | Where the change goes           |
| ----------------------------------- | ------------------------------- |
| Edit title, category, date, excerpt | `posts.json` metadata only      |
| Add / change / remove image URL     | `posts.json` metadata only      |
| Set or unset featured               | `posts.json` metadata only      |
| Rewrite or fix article body         | Markdown file only              |
| Replace with a new .md file         | Markdown file only              |
| Replace with a .zip                 | Markdown file + possibly images |
| Both title and body                 | Both                            |

If it's unclear which part they want changed, ask before editing.

### 2. Metadata changes (posts.json)

Read `data/posts.json`. Find the entry by `id`. Apply the requested field changes.

Valid categories (exact strings only):

- `Announcement`
- `For Students`
- `For Teachers`
- `For Judges`
- `Success Stories`

Use the Edit tool to make targeted changes rather than rewriting the whole file. Preserve all other entries and fields exactly — don't reorder the array or reformat unrelated entries.

### 3. Body changes

**Edit in place (partial change):**
Read the Markdown file. Apply the specific edits the user described — correct a fact, rewrite a section, add a paragraph. Use the Edit tool for precision. Don't rewrite sections the user didn't ask to change.

**Full replacement from a new .md file:**
Read the provided file path. Overwrite `news/posts/<file>.md` with the new content. If the new file has an H1 that duplicates the article title, strip it — the build template adds the title automatically.

**Full replacement from a .zip:**

```bash
mkdir -p /tmp/article-import
unzip -o <zip-path> -d /tmp/article-import
find /tmp/article-import -name "*.md" | head -1
```

Use the first `.md` as the new body. Copy any images into the article's existing directory:

```bash
cp /tmp/article-import/*.{jpg,jpeg,png,gif,webp,svg} news/posts/<YYYY-MM>/<slug>/ 2>/dev/null || true
```

If the zip contains images that are referenced in the Markdown with relative paths, those paths will resolve correctly as long as the images land in the same directory as the `.md` file.

### 4. Slug / path changes (rare)

If the user changes the title significantly and wants the URL to reflect it, you'll need to:

1. Rename the directory: `mv news/posts/<old-path>/ news/posts/<new-YYYY-MM>/<new-slug>/`
2. Rename the file: `mv ... <new-slug>.md`
3. Update `posts.json`: change `id` and `file` to match, update `date` if the month changed

Only do this if the user explicitly asks — don't rename slugs automatically for title edits, as it breaks existing links.

### 5. Verify and build

After any change, run:

```bash
bun run build:articles
```

If it fails, read the error and fix the cause before reporting done.

### 6. Report back

Summarize what changed:

- Which fields were updated in `posts.json` (show old → new for each)
- Whether the Markdown body was edited or replaced
- The article URL for preview: `news/posts/<id>.html` (accessible via `bun start`)

---

## Edge cases

- **Article not found**: if no entry matches the user's description, say so clearly and list a few nearby titles. Don't create a new article — use the `/new-article` skill for that.
- **Ambiguous match**: if two articles share keywords, list both with their dates and ask.
- **Category not in the valid list**: pick the closest match and tell the user.
- **User pastes new body inline**: treat the pasted text as the replacement Markdown content; write it to the file directly.
- **Removing a field** (e.g. unsetting `featured` or removing an image): delete the key from the JSON entry rather than setting it to `null` or `false` — the build script treats absence and falsiness the same, but omission is cleaner.
