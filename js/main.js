import { renderMarkdown } from "./markdown.js";
import { htmlToMarkdown } from "./paste.js";
import { exportEpub } from "./epub.js";
import "katex/dist/katex.min.css";
import "../css/style.css";

/* -------------------------------------------------------------- Chapters */

import {
  chapters,
  chapterById,
  PART_DEFINITIONS,
} from "./curriculum.js";

/* ------------------------------------------------------------------ State */

const STORAGE_KEY = "cbse-maths-notes-studio-v4";
const CUSTOM_ID = "custom";

function readSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && typeof saved === "object" && saved.drafts && typeof saved.drafts === "object") {
      return saved;
    }
  } catch {
    /* corrupt or unavailable storage */
  }
  return { activeId: chapters[0]?.id || CUSTOM_ID, drafts: {} };
}

const savedState = readSavedState();
const drafts = savedState.drafts;

// A reader can link straight to a chapter copy with studio.html?ch=<slug>.
const requestedSlug = new URLSearchParams(location.search).get("ch");
const requestedChapter = requestedSlug
  ? chapters.find((chapter) => chapter.slug === requestedSlug)
  : null;
let activeId = requestedChapter
  ? requestedChapter.id
  : savedState.activeId === CUSTOM_ID || chapterById.has(savedState.activeId)
    ? savedState.activeId
    : chapters[0]?.id || CUSTOM_ID;

/* --------------------------------------------------------------- Elements */

const editor = document.querySelector("#editor");
const classField = document.querySelector("#class-field");
const chapterField = document.querySelector("#chapter-field");
const chapterPicker = document.querySelector("#chapter-picker");
const previewContent = document.querySelector("#preview-content");
const previewTitle = document.querySelector("#preview-title");
const previewClass = document.querySelector("#preview-class");
const saveStatus = document.querySelector("#save-status");
const wordCount = document.querySelector("#word-count");
const toast = document.querySelector("#toast");
const printDocument = document.querySelector("#print-document");
const printClass = document.querySelector("#print-class");
const printTitle = document.querySelector("#print-title");
const printContent = document.querySelector("#print-content");
const printDialog = document.querySelector("#print-dialog");
const printChoices = document.querySelector("#print-chapter-choices");
const printChoiceGroups = document.querySelector("#print-choice-groups");
const printCurrentLabel = document.querySelector("#print-current-label");
const epubButton = document.querySelector("#epub-button");
const dialogKicker = document.querySelector("#print-dialog-kicker");
const dialogTitle = document.querySelector("#print-dialog-title");
const dialogConfirm = document.querySelector("#print-dialog-confirm");
const epubNote = document.querySelector("#epub-note");

/* --------------------------------------------------------------- Templates */

const NEW_NOTE_TEMPLATE = String.raw`## 1. Topic name

Write your explanation here. Keep one idea per paragraph.

$$
a^2 + b^2 = c^2
$$

> **Remember:** Add the key rule, formula or definition here.

### Worked example

**Problem:** Write the question.

**Solution:**

$$
\boxed{\text{answer}}
$$

---

**Practice:** Add two questions for revision.
`;

/* ------------------------------------------------------------- Chapter UI */

function populateChapterPicker() {
  chapterPicker.innerHTML = "";

  const customOption = document.createElement("option");
  customOption.value = CUSTOM_ID;
  customOption.textContent = "Scratch note (not linked to a chapter)";
  chapterPicker.appendChild(customOption);

  for (const part of PART_DEFINITIONS) {
    const partChapters = chapters.filter((chapter) => chapter.part === part.id);
    if (partChapters.length === 0) continue;

    const group = document.createElement("optgroup");
    group.label = part.label;
    chapterPicker.appendChild(group);

    for (const chapter of partChapters) {
      const option = document.createElement("option");
      option.value = chapter.id;
      option.textContent = chapter.topicShort
        ? `${chapter.topicShort} — ${chapter.title}`
        : chapter.title;
      group.appendChild(option);
    }
  }

  chapterPicker.value = activeId;
}

function currentDraft() {
  return {
    content: editor.value,
    className: classField.value,
    title: chapterField.value,
  };
}

function persistState(addCurrentDraft = true) {
  if (addCurrentDraft) drafts[activeId] = currentDraft();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeId, drafts }));
    saveStatus.textContent = "Saved in this browser";
  } catch {
    saveStatus.textContent = "Draft too large for browser storage";
  }
}

let saveTimer;
function scheduleSave() {
  const docId = activeId;
  saveStatus.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (docId !== activeId) return;
    drafts[docId] = currentDraft();
    persistState(false);
  }, 350);
}

function flushSave() {
  clearTimeout(saveTimer);
  drafts[activeId] = currentDraft();
  persistState(false);
}

function loadActiveDocument({ saveAfter = false } = {}) {
  const chapter = chapterById.get(activeId);
  const draft = drafts[activeId];

  if (draft) {
    editor.value = draft.content;
    classField.value = draft.className || chapter?.className || "Class 9";
    chapterField.value = draft.title || chapter?.title || "Untitled notes";
  } else if (chapter) {
    editor.value = chapter.content;
    classField.value = chapter.className;
    chapterField.value = chapter.title;
  } else {
    editor.value = NEW_NOTE_TEMPLATE;
    chapterField.value = "Untitled notes";
  }

  chapterPicker.value = activeId;
  updatePreview();
  if (saveAfter) persistState(false);
}

function startNewNote() {
  if (drafts[CUSTOM_ID]?.content?.trim()) {
    const replace = window.confirm(
      "Start a new scratch note? The previous scratch note will be replaced. Chapter drafts are not affected."
    );
    if (!replace) return;
  }

  flushSave();
  activeId = CUSTOM_ID;
  drafts[CUSTOM_ID] = {
    content: NEW_NOTE_TEMPLATE,
    className: classField.value || "Class 9",
    title: "Untitled notes",
  };
  loadActiveDocument();
  persistState(false);
  chapterPicker.focus();
  showToast("New scratch note created.");
}

/* ---------------------------------------------------------------- Render */

function updatePreview() {
  const title = chapterField.value.trim() || "Mathematics Notes";
  previewTitle.textContent = title;
  previewClass.textContent = `${classField.value.toUpperCase()} · MATHEMATICS`;

  try {
    previewContent.innerHTML = renderMarkdown(editor.value);
  } catch (error) {
    console.error("Preview failed:", error);
    previewContent.innerHTML =
      '<p style="color:#b42318">The preview could not be built. Check the Markdown or LaTeX near the cursor.</p>';
  }

  const words = editor.value.trim().split(/\s+/).filter(Boolean).length;
  wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
  document.title = `${title} · CBSE Maths Notes`;
}

function refresh({ save = true } = {}) {
  updatePreview();
  if (save) scheduleSave();
}

/* --------------------------------------------------------- Text insertion */

function insertTextAt(text, start, end) {
  editor.focus();
  editor.setSelectionRange(start, end);

  let inserted = false;
  try {
    inserted = document.execCommand("insertText", false, text);
  } catch {
    inserted = false;
  }

  if (!inserted) {
    editor.setRangeText(text, start, end, "end");
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

const SNIPPETS = {
  heading: "\n## New section heading\n\n",
  bold: "**important text**",
  italic: "*italic text*",
  underline: "<u>underlined text</u>",
  inline: "$x^2 + y^2$",
  display: "\n\n$$\n a^2 + b^2 = c^2 \n$$\n\n",
  box: '\n<div class="formula-box">\n\n$$\n(a+b)^2 = a^2 + 2ab + b^2\n$$\n\n</div>\n\n',
  list: "\n- First point\n- Second point\n- Third point\n",
  table: "\n| Rule | Formula |\n|---|---|\n| Example | $a^2+b^2=c^2$ |\n\n",
  pagebreak: '\n<div class="page-break"></div>\n\n',
};

/* ------------------------------------------------------------------ Toast */

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

/* ------------------------------------------------------- Complete workbook */

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]
  );
}

function printableChapter(chapter) {
  const draft = drafts[chapter.id];
  return {
    id: chapter.id,
    title: draft?.title?.trim() || chapter.title,
    className: draft?.className || chapter.className,
    content: draft?.content ?? chapter.content,
  };
}

function renderChapterForPrint(chapter) {
  try {
    return renderMarkdown(chapter.content);
  } catch (error) {
    console.error(`Could not render ${chapter.id} for printing:`, error);
    return '<p style="color:#b42318">This chapter could not be prepared for printing.</p>';
  }
}

const PRINT_SCOPE_META = {
  all: {
    kicker: "RECOMMENDED STUDY ORDER",
    heading: "Complete Workbook",
    title: "Complete Study Notes",
    label: "CHAPTER",
    copy:
      "Begin with the diagnostic assessment and the eight foundation repair lessons, then work " +
      "through the Class 9 sequence in order. Enrichment material is kept at the end and is not " +
      "required core content. Each chapter starts on a new page.",
  },
  foundation: {
    kicker: "FOUNDATION REPAIR",
    heading: "Foundation Workbook",
    title: "Foundation Lessons 1–8",
    label: "FOUNDATION",
    copy:
      "Work through the eight repair modules before the Class 9 chapters. Each lesson follows the " +
      "same five-part structure: remember, formula bank, how to solve, watch out, and practise.",
  },
  core: {
    kicker: "CLASS 9 STUDY ORDER",
    heading: "Core Chapters",
    title: "Class 9 Chapters",
    label: "CHAPTER",
    copy:
      "These chapters follow the Class 9 sequence without the foundation modules. Print the " +
      "foundations separately when they are needed for revision.",
  },
  part1: {
    kicker: "PART 1 · CHAPTERS 1–8",
    heading: "Part 1 Workbook",
    title: "Part 1 · Chapters 1–8",
    label: "CHAPTER",
    copy:
      "Coordinates and linear polynomials, numbers and identities, geometry and mensuration, " +
      "probability and sequences. Each chapter starts on a new page.",
  },
  part2: {
    kicker: "PART 2 · CHAPTERS 9–14",
    heading: "Part 2 Workbook",
    title: "Part 2 · Chapters 9–14",
    label: "CHAPTER",
    copy:
      "Reasoning, data and algorithms, then quadrilaterals, linear equations in two variables " +
      "and solid mensuration. Each chapter starts on a new page.",
  },
  current: {
    kicker: "SINGLE LESSON",
    heading: "Lesson",
    title: "Lesson",
    label: "LESSON",
    copy: "A single lesson, printed without the workbook contents page.",
  },
  custom: {
    kicker: "SELECTED LESSONS",
    heading: "Selected Lessons",
    title: "Selected Lessons",
    label: "LESSON",
    copy: "The selected lessons, printed in study order. Each lesson starts on a new page.",
  },
};

function buildPrintDocument({ scope, selected }) {
  flushSave();

  const printChapters = selected.map(printableChapter);
  if (printChapters.length === 0) return false;

  const meta = PRINT_SCOPE_META[scope] || PRINT_SCOPE_META.custom;
  const classNames = [...new Set(printChapters.map((chapter) => chapter.className))];
  const classHeading = classNames.length === 1 ? classNames[0] : "CBSE";

  printClass.textContent =
    classNames.length === 1
      ? `${classNames[0].toUpperCase()} · ${
          scope === "foundation" ? "FOUNDATION REPAIR" : "MATHEMATICS"
        }`
      : "CBSE MATHEMATICS";
  printTitle.textContent =
    scope === "current" && printChapters.length === 1 ? printChapters[0].title : meta.title;

  const contents = printChapters
    .map(
      (chapter, index) => `
        <li>
          <span class="print-order-number">${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(chapter.title)}</strong>
        </li>`
    )
    .join("");

  const sections = printChapters
    .map(
      (chapter, index) => `
        <section class="print-chapter" data-print-chapter="${chapter.id}">
          <div class="print-chapter-label">
            <span>${meta.label} ${index + 1}</span>
            <strong>${escapeHtml(chapter.title)}</strong>
          </div>
          ${renderChapterForPrint(chapter)}
        </section>`
    )
    .join("");

  const contentsPage =
    printChapters.length > 1
      ? `
    <section class="print-contents">
      <p class="print-contents-kicker">${escapeHtml(meta.kicker)}</p>
      <h2>${escapeHtml(meta.heading)} · ${escapeHtml(classHeading)} Mathematics</h2>
      <p class="print-contents-copy">${escapeHtml(meta.copy)}</p>
      <ol class="print-order-list">${contents}</ol>
    </section>`
      : "";

  printContent.innerHTML = `${contentsPage}${sections}`;

  return true;
}

/* ------------------------------------------------------------ Rich paste */

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function pasteImageFiles(files, start, end) {
  try {
    const images = [];
    for (const file of files) {
      const dataUrl = await readFileAsDataURL(file);
      images.push(`\n\n![Pasted image](${dataUrl})\n\n`);
    }
    insertTextAt(images.join("").trim() + "\n", start, end);
    showToast(
      `${files.length} image${files.length === 1 ? "" : "s"} embedded in the note.`
    );
  } catch (error) {
    console.error("Could not paste image:", error);
    showToast("The image could not be embedded.");
  }
}

editor.addEventListener("paste", (event) => {
  const clipboard = event.clipboardData;
  if (!clipboard) return;

  // Ctrl+Shift+V keeps the browser's plain-text paste.
  if (event.shiftKey) {
    showToast("Pasting as plain text.");
    return;
  }

  const html = clipboard.getData("text/html");
  const imageFiles = Array.from(clipboard.files || []).filter((file) =>
    file.type.startsWith("image/")
  );

  if (!html && imageFiles.length === 0) return;

  event.preventDefault();
  const start = editor.selectionStart;
  const end = editor.selectionEnd;

  if (imageFiles.length > 0) {
    void pasteImageFiles(imageFiles, start, end);
    return;
  }

  let markdown = "";
  try {
    markdown = htmlToMarkdown(html);
  } catch (error) {
    console.error("Rich paste conversion failed:", error);
  }

  if (!markdown.trim()) {
    const plainText = clipboard.getData("text/plain");
    if (plainText) insertTextAt(plainText, start, end);
    showToast("Pasted as plain text.");
    return;
  }

  insertTextAt(markdown, start, end);
  showToast("Formatting preserved: headings, emphasis, colours, lists and tables kept.");
});

/* --------------------------------------------------------------- Actions */

document.querySelectorAll("[data-insert]").forEach((button) => {
  button.addEventListener("click", () => {
    const snippet = SNIPPETS[button.dataset.insert];
    if (!snippet) return;
    insertTextAt(snippet, editor.selectionStart, editor.selectionEnd);
    refresh();
  });
});

editor.addEventListener("input", () => refresh());
classField.addEventListener("change", () => refresh());
chapterField.addEventListener("input", () => refresh());

editor.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && !event.ctrlKey && !event.altKey && !event.metaKey) {
    event.preventDefault();
    insertTextAt("  ", editor.selectionStart, editor.selectionEnd);
    refresh();
  }
});

chapterPicker.addEventListener("change", () => {
  flushSave();
  activeId = chapterPicker.value;
  loadActiveDocument({ saveAfter: true });
});

document.querySelector("#new-note-button").addEventListener("click", startNewNote);

document.querySelector("#reset-button").addEventListener("click", () => {
  const chapter = chapterById.get(activeId);
  const label = chapter ? `“${chapter.title}”` : "the scratch note";

  if (!window.confirm(`Restore ${label} to its original content? Your current edits will be replaced.`)) {
    return;
  }

  clearTimeout(saveTimer);
  if (chapter) {
    editor.value = chapter.content;
    classField.value = chapter.className;
    chapterField.value = chapter.title;
  } else {
    editor.value = NEW_NOTE_TEMPLATE;
    chapterField.value = "Untitled notes";
  }

  delete drafts[activeId];
  refresh();
  showToast("Original content restored.");
});

function populatePrintChoices() {
  printChoiceGroups.innerHTML = "";

  for (const part of PART_DEFINITIONS) {
    const partChapters = chapters.filter((chapter) => chapter.part === part.id);
    if (partChapters.length === 0) continue;

    const partHeading = document.createElement("p");
    partHeading.className = "print-choice-part";
    partHeading.textContent = part.label;
    printChoiceGroups.appendChild(partHeading);

    let lastTopic = "";
    for (const chapter of partChapters) {
      if (chapter.topic && chapter.topic !== lastTopic) {
        const topicHeading = document.createElement("p");
        topicHeading.className = "print-choice-topic";
        topicHeading.textContent = chapter.topic;
        printChoiceGroups.appendChild(topicHeading);
        lastTopic = chapter.topic;
      }

      const label = document.createElement("label");
      label.className = "print-choice";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = chapter.id;
      input.checked = true;

      const text = document.createElement("span");
      text.textContent = chapter.title;

      label.append(input, text);
      printChoiceGroups.appendChild(label);
    }
  }
}

function currentPrintScope() {
  return document.querySelector('input[name="print-scope"]:checked')?.value || "all";
}

function chaptersForPrintScope(scope) {
  if (scope === "foundation") {
    return chapters.filter((chapter) => chapter.part === "foundation");
  }
  if (scope === "core") {
    return chapters.filter((chapter) => chapter.part !== "foundation");
  }
  if (scope === "part1") {
    return chapters.filter((chapter) => chapter.part === "part1");
  }
  if (scope === "part2") {
    return chapters.filter((chapter) => chapter.part === "part2");
  }
  if (scope === "current") {
    const chapter = chapterById.get(activeId);
    return chapter ? [chapter] : [];
  }
  if (scope === "custom") {
    const checked = new Set(
      [...printChoiceGroups.querySelectorAll('input[type="checkbox"]:checked')].map(
        (input) => input.value
      )
    );
    return chapters.filter((chapter) => checked.has(chapter.id));
  }
  return chapters;
}

let dialogMode = "print";

const EPUB_SCOPE_META = {
  all: {
    kicker: "RECOMMENDED STUDY ORDER",
    heading: "Complete Workbook",
    title: "Class 9 Mathematics",
    subtitle: "Complete study material · Foundations, Parts 1–2 and revision",
    copy:
      "Begin with the diagnostic assessment and the eight foundation repair lessons, then work " +
      "through the Class 9 chapters in order. Enrichment material is kept at the end.",
    fileName: "class-9-complete-study-material.epub",
  },
  foundation: {
    kicker: "FOUNDATION REPAIR",
    heading: "Foundation Workbook",
    title: "Foundation Repair",
    subtitle: "Foundation Lessons 1–8",
    copy:
      "Work through the eight repair modules before the Class 9 chapters. Each lesson follows the " +
      "same five-part structure: remember, formula bank, how to solve, watch out, and practise.",
    fileName: "class-9-foundations.epub",
  },
  core: {
    kicker: "CLASS 9 STUDY ORDER",
    heading: "Core Workbook",
    title: "Class 9 Chapters",
    subtitle: "The Class 9 chapters in study order",
    copy:
      "These chapters follow the Class 9 sequence without the foundation modules. Print or export " +
      "the foundations separately when they are needed for revision.",
    fileName: "class-9-chapters.epub",
  },
  part1: {
    kicker: "PART 1 · CHAPTERS 1–8",
    heading: "Part 1 Workbook",
    title: "Part 1 · Chapters 1–8",
    subtitle: "Coordinates, algebra, number systems, geometry, probability and sequences",
    copy:
      "Coordinates and linear polynomials, numbers and identities, geometry and mensuration, " +
      "probability and sequences. Each chapter starts on a new page.",
    fileName: "class-9-part-1.epub",
  },
  part2: {
    kicker: "PART 2 · CHAPTERS 9–14",
    heading: "Part 2 Workbook",
    title: "Part 2 · Chapters 9–14",
    subtitle: "Reasoning, data, algorithms, quadrilaterals, equations and solids",
    copy:
      "Reasoning, data and algorithms, then quadrilaterals, linear equations in two variables " +
      "and solid mensuration. Each chapter starts on a new page.",
    fileName: "class-9-part-2.epub",
  },
  current: {
    kicker: "SINGLE LESSON",
    heading: "Lesson",
    title: "Lesson",
    subtitle: "A single lesson from the Class 9 workbook",
    copy: "A single lesson, exported without a contents page.",
    fileName: "class-9-lesson.epub",
  },
  custom: {
    kicker: "SELECTED LESSONS",
    heading: "Selected Lessons",
    title: "Selected Lessons",
    subtitle: "Selected lessons in study order",
    copy: "The selected lessons in study order. Each lesson starts on a new page.",
    fileName: "class-9-selected-lessons.epub",
  },
};

function epubMetaForScope(scope, chaptersForBook) {
  const base = EPUB_SCOPE_META[scope] || EPUB_SCOPE_META.custom;
  const isFoundationOnly =
    scope === "foundation" ||
    chaptersForBook.every((chapter) => chapter.part === "foundation");

  let labelPrefix = "CHAPTER";
  if (isFoundationOnly) labelPrefix = "FOUNDATION";
  else if (scope === "current" || scope === "custom") labelPrefix = "LESSON";

  const title =
    scope === "current" && chaptersForBook.length === 1
      ? chaptersForBook[0].title
      : base.title;

  const labels = chaptersForBook.map(
    (_, index) => `${labelPrefix} ${index + 1}`
  );

  return {
    ...base,
    title,
    labels,
    coverKicker: "CBSE · CLASS 9 MATHEMATICS",
    fileName:
      scope === "current" && chaptersForBook.length === 1
        ? `${chaptersForBook[0].slug || "lesson"}.epub`
        : base.fileName,
  };
}

function openPrintDialog(mode = "print") {
  dialogMode = mode;
  const activeChapter = chapterById.get(activeId);
  const verb = mode === "epub" ? "Export" : "Print";

  printCurrentLabel.textContent = activeChapter
    ? `${verb} “${activeChapter.title}” by itself.`
    : "The chapter open in the editor.";

  dialogKicker.textContent =
    mode === "epub" ? "EXPORT EPUB · APPLE BOOKS" : "PRINT / SAVE AS PDF";
  dialogTitle.textContent =
    mode === "epub" ? "Choose what to export" : "Choose what to print";
  dialogConfirm.textContent =
    mode === "epub" ? "Export EPUB" : "Print / Save as PDF";
  epubNote.hidden = mode !== "epub";
  printDialog.setAttribute(
    "aria-label",
    mode === "epub" ? "Export options" : "Print options"
  );

  printDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("dialog-open");
  document.querySelector('input[name="print-scope"][value="all"]')?.focus();
}

function closePrintDialog() {
  printDialog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("dialog-open");
}

async function exportSelectedChapters() {
  const scope = currentPrintScope();
  const selected = chaptersForPrintScope(scope);

  if (selected.length === 0) {
    showToast("Choose at least one chapter to export.");
    return;
  }

  closePrintDialog();

  const chaptersForBook = selected.map((chapter) => {
    const printable = printableChapter(chapter);
    return {
      ...printable,
      slug: chapter.slug,
      part: chapter.part,
      html: renderChapterForPrint(printable),
    };
  });

  const meta = epubMetaForScope(scope, chaptersForBook);

  try {
    const result = await exportEpub({
      chapters: chaptersForBook,
      meta,
      onProgress: ({ message }) => showToast(message),
    });
    showToast(`EPUB ready · ${result.pages} pages · ${(result.bytes / 1048576).toFixed(1)} MB`);
  } catch (error) {
    console.error("Could not build the EPUB:", error);
    showToast(`Could not build the EPUB: ${error.message}`);
  }
}

function printSelectedChapters() {
  const scope = currentPrintScope();
  const selected = chaptersForPrintScope(scope);

  if (selected.length === 0) {
    showToast("Choose at least one chapter to print.");
    return;
  }

  // Build the workbook before opening the dialog. Do not render inside a
  // beforeprint handler: Chrome's print preview makes DOMPurify's Trusted
  // Types callback unusable there.
  closePrintDialog();
  if (!buildPrintDocument({ scope, selected })) {
    updatePreview();
    window.print();
    return;
  }

  printDocument.setAttribute("aria-hidden", "false");
  document.body.classList.add("printing-all");
  window.print();
}

document.querySelector("#print-button").addEventListener("click", () => {
  if (activeId === CUSTOM_ID) {
    updatePreview();
    window.print();
    return;
  }
  openPrintDialog("print");
});

epubButton.addEventListener("click", () => {
  if (activeId === CUSTOM_ID) {
    showToast("Open a chapter before exporting an EPUB.");
    return;
  }
  openPrintDialog("epub");
});

document.querySelectorAll('input[name="print-scope"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    printChoices.hidden = currentPrintScope() !== "custom";
    if (!printChoices.hidden) {
      printChoiceGroups.querySelector("input")?.focus();
    }
  });
});

document.querySelector("#print-select-all").addEventListener("click", () => {
  printChoiceGroups
    .querySelectorAll('input[type="checkbox"]')
    .forEach((input) => (input.checked = true));
});

document.querySelector("#print-select-none").addEventListener("click", () => {
  printChoiceGroups
    .querySelectorAll('input[type="checkbox"]')
    .forEach((input) => (input.checked = false));
});

document.querySelector("#print-dialog-confirm").addEventListener("click", () => {
  if (dialogMode === "epub") {
    exportSelectedChapters();
    return;
  }
  printSelectedChapters();
});
document.querySelector("#print-dialog-cancel").addEventListener("click", closePrintDialog);
document.querySelector("#print-dialog-close").addEventListener("click", closePrintDialog);
document.querySelector("[data-print-close]").addEventListener("click", closePrintDialog);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && printDialog.getAttribute("aria-hidden") === "false") {
    closePrintDialog();
  }
});

window.addEventListener("afterprint", () => {
  document.body.classList.remove("printing-all");
  printDocument.setAttribute("aria-hidden", "true");
  printContent.innerHTML = "";
});

document.querySelector("#download-button").addEventListener("click", () => {
  const title = chapterField.value.trim() || "cbse-maths-notes";
  const filename =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "cbse-maths-notes";

  const blob = new Blob([editor.value], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${filename}.md`);
});

window.addEventListener("beforeunload", () => {
  clearTimeout(saveTimer);
  drafts[activeId] = currentDraft();
  persistState(false);
});

/* ------------------------------------------------------------------ Boot */

populateChapterPicker();
populatePrintChoices();
loadActiveDocument();
