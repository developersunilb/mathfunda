# CBSE Maths Notes Studio

A small, reusable maths-notes generator for CBSE classes. Write notes in Markdown,
preview KaTeX formulas live, and print textbook-style A4 pages to PDF from Chrome
or Edge.

## Folder structure

```
CBSE-Maths-Notes/
├── .github/workflows/deploy-pages.yml   automatic GitHub Pages deploy
├── .gitignore
├── package.json
├── vite.config.js       production build + PWA manifest/service worker
├── node_modules/
├── index.html
├── public/
│   └── icons/           home-screen and maskable app icons
├── css/
│   └── style.css
├── js/
│   ├── main.js          editor, chapters, print and paste handling
│   ├── epub.js          fixed-layout EPUB 3 exporter for Apple Books
│   ├── markdown.js      Markdown + KaTeX renderer
│   └── paste.js         rich clipboard → Markdown converter
├── chapters/
│   ├── class-9/
│   │   ├── learning-roadmap.md
│   │   ├── study-plan-45-days.md
│   │   ├── diagnostic-assessment.md
│   │   ├── foundation-1-numbers-and-signs.md
│   │   ├── foundation-2-fractions-decimals-percentages.md
│   │   ├── foundation-3-ratio-and-proportion.md
│   │   ├── foundation-4-powers-and-roots.md
│   │   ├── foundation-5-basic-algebra.md
│   │   ├── foundation-6-algebraic-operations.md
│   │   ├── foundation-7-geometry-vocabulary.md
│   │   ├── foundation-8-measurement-and-units.md
│   │   ├── geometry-basics.md
│   │   ├── basic-equations.md
│   │   ├── number-systems.md
│   │   ├── polynomials.md
│   │   ├── linear-equations.md
│   │   ├── linear-inequalities.md
│   │   └── beyond-class-9.md
│   └── class-10/
└── output/
    ├── PDFs/            save your exported PDFs here
    └── EPUB/            exported fixed-layout books for Apple Books
```

## Run it

```powershell
cd E:\CBSE-Maths-Notes
npm install
npm run dev
```

Open the printed local address (normally `http://127.0.0.1:5173`) in Chrome or Edge.

Use `npm run build` to make a static production build in `dist/`. The build
includes a service worker, so the hosted app keeps working offline after the
first visit.

## Publish on GitHub Pages

This is the recommended route. The build uses relative paths, so it works at
`https://<user>.github.io/<repo>/` without changing the repository name.

### 1. Create the repository

On GitHub, click **New repository**, give it a name such as `cbse-maths-notes`,
and leave **Add a README**, **.gitignore** and **licence** set to *None* (the
project already has them). A **public** repository is simplest: GitHub Pages on
a private repository needs a paid plan.

### 2. Put the project in git

From `E:\CBSE-Maths-Notes`:

```powershell
git init
git add .
git commit -m "CBSE maths notes studio"
git branch -M main
git remote add origin https://github.com/<your-user>/cbse-maths-notes.git
git push -u origin main
```

Replace `<your-user>` and the repository name with your own. `node_modules`,
`dist` and the large exported PDF/EPUB files are ignored by `.gitignore`.

### 3. Turn on GitHub Pages

In the repository: **Settings → Pages → Build and deployment**.

- **Source:** *GitHub Actions*

That is the only setting. The included workflow
(`.github/workflows/deploy-pages.yml`) builds the site and publishes it every
time you push to `main` (or `master`).

### 4. Watch the first deploy

Open the **Actions** tab. The workflow **Deploy to GitHub Pages** runs
`npm ci`, `npm run build` and then deploys `dist/`. Wait for both jobs to turn
green. The Pages URL appears in the deploy step and under **Settings → Pages**:

```
https://<your-user>.github.io/<repo>/
```

### 5. Install it on the iPad

1. Open that URL in **Safari** (not Chrome).
2. Tap **Share → Add to Home Screen → Add**.

It now has its own icon, opens fullscreen, and works offline after the first
visit. Each later `git push` redeploys automatically; reopen the app to receive
the update.

### Notes

- Use the same URL every time. Drafts live in that origin's `localStorage`.
- iOS can clear website data after long periods of disuse. Use **Download .md**
  for anything you would be sorry to lose.
- The two-pane editor is desktop-shaped. For reading on the iPad, use the
  exported EPUB in Apple Books instead.
- GitHub Pages serves over HTTPS, which the service worker requires. A plain LAN
  address such as `http://192.168.x.x:4173` will load the app but not install it.

### Alternative hosts

`npm run build` produces a self-contained `dist/` folder. Dragging it onto
[Netlify Drop](https://app.netlify.com/drop) or uploading it to Cloudflare Pages
works the same way. GitHub Pages is preferred here because the deploy is
versioned with the source.

## Writing notes

- `## Heading` creates a section heading.
- `$x^2$` creates inline maths.
- `$$ ... $$` creates a centred display formula.
- `| Rule | Formula |` creates a table.
- `<div class="formula-box"> ... </div>` creates an important-formula box.
- `<div class="page-break"></div>` starts a new printed page.

The toolbar inserts each of these for you. Drafts are saved automatically in the
browser; **Download .md** writes the current note back out as a Markdown file.

> **New edition note:** the chapter set and storage key were updated. Drafts saved
> by the earlier edition are not loaded, so the new diagnostic and foundation
> chapters appear with their original content. Use **Reset chapter** if a draft ever
> hides updated lesson material.

## Pasting from Google Docs, Word or a website

Copy the formatted text and paste normally into the editor:

- headings, bold, italics, underline and strikethrough are preserved;
- text colours, highlights, superscript and subscript are preserved;
- bullet/numbered lists, links, images and tables are converted;
- tables whose first row has no `<th>` are promoted to a Markdown table header.

Use **Ctrl + Shift + V** for a plain-text paste. Formatting is converted to
Markdown/HTML that stays editable in the editor.

## Export a PDF

1. Click **Print / Save as PDF**.
2. Choose what to print:
   - **Complete workbook** — every chapter in study order, with a contents page.
   - **Foundations only** — Foundation 1–8 as a separate foundation workbook.
   - **Class 9 chapters only** — everything except the foundation modules.
   - **Part 1 · Chapters 1–8** — coordinates, algebra, number systems, geometry, probability and sequences.
   - **Part 2 · Chapters 9–14** — reasoning, data, algorithms, quadrilaterals, linear equations and solids.
   - **This lesson only** — the chapter currently open, with no contents page.
   - **Choose chapters** — tick any combination of lessons.
3. Choose **A4**, **Portrait**, margins **Default**.
4. Select **Save as PDF** and save the file in `output/PDFs/`.

The workbook uses the saved draft of each chapter. A scratch note prints by itself.

## Export an EPUB for iPad

Click **Export EPUB** and choose the same scopes as printing. The app renders
each finished A4 page, then packs the pages into a **fixed-layout EPUB 3** book.

- No reflow: formulas, callout boxes and tables stay exactly as designed.
- Page size: 794 × 1123 CSS pixels (A4), rendered at 1.6× for Retina screens.
- Works in Apple Books on iPad 8 and later, and in other EPUB 3 readers.
- Includes a cover, a linked contents page (except single lessons) and a
  proper EPUB navigation document.
- A single lesson skips the contents page; multi-chapter books include one.

Open the `.epub` in Apple Books, or send it to the iPad with AirDrop or Files.
The export runs in the browser, so keep the tab open until it finishes. A full
18-chapter book takes several minutes and is roughly 10 MB.

The exporter lives in `js/epub.js`. Pages are captured with `html-to-image`
and the book is zipped with `jszip`.

## Chapter groups

The **Open chapter** menu and the print chooser use these subheaders:

| Group | Chapters |
|---|---|
| Getting Started | Roadmap, 45-day plan, diagnostic assessment |
| Foundation Repair | Any file whose name starts with `foundation-` |
| Part 1 · Chapters 1–2 | Coordinates and Linear Polynomials |
| Part 1 · Chapters 3–4 | Numbers and Identities |
| Part 1 · Chapters 5–6 | Geometry and Mensuration |
| Part 1 · Chapters 7–8 | Probability and Sequences |
| Part 2 · Chapters 9–11 | Reasoning, Data and Algorithms |
| Part 2 · Chapters 12–14 | Quadrilaterals, Equations and Solids |
| Enrichment | Inequalities and beyond-Class-9 material |

The slug-to-part/topic mapping lives in `CHAPTER_PLACEMENT` in `js/main.js`.
Add each new chapter's slug there when the remaining textbook chapters are written.

## Adding a chapter

Create a new file such as `chapters/class-10/real-numbers.md`. It appears in the
**Open chapter** menu automatically; the file name becomes the chapter title.
