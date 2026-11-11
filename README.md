# MathsFunda — CBSE Class 9

A guided CBSE Class 9 mathematics course: a calm landing page, staged lessons,
a page-turning reader, spaced-repetition flashcards and a searchable formula
vault. The content is written in Markdown with KaTeX formulas.

- Live site: `https://developersunilb.github.io/mathfunda/`
- Public site: read-only for visitors
- Editing: local studio + git
- Contribution: fork, pull request, owner approval

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Landing page: the five stages, next lesson, today's panel. |
| `learn.html?stage=foundations` | One stage at a time: Start, Foundations, Part 1, Part 2, Enrichment. |
| `reader.html?ch=<slug>` | Flip-book lesson reader: facing-page **Book view** on wide screens (toggle in the header), single pages on phones, swipe, tap zones, keys, contents. |
| `flashcards.html` | 14 curated decks with retrieval practice and per-device spaced repetition. |
| `formulas.html` | Formula vault scraped from the lesson tables, with search and print. |
| `methods.html` | Evidence-based memorisation guide and a 15-minute routine. |
| `studio.html` | Local Markdown editor, PDF print and EPUB export. |
| `admin.html` | How publishing, permissions and pull-request approval work. |

## Parent-only answer key

The diagnostic assessment (`reader.html?ch=diagnostic-assessment`) shows the 20 questions only. The answers, marking guide and worked reasoning live on a separate parent-only page:

- `reader.html?ch=diagnostic-answer-key` — Answer Key (password-gated)

The parent unlocks it by entering the password. The password is hardcoded in `js/reader.js` at line 49:

```js
const PARENT_PASSWORD = "mathfunda-parent";
```

Change that string, then `npm run build` and redeploy, to set your own password. The unlock state is stored in `localStorage` under `mathfunda-parent-unlocked`, so the parent stays unlocked for that browser session until cleared.

> ⚠️ This is a browser-side convenience gate, not real security. Anyone who can read the source can find the password. The real boundary is repository access — keep your GitHub repository private if you don't want others to see the answers.

Progress, streaks and card schedules are stored in `localStorage` under
`mathfunda-progress-v1`. They are per-browser and per-device; the same URL must
be used for them to persist.

## Run it

```powershell
cd E:\CBSE-Maths-Notes
npm install
npm run dev
```

Open the printed local address (normally `http://127.0.0.1:5173`).

```powershell
npm run build     # static build in dist/
npm run preview   # serve the production build at http://127.0.0.1:4173
```

The build includes a service worker. After the first visit the landing page,
lessons (including `?ch=…` URLs), flashcards and the formula vault work offline.
The service worker deliberately has **no navigation fallback**: this is a
multi-page site, and falling back to `index.html` would make `reader.html` open
as the home page.

## Content model

| What | Where |
|---|---|
| Lesson text | `chapters/class-9/*.md` |
| Order, titles, stage placement, lesson blurbs | `js/curriculum.js` |
| Flashcard decks | `js/flashcard-data.js` |
| Reader pagination | `js/paginate.js` |
| EPUB export and spreads | `js/epub.js` |
| Progress and SM-2 scheduling | `js/progress.js` |
| Public-site styles | `css/site.css` |
| Studio styles | `css/style.css` |

`js/curriculum.js` imports every Markdown file, so adding a lesson only needs a
new file and, if it should appear in a known position, an entry in
`CHAPTER_ORDER` / `TITLE_OVERRIDES` / `LESSON_NOTES`.

### Add a lesson

1. Create `chapters/class-9/my-lesson.md`.
2. Start with a `##` heading. Use `$x^2$`, `$$ … $$`, tables and
   `<div class="formula-box">` as in the existing lessons.
3. Add the slug to `CHAPTER_ORDER`, `TITLE_OVERRIDES` and `LESSON_NOTES` in
   `js/curriculum.js` if it needs a specific stage, title or description.
4. Run `npm run dev` and check the landing page, stage list, reader and formula
   vault.

### Add flashcards

Append cards to the end of a deck in `js/flashcard-data.js`. Card ids are based on
deck position (`deckId-n`), so appending keeps existing review schedules stable.
Do not reorder existing cards without accepting that per-device schedules will
point at different cards.

## Publishing

The public site is built by GitHub Actions and deployed to GitHub Pages on every
push to `main`. Visitors cannot edit it: there is no write endpoint and no
password box, because a browser-side password is not real security. The real
boundary is repository access.

### Owner workflow

```powershell
git status
git add .
git commit -m "Describe the lesson change"
git push origin main
```

Watch the **Actions** tab until **Deploy to GitHub Pages** is green, then reload
the live URL. A failed run leaves the previous deployment live.

### Contributor workflow

`main` is protected:

- collaborators cannot push directly; they must open a pull request;
- one approving review is required;
- stale approvals are dismissed when new commits arrive;
- force-pushes and branch deletion are disabled;
- conversation resolution is required before merge;
- administrators are not enforced, so the owner can still push directly.

A pull request merged by the owner is the approval gate. For a small correction,
an issue with the exact page and suggested wording is enough.

> If branch protection ever needs to be recreated, use the GitHub UI under
> **Settings → Branches**, or the API with
> `required_approving_review_count: 1`, `enforce_admins: false`,
> `allow_force_pushes: false` and `allow_deletions: false`.

### Install on iPad

1. Open the live URL in **Safari**.
2. Tap **Share → Add to Home Screen**.
3. Launch from the home screen and let the first visit cache the pages.
4. Lessons then open offline. Progress stays on that device.

GitHub Pages serves over HTTPS, which the service worker requires. A plain LAN
address such as `http://192.168.x.x:4173` can load the site but cannot install
the offline app.

## Studio, PDF and EPUB

`studio.html` is a local editing surface: Markdown on the left, rendered preview
on the right. Open it directly, or from a lesson: **Contents → Edit a copy in the
local studio**. The editor accepts `studio.html?ch=<slug>` so it opens that
chapter. Edits are saved in that browser only; the Markdown files on disk are not
touched until you export or commit them. Use **Download .md** to save a chapter,
or copy the text into the matching file under `chapters/class-9/`.

### Print a PDF

Click **Print / Save as PDF**, choose a scope (complete workbook, foundations,
Class 9 chapters, a part, one lesson or selected chapters), then choose A4,
portrait and default margins. Save the PDF in `output/PDFs/`.

### Export an EPUB for iPad

Click **Export EPUB** and choose the same scopes. Each finished A4 page is
rendered and packed into a fixed-layout EPUB 3 book with:

- `rendition:layout=pre-paginated`;
- `rendition:orientation=landscape` and `rendition:spread=landscape`;
- `rendition:flow=paginated`;
- Apple display options `fixed-layout`, `open-to-spread` and
  `orientation-lock=landscape`.

On a wide screen Apple Books shows two facing pages; on a narrow phone it shows
one page at a time, which is expected. Export runs in the browser, so keep the
tab open. A full book takes several minutes and is roughly 8 MB. The latest
export is `output/EPUB/class-9-complete-study-material.epub` (83 pages), which is
gitignored.

The exporter lives in `js/epub.js`; pages are captured with `html-to-image` and
zipped with `jszip`.

## Writing syntax

- `## Heading` — section heading.
- `$x^2$` — inline maths.
- `$$ … $$` — centred display formula.
- `| Rule | Formula |` — table (also feeds the formula vault).
- `<div class="formula-box"> … </div>` — important-formula box.
- `<div class="page-break"></div>` — forced printed page break.

## Deploying from scratch

The included workflow is `.github/workflows/deploy-pages.yml`. On GitHub:

1. Create a public repository.
2. Push the project to `main`.
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Watch **Actions** for the first green deploy.
5. Add the branch protection described above.

`node_modules`, `dist` and exported PDF/EPUB files are gitignored.
