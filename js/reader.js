import katex from "katex";
import { renderMarkdown } from "./markdown.js";
import { contentBottom, paginateChapter } from "./paginate.js";
import {
  markPlanTaskComplete,
} from "./plan-sync.js";
import {
  chapters,
  chapterById,
  nextChapter,
  stageChapters,
  RESOURCE_SUFFIXES,
  RESOURCE_LABELS,
} from "./curriculum.js";
import {
  conceptIdsForLessonSlug,
  getAllQuestionConceptIdsForLessonSlug,
  getAllQuestionsForLessonSlug,
} from "./adaptive-plan.js";
import {
  isLessonDone,
  lessonState,
  markLessonDone,
  setLessonPage,
} from "./progress.js";
import {
  MASTERY_STATES,
  LESSON_STATES,
  ERROR_CATEGORIES,
  getLessonState,
  startLesson,
  setLessonPage as setEngineLessonPage,
  completeLesson,
  isLessonCompleted,
  getMasteryState,
  setMasteryState,
  isMastered,
  needsMasteryConfirmation,
  recordPracticeAttempt,
  getConfirmationQuestions,
  assessMastery,
  recordMistake,
  getMistakesForConcept,
} from "./lesson-engine.js";
import {
  getQuestionsForConcept,
  getQuestion,
  answersEquivalent,
  validateAllQuestions,
  MASTERY_THRESHOLD,
} from "./content-model.js";
import { getStrategy, resolveComposition, getCompositionType, matchMisconception, getMisconception, getMemoryJourney, hasMemoryJourney } from "./lesson-intelligence.js";
import { renderBlocks, renderBlock, renderMisconceptionIntervention, renderMemoryJourneyElement } from "./block-renderer.js";
import {
  emitLessonStarted,
  emitPracticeStarted,
  emitPracticeAnswered,
  emitMisconceptionInterventionShown,
  emitMisconceptionInterventionCompleted,
  emitPracticeCompleted,
  emitMasteryAssessed,
  emitMemoryJourneyStarted,
  emitMemoryRecallShown,
  emitMemoryRevealUsed,
  emitMemoryJourneyCompleted,
  emitMemoryJourneyExited,
} from "./pilot-events.js";
import { mountWidgetsIn } from "./interactive-mode.js";
import {
  orientation,
  currentLevel,
  startSession,
  nextStep,
  afterThis,
  currentActivity,
} from "./orientation.js";
import "katex/dist/katex.min.css";
import "../css/site.css";

const params = new URLSearchParams(location.search);
const slug = params.get("ch") || "";
const chapter = chapters.find((entry) => entry.slug === slug);

const shell = document.querySelector("#reader-page-shell");
const measure = document.querySelector("#reader-measure");
const stage = document.querySelector("#reader-stage");
const titleEl = document.querySelector("#reader-title");
const kickerEl = document.querySelector("#reader-kicker");
const pageLabel = document.querySelector("#reader-page-label");
const progressFill = document.querySelector("#reader-progress-fill");
const prevButton = document.querySelector("#reader-prev");
const nextButton = document.querySelector("#reader-next");
const completeButton = document.querySelector("#reader-complete-button");
const nextLessonLink = document.querySelector("#reader-next-lesson");
const tocPanel = document.querySelector("#reader-toc");
const tocList = document.querySelector("#reader-toc-list");
const tocFlashcards = document.querySelector("#reader-toc-flashcards");
const tocEdit = document.querySelector("#reader-toc-edit");
const toast = document.querySelector("#toast");
const viewButton = document.querySelector("#reader-view-button");
const tipEl = document.querySelector(".reader-tip");

if (!chapter) {
  location.replace("./study-plan-personalized.html");
}

const BOOK_MIN_WIDTH = 1024;
const BOOK_DEFAULT_WIDTH = 1100;
const VIEW_KEY = "mathfunda-reader-view";
const PARENT_PASSWORD_KEY = "mathfunda-parent-unlocked";
const PARENT_PASSWORD = "mathfunda-parent";

/**
 * Chapter → concept ID mapping.
 *
 * Maps reader chapter slugs to Lesson Intelligence concept IDs.
 * Only chapters with a registered teaching strategy are listed here.
 * Chapters not in this map use the existing Markdown rendering path unchanged.
 */
const CHAPTER_TO_CONCEPT_ID = {
  "foundation-5-basic-algebra": "algebra-linear-equation",
  "geometry-basics": "geo-circle-area",
  "foundation-4-powers-and-roots": "numbers-exponents",
  "foundation-1-numbers-and-signs": "numbers-hcf-lcm",
};

let pages = [];
let current = 0;
let turning = false;
let bookMode = false;
let saveTimer;
let parentUnlocked = false;

/* ------------------------------------------------------------ Practice state */

let practiceActive = false;
let practiceQuestions = [];
let practiceCurrentIndex = 0;
let practiceStepAnswers = [];
let practiceResults = [];
let practiceConceptId = null;
let practiceConceptQueue = [];
let practicePendingConcept = null;
let practicePendingTimer = null;
let practiceFlowGeneration = 0;

/* Misconception intervention state */
let practiceInterventionActive = false;
let practiceInterventionQuestions = [];
let practiceInterventionIndex = 0;
// Keyed by "conceptId|description" to scope dedup per concept, not globally.
let practiceInterventionShown = new Map();
let practiceOriginalQuestionIndex = 0;
let practiceInterventionTimer = null;

/* Memory Journey state */
let memoryJourneyActive = false;
let memoryJourneyElements = [];
let memoryJourneyIndex = 0;

/* ------------------------------------------------------------ Practice DOM */

let practiceOverlay = null;
let practiceQuestionEl = null;
let practiceInstructionEl = null;
let practiceExpressionEl = null;
let practiceAnswerInput = null;
let practiceStepInputs = null;
let practiceFeedbackEl = null;
let practiceHintEl = null;
let practiceResultEl = null;
let practiceSubmitBtn = null;
let practiceNextBtn = null;
let practiceRetryBtn = null;
let practiceMasteryBtn = null;
let practiceCloseBtn = null;
let practiceProgressEl = null;

/* ------------------------------------------------------------ View mode */

function wantsBookView() {
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === "book") return true;
    if (saved === "single") return false;
  } catch {
    /* storage blocked: fall back to the screen width */
  }
  // Wide screens start in the two-page book layout; the toggle switches back.
  return window.innerWidth >= BOOK_DEFAULT_WIDTH;
}

function applyViewMode() {
  bookMode = window.innerWidth >= BOOK_MIN_WIDTH && wantsBookView();
  shell.classList.toggle("is-book", bookMode);
  measure.classList.toggle("is-book", bookMode);
  viewButton.hidden = window.innerWidth < BOOK_MIN_WIDTH;
  viewButton.textContent = bookMode ? "Single page" : "Book view";
  viewButton.setAttribute("aria-pressed", String(bookMode));
  if (tipEl) {
    tipEl.textContent = bookMode
      ? "Turn the spread with ← →, swipe or tap the sides"
      : "Swipe, tap the sides or use ← →";
  }
}

/* ------------------------------------------------------------ Parent gate */

function isParentUnlocked() {
  try {
    return localStorage.getItem(PARENT_PASSWORD_KEY) === "1";
  } catch {
    return false;
  }
}

function setParentUnlocked() {
  try {
    localStorage.setItem(PARENT_PASSWORD_KEY, "1");
  } catch {
    /* storage blocked: proceed anyway for this visit */
  }
  parentUnlocked = true;
}

function showParentGate() {
  shell.innerHTML = "";
  measure.innerHTML = "";

  const overlay = document.createElement("div");
  overlay.className = "parent-gate";

  const card = document.createElement("div");
  card.className = "parent-gate-card";

  const title = document.createElement("h2");
  title.textContent = "Parent access";

  const note = document.createElement("p");
  note.textContent =
    "This page contains answers and worked reasoning. Enter the parent password to continue.";

  const input = document.createElement("input");
  input.type = "password";
  input.placeholder = "Password";
  input.className = "parent-gate-input";

  const error = document.createElement("p");
  error.className = "parent-gate-error";
  error.hidden = true;
  error.textContent = "Incorrect password.";

  const submit = document.createElement("button");
  submit.type = "button";
  submit.textContent = "Unlock";
  submit.className = "primary-button";

  const back = document.createElement("button");
  back.type = "button";
  back.textContent = "Back to study home";
  back.className = "quiet-button";
  back.style.marginLeft = "0.5rem";
  back.addEventListener("click", () => {
    location.href = "./index.html";
  });

  submit.addEventListener("click", () => {
      if (input.value === PARENT_PASSWORD) {
        setParentUnlocked();
        parentUnlocked = true;
        boot();
      } else {
        error.hidden = false;
        input.value = "";
        input.focus();
      }
    });

    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") submit.click();
    });

    card.append(title, note, input, error, submit, back);
    overlay.appendChild(card);
    shell.appendChild(overlay);
    input.focus();
  }

function addLockButton() {
  const actions = document.querySelector(".reader-actions");
  if (!actions) return;

  const lockBtn = document.createElement("button");
  lockBtn.type = "button";
  lockBtn.textContent = "Lock";
  lockBtn.className = "quiet-button";
  lockBtn.title = "Lock this page and require the password again";
  lockBtn.addEventListener("click", () => {
    try {
      localStorage.removeItem(PARENT_PASSWORD_KEY);
    } catch {
      /* storage blocked */
    }
    parentUnlocked = false;
    showParentGate();
  });
  actions.appendChild(lockBtn);
}

/* ------------------------------------------------------------- Page builder */

class ReaderBuilder {
  constructor(host) {
    this.host = host;
    this.pages = [];
    this.current = null;
  }

  get contentWidth() {
    return this.current.body.clientWidth;
  }

  get pageHeight() {
    return this.current.body.clientHeight;
  }

  addPage() {
    const page = document.createElement("div");
    page.className = "reader-page";

    const body = document.createElement("div");
    body.className = "reader-page-body document-content";

    const footer = document.createElement("div");
    footer.className = "reader-page-footer";
    const footerTitle = document.createElement("span");
    footerTitle.className = "reader-page-footer-title";
    footerTitle.textContent = chapter.title;
    const footerNumber = document.createElement("span");
    footerNumber.className = "reader-page-footer-number";
    footer.append(footerTitle, footerNumber);

    page.append(body, footer);
    this.host.appendChild(page);

    const entry = { page, body, footerNumber };
    this.pages.push(entry);
    this.current = entry;
    return entry;
  }

  fits() {
    // Keep a footer's worth of room at the bottom. `scrollHeight` alone allows
    // the last line to slide under the page number.
    return contentBottom(this) <= this.current.body.clientHeight - 46;
  }

  hasContent() {
    return this.current.body.firstElementChild !== null;
  }

  breakPage() {
    return this.addPage();
  }
}

/* --------------------------------------------------------------- Rendering */

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function restorePage() {
  const fromQuery = Number(params.get("page"));
  if (fromQuery > 0) return fromQuery - 1;
  const saved = lessonState(chapter.slug).page;
  return Math.max(0, (saved || 1) - 1);
}

function buildPages() {
  applyViewMode();
  measure.innerHTML = "";
  shell.innerHTML = "";
  pages = [];

  const builder = new ReaderBuilder(measure);
  const label = stageKicker();

  // Composition-aware lesson rendering.
  //
  // Two approaches:
  //   "enhanced" — Existing Markdown remains the primary instructional content.
  //                Strategy intro blocks render before Markdown; outro blocks
  //                render after. No duplication of existing explanations.
  //   "led"      — Strategy blocks are the main instructional content.
  //                Markdown renders as supplementary reference after blocks.
  //
  // Lessons without a registered strategy use the existing Markdown path
  // unchanged — no behavioural difference.
  const conceptId = CHAPTER_TO_CONCEPT_ID[chapter.slug];
  const strategy = conceptId ? getStrategy(conceptId) : null;

  let lessonHtml = "";
  if (strategy) {
    const composition = getCompositionType(strategy);

    if (composition === "enhanced") {
      // Enhanced: intro blocks → Markdown → outro blocks
      const blockContainer = document.createElement("div");
      const { introBlocks, outroBlocks } = resolveComposition(strategy);
      introBlocks.forEach((block) => renderBlock(blockContainer, block));
      const introHtml = blockContainer.innerHTML;

      blockContainer.innerHTML = "";
      outroBlocks.forEach((block) => renderBlock(blockContainer, block));
      const outroHtml = blockContainer.innerHTML;

      const html = renderMarkdown(chapter.content);
      const resourcesHtml = chapter.resource ? "" : resourcesSectionHtml(chapter);
      lessonHtml = introHtml + html + outroHtml + resourcesHtml;
    } else {
      // Led: strategy blocks as main content, then Markdown as supplementary
      const blockContainer = document.createElement("div");
      const { ledBlocks } = resolveComposition(strategy);
      ledBlocks.forEach((block) => renderBlock(blockContainer, block));
      const blocksHtml = blockContainer.innerHTML;

      const html = renderMarkdown(chapter.content);
      const resourcesHtml = chapter.resource ? "" : resourcesSectionHtml(chapter);
      lessonHtml = blocksHtml + html + resourcesHtml;
    }
  } else {
    const html = renderMarkdown(chapter.content);
    const resourcesHtml = chapter.resource ? "" : resourcesSectionHtml(chapter);
    lessonHtml = html + resourcesHtml;
  }

  paginateChapter(builder, { title: chapter.title, html: lessonHtml }, label);
  pages = builder.pages;

  // Mount any interactive widgets found in page bodies.
  // This covers both existing Markdown widget markers (e.g. circle-rect in
  // geometry-basics) and any rendered by strategy blocks.
  pages.forEach((entry) => {
    mountWidgetsIn(entry.body);
  });

  pages.forEach((entry, index) => {
    entry.footerNumber.textContent = String(index + 1);
    entry.page.dataset.page = String(index + 1);
  });

  // Move the rendered pages into the visible shell.
  pages.forEach((entry) => {
    shell.appendChild(entry.page);
    entry.page.classList.remove(
      "is-current",
      "is-under",
      "is-turning",
      "is-returning",
      "is-spread-left",
      "is-spread-right"
    );
  });

  current = Math.min(restorePage(), Math.max(0, pages.length - 1));
  if (bookMode) current = Math.floor(current / 2) * 2;
  renderPage(false);
  buildToc();
}

function stageKicker() {
  const stage = chapters.find((entry) => entry.id === chapter.id)?.part;
  const labels = {
    "getting-started": "START HERE",
    foundation: "FOUNDATIONS",
    part1: "CLASS 9 · PART 1",
    part2: "CLASS 9 · PART 2",
    enrichment: "ENRICHMENT",
  };
  return labels[stage] || "LESSON";
}

function resourcesSectionHtml(chapter) {
  const links = RESOURCE_SUFFIXES.map((suffix) => {
    const targetSlug = chapter.slug + suffix;
    const exists = chapters.some((entry) => entry.slug === targetSlug);
    if (!exists) return null;
    return { slug: targetSlug, label: RESOURCE_LABELS[suffix], locked: suffix === "-answer-key" };
  }).filter(Boolean);

  if (links.length === 0) return "";

  const items = links
    .map(
      ({ slug, label, locked }) =>
        `<li><a class="resource-link${locked ? " resource-locked" : ""}" href="./reader.html?ch=${encodeURIComponent(
          slug
        )}">${label}${locked ? ' <span class="resource-lock">(parent only)</span>' : ""} →</a></li>`
    )
    .join("");

  return `
<section class="lesson-resources">
  <p class="eyebrow">End of lesson</p>
  <h2>Practise and check your work</h2>
  <ul class="lesson-resources-list">
    ${items}
  </ul>
  <p class="lesson-resources-note">
    Example and application questions are on separate pages from their solutions. The practice questions
    have no answers shown — after your child attempts them, unlock the parent answer key to check the work
    and explain any mistakes using the full solution method.
  </p>
</section>
`;
}

function renderPage(animate = true, direction = 1) {
  if (pages.length === 0) return;
  const previous = pages[current];
  current = Math.max(0, Math.min(current, pages.length - 1));
  if (bookMode) current = Math.floor(current / 2) * 2;
  const entry = pages[current];
  const right = bookMode ? pages[current + 1] || null : null;

  pages.forEach((page) =>
    page.page.classList.remove(
      "is-current",
      "is-under",
      "is-turning",
      "is-returning",
      "is-spread-left",
      "is-spread-right"
    )
  );

  if (bookMode) {
    entry.page.classList.add("is-spread-left");
    if (right) right.page.classList.add("is-spread-right");
    turning = false;
  } else if (animate && previous && previous !== entry) {
    if (direction > 0) {
      entry.page.classList.add("is-under");
      previous.page.classList.add("is-current", "is-turning");
      turning = true;
      setTimeout(() => {
        previous.page.classList.remove("is-current", "is-turning");
        entry.page.classList.remove("is-under");
        entry.page.classList.add("is-current");
        turning = false;
      }, 300);
    } else {
      previous.page.classList.add("is-under");
      entry.page.classList.add("is-current", "is-returning");
      turning = true;
      setTimeout(() => {
        previous.page.classList.remove("is-under");
        entry.page.classList.remove("is-returning");
        turning = false;
      }, 260);
    }
  } else {
    entry.page.classList.add("is-current");
  }

  const total = pages.length;
  const lastVisible = right ? current + 1 : current;
  pageLabel.textContent = right
    ? `Pages ${current + 1}–${lastVisible + 1} of ${total}`
    : `Page ${current + 1} of ${total}`;
  progressFill.style.width = `${((lastVisible + 1) / total) * 100}%`;
  prevButton.disabled = current === 0;
  nextButton.disabled = lastVisible >= total - 1;

  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => setLessonPage(chapter.slug, current + 1), 350);

  if (lastVisible === total - 1) {
    showToast("Last page · tap Mark complete when ready");
  }
}

function buildToc() {
  tocList.innerHTML = "";
  const seen = new Set();

  pages.forEach((entry, index) => {
    entry.page.querySelectorAll("h2").forEach((heading) => {
      const text = heading.textContent.trim();
      if (!text || seen.has(text)) return;
      seen.add(text);
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `<span>${text}</span><span class="reader-toc-page">${index + 1}</span>`;
      button.addEventListener("click", () => {
        closeToc();
        goTo(index, index > current ? 1 : -1);
      });
      item.appendChild(button);
      tocList.appendChild(item);
    });
  });

  if (!tocList.children.length) {
    tocList.innerHTML = '<li class="reader-toc-empty">This lesson has no section headings.</li>';
  }
}

/* -------------------------------------------------------------- Navigation */

function goTo(index, direction) {
  if (turning) return;
  let target = Math.max(0, Math.min(index, pages.length - 1));
  if (bookMode) target = Math.floor(target / 2) * 2;
  if (target === current) return;
  const dir = direction ?? (target > current ? 1 : -1);
  current = target;
  renderPage(true, dir);
}

function nextPage() {
  const step = bookMode ? 2 : 1;
  if (current + step < pages.length) goTo(current + step, 1);
  else if (current < pages.length - 1) goTo(pages.length - 1, 1);
  else if (isLessonDone(chapter.slug)) goToNextLesson();
  else showToast("Mark the lesson complete, then continue.");
}

function previousPage() {
  const step = bookMode ? 2 : 1;
  if (current - step >= 0) goTo(current - step, -1);
  else if (current > 0) goTo(0, -1);
}

function goToNextLesson() {
  const next = nextChapter(chapter);
  if (next) location.href = `./reader.html?ch=${next.slug}`;
  else location.href = "./index.html";
}

prevButton.addEventListener("click", previousPage);
nextButton.addEventListener("click", nextPage);

viewButton.addEventListener("click", () => {
  const ratio = pages.length > 1 ? current / (pages.length - 1) : 0;
  try {
    localStorage.setItem(VIEW_KEY, bookMode ? "single" : "book");
  } catch {
    /* the view still changes for this visit */
  }
  applyViewMode();
  buildPages();
  let target = Math.round(ratio * Math.max(0, pages.length - 1));
  if (bookMode) target = Math.floor(target / 2) * 2;
  current = Math.max(0, Math.min(target, pages.length - 1));
  renderPage(false);
  setLessonPage(chapter.slug, current + 1);
});

document.addEventListener("keydown", (event) => {
  if (event.target.closest("input, textarea, select")) return;
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    nextPage();
  } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    previousPage();
  } else if (event.key === "Home") {
    goTo(0, -1);
  } else if (event.key === "End") {
    goTo(pages.length - 1, 1);
  } else if (event.key === "Escape") {
    closeToc();
  }
});

// Tap the outer thirds of the page to turn it. Links and buttons still work.
stage.addEventListener("click", (event) => {
  if (event.target.closest("a, button, input, textarea, select")) return;
  if (window.getSelection()?.toString()) return;
  const rect = stage.getBoundingClientRect();
  const x = event.clientX - rect.left;
  if (x < rect.width * 0.18) previousPage();
  else if (x > rect.width * 0.82) nextPage();
});

// Swipe left/right.
let pointerStart = null;
stage.addEventListener("pointerdown", (event) => {
  if (event.target.closest("a, button")) return;
  pointerStart = { x: event.clientX, y: event.clientY };
});
stage.addEventListener("pointerup", (event) => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    if (dx < 0) nextPage();
    else previousPage();
  }
});

/* -------------------------------------------------------- Practice overlay */

function createPracticeOverlay() {
  if (practiceOverlay) return;

  const overlay = document.createElement("div");
  overlay.id = "practice-overlay";
  overlay.className = "practice-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="practice-card">
      <div class="practice-header">
        <div>
          <p class="eyebrow">PRACTICE</p>
          <h2 id="practice-concept-title">Practice Questions</h2>
          <p id="practice-instruction" class="quiz-instruction"></p>
        </div>
        <button id="practice-close" class="quiet-button" type="button">Close</button>
      </div>

      <div id="practice-expression" class="quiz-expression"></div>

      <div id="practice-step-container" class="quiz-answer-area"></div>
      <input id="practice-answer" type="text" class="quiz-answer-input" spellcheck="false" autocomplete="off" placeholder="Your answer" />

      <div id="practice-hint" class="quiz-feedback"></div>
      <div id="practice-result" class="quiz-feedback"></div>

      <div class="quiz-actions">
        <button id="practice-submit" class="primary-button" type="button">Check answer</button>
        <button id="practice-next" class="quiet-button" type="button" hidden>Next question</button>
        <button id="practice-retry" class="quiet-button" type="button" hidden>Try again</button>
        <button id="practice-mastery" class="quiet-button" type="button" hidden>Take mastery check</button>
      </div>

      <div id="practice-progress" class="plan-progress"></div>
    </div>
  `;

  shell.appendChild(overlay);

  practiceOverlay = overlay;
  practiceQuestionEl = overlay.querySelector("#practice-concept-title");
  practiceInstructionEl = overlay.querySelector("#practice-instruction");
  practiceExpressionEl = overlay.querySelector("#practice-expression");
  practiceAnswerInput = overlay.querySelector("#practice-answer");
  practiceStepInputs = overlay.querySelector("#practice-step-container");
  practiceFeedbackEl = overlay.querySelector("#practice-hint");
  practiceResultEl = overlay.querySelector("#practice-result");
  practiceSubmitBtn = overlay.querySelector("#practice-submit");
  practiceNextBtn = overlay.querySelector("#practice-next");
  practiceRetryBtn = overlay.querySelector("#practice-retry");
  practiceMasteryBtn = overlay.querySelector("#practice-mastery");
  practiceCloseBtn = overlay.querySelector("#practice-close");
  practiceProgressEl = overlay.querySelector("#practice-progress");

  practiceCloseBtn.addEventListener("click", closePractice);
  practiceSubmitBtn.addEventListener("click", submitPracticeAnswer);
  practiceNextBtn.addEventListener("click", nextPracticeQuestion);
  practiceRetryBtn.addEventListener("click", retryPracticeQuestion);
  practiceMasteryBtn.addEventListener("click", takeMasteryCheck);
  practiceAnswerInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") submitPracticeAnswer();
  });
}

function openPractice(conceptId) {
  createPracticeOverlay();
  practiceConceptId = conceptId;
  practiceQuestions = getQuestionsForConcept(conceptId);
  practiceCurrentIndex = 0;
  practiceResults = [];

  if (practiceQuestions.length === 0) {
    showToast("No practice questions available for this topic.");
    return;
  }

  practiceOverlay.hidden = false;
  emitPracticeStarted(conceptId, practiceQuestions.length);
  showPracticeQuestion();
}

function resetPracticeIntervention() {
  practiceInterventionActive = false;
  practiceInterventionQuestions = [];
  practiceInterventionIndex = 0;
  practiceOriginalQuestionIndex = 0;

  if (practiceInterventionTimer) {
    clearTimeout(practiceInterventionTimer);
    practiceInterventionTimer = null;
  }
}

function resetPracticeQueue() {
  practiceFlowGeneration += 1;
  if (practicePendingTimer) {
    clearTimeout(practicePendingTimer);
    practicePendingTimer = null;
  }
  practiceConceptQueue = [];
  practicePendingConcept = null;
}

function closePractice() {
  practiceOverlay.hidden = true;
  practiceActive = false;
  resetPracticeIntervention();
  practiceInterventionShown.clear();
  resetPracticeQueue();
}

/* ------------------------------------------------------------ Memory Journey */

let memoryJourneyOverlay = null;
let memoryConceptTitleEl = null;
let memoryElementTitleEl = null;
let memoryExpressionEl = null;
let memoryRecallWrapEl = null;
let memoryRecallPromptEl = null;
let memoryRecallAnswerInputEl = null;
let memoryRecallRevealBtnEl = null;
let memoryRecallAnswerDisplayEl = null;
let memoryNextBtnEl = null;
let memoryCloseBtnEl = null;
let memoryProgressEl = null;

/* Memory Journey stats tracking (for pilot instrumentation) */
let memoryJourneyStats = {
  elementCount: 0,
  elementsViewed: 0,
  recallsShown: 0,
  revealsUsed: 0,
  completed: false,
};

let memoryJourneyConceptId = null;

function createMemoryJourneyOverlay() {
  if (memoryJourneyOverlay) return;

  const overlay = document.createElement("div");
  overlay.id = "memory-journey-overlay";
  overlay.className = "memory-journey-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="memory-card">
      <div class="memory-header">
        <div>
          <p class="eyebrow">MEMORY JOURNEY</p>
          <h2 id="memory-concept-title">Remember what you learned</h2>
          <p id="memory-element-title" class="memory-element-title"></p>
        </div>
        <button id="memory-close" class="quiet-button" type="button">Close</button>
      </div>

      <div id="memory-expression" class="memory-expression"></div>

      <div id="memory-recall-wrap" class="memory-recall-wrap" hidden>
        <p id="memory-recall-prompt" class="memory-recall-prompt"></p>
        <input id="memory-recall-answer" type="text" class="memory-recall-input" spellcheck="false" autocomplete="off" placeholder="Type your answer..." />
        <button id="memory-recall-reveal" class="quiet-button" type="button">Reveal answer</button>
        <div id="memory-recall-answer-display" class="memory-recall-answer-display" hidden></div>
      </div>

      <div id="memory-actions" class="quiz-actions">
        <button id="memory-next" class="primary-button" type="button">Next</button>
      </div>

      <div id="memory-progress" class="plan-progress"></div>
    </div>
  `;

  shell.appendChild(overlay);

  memoryJourneyOverlay = overlay;
  memoryConceptTitleEl = overlay.querySelector("#memory-concept-title");
  memoryElementTitleEl = overlay.querySelector("#memory-element-title");
  memoryExpressionEl = overlay.querySelector("#memory-expression");
  memoryRecallWrapEl = overlay.querySelector("#memory-recall-wrap");
  memoryRecallPromptEl = overlay.querySelector("#memory-recall-prompt");
  memoryRecallAnswerInputEl = overlay.querySelector("#memory-recall-answer");
  memoryRecallRevealBtnEl = overlay.querySelector("#memory-recall-reveal");
  memoryRecallAnswerDisplayEl = overlay.querySelector("#memory-recall-answer-display");
  memoryNextBtnEl = overlay.querySelector("#memory-next");
  memoryCloseBtnEl = overlay.querySelector("#memory-close");
  memoryProgressEl = overlay.querySelector("#memory-progress");

  memoryCloseBtnEl.addEventListener("click", closeMemoryJourney);
  memoryNextBtnEl.addEventListener("click", nextMemoryElement);
  memoryRecallRevealBtnEl.addEventListener("click", revealRecallAnswer);
  memoryRecallAnswerInputEl.addEventListener("keypress", (event) => {
    if (event.key === "Enter") revealRecallAnswer();
  });
}

function openMemoryJourney(conceptId) {
  createMemoryJourneyOverlay();
  const journey = getMemoryJourney(conceptId);
  if (!journey || !journey.elements || journey.elements.length === 0) {
    return;
  }

  memoryJourneyElements = journey.elements;
  memoryJourneyIndex = 0;
  memoryJourneyActive = true;

  memoryJourneyStats = {
    elementCount: journey.elements.length,
    elementsViewed: 0,
    recallsShown: 0,
    revealsUsed: 0,
    completed: false,
  };

  memoryJourneyConceptId = conceptId;

  emitMemoryJourneyStarted(conceptId, journey.elements.length);

  const chapter = chapterById(conceptId) || chapters.find((c) => c.slug === conceptId);
  if (chapter) {
    memoryConceptTitleEl.textContent = chapter.title;
  } else {
    memoryConceptTitleEl.textContent = "Remember what you learned";
  }

  memoryJourneyOverlay.hidden = false;
  showMemoryElement(0);
}

function showMemoryElement(index) {
  if (index < 0 || index >= memoryJourneyElements.length) {
    closeMemoryJourney();
    return;
  }

  const element = memoryJourneyElements[index];
  memoryJourneyIndex = index;

  memoryJourneyStats.elementsViewed += 1;

  if (element.recallPrompt) {
    memoryJourneyStats.recallsShown += 1;
    emitMemoryRecallShown(memoryJourneyConceptId, index, element.type, true);
  }

  memoryElementTitleEl.textContent = element.title || "";
  memoryExpressionEl.innerHTML = element.content || "";

  memoryRecallWrapEl.hidden = true;
  memoryRecallAnswerInputEl.value = "";
  memoryRecallAnswerDisplayEl.hidden = true;
  memoryRecallRevealBtnEl.hidden = false;

  if (element.recallPrompt) {
    memoryRecallWrapEl.hidden = false;
    memoryRecallPromptEl.textContent = element.recallPrompt;
  }

  const current = index + 1;
  const total = memoryJourneyElements.length;
  memoryProgressEl.textContent = `Remember ${current} of ${total}`;

  memoryNextBtnEl.textContent = index === total - 1 ? "Finish" : "Next";
}

function revealRecallAnswer() {
  if (!memoryRecallAnswerDisplayEl.hidden) return;

  const element = memoryJourneyElements[memoryJourneyIndex];
  if (element.recallAnswer) {
    memoryRecallAnswerDisplayEl.hidden = false;
    memoryRecallAnswerDisplayEl.innerHTML = `<p><strong>Remember:</strong> ${element.recallAnswer}</p>`;
  }
  memoryRecallRevealBtnEl.hidden = true;
  memoryRecallAnswerInputEl.disabled = true;

  memoryJourneyStats.revealsUsed += 1;
  emitMemoryRevealUsed(memoryJourneyConceptId, memoryJourneyIndex, element.type);
}

function nextMemoryElement() {
  showMemoryElement(memoryJourneyIndex + 1);
}

function closeMemoryJourney() {
  memoryJourneyOverlay.hidden = true;
  memoryJourneyActive = false;

  const wasCompleted =
    memoryJourneyIndex === memoryJourneyElements.length - 1;

  if (wasCompleted) {
    memoryJourneyStats.completed = true;
    emitMemoryJourneyCompleted(
      memoryJourneyConceptId,
      memoryJourneyStats.elementsViewed,
      memoryJourneyStats.recallsShown,
      memoryJourneyStats.revealsUsed
    );
  } else {
    emitMemoryJourneyExited(
      memoryJourneyConceptId,
      memoryJourneyIndex,
      memoryJourneyStats.elementsViewed,
      memoryJourneyStats.recallsShown,
      memoryJourneyStats.revealsUsed
    );
  }

  memoryJourneyElements = [];
  memoryJourneyIndex = 0;
  memoryJourneyConceptId = null;
  memoryJourneyStats = {
    elementCount: 0,
    elementsViewed: 0,
    recallsShown: 0,
    revealsUsed: 0,
    completed: false,
  };

  // Open any concept session that was deferred while Memory Journey was active.
  if (practicePendingConcept) {
    const pending = practicePendingConcept;
    const generation = practiceFlowGeneration;
    practicePendingConcept = null;
    const timerId = setTimeout(() => {
      if (generation !== practiceFlowGeneration) return;
      if (practicePendingTimer !== timerId) return;
      openPractice(pending);
      practicePendingTimer = null;
    }, 700);
    practicePendingTimer = timerId;
  }
}


function showPracticeQuestion() {
  const question = practiceQuestions[practiceCurrentIndex];
  if (!question) {
    finishPractice();
    return;
  }

  practiceProgressEl.textContent = `Question ${practiceCurrentIndex + 1} of ${practiceQuestions.length}`;
  practiceQuestionEl.textContent = question.text;
  practiceInstructionEl.textContent = question.instruction;

  renderMath(practiceExpressionEl, question.text);

  practiceStepInputs.innerHTML = "";
  practiceAnswerInput.value = "";
  practiceFeedbackEl.textContent = "";
  practiceResultEl.textContent = "";
  practiceResultEl.className = "quiz-feedback";

  if (question.type === "step-by-step" && question.steps.length > 0) {
    practiceAnswerInput.hidden = true;
    practiceStepInputs.hidden = false;
    question.steps.forEach((s, idx) => {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "quiz-answer-input";
      input.placeholder = `Step ${s.step}`;
      input.dataset.step = s.step;
      practiceStepInputs.appendChild(input);
    });
  } else {
    practiceAnswerInput.hidden = false;
    practiceStepInputs.hidden = true;
    practiceAnswerInput.focus();
  }

  practiceSubmitBtn.hidden = false;
  practiceNextBtn.hidden = true;
  practiceRetryBtn.hidden = true;
  practiceMasteryBtn.hidden = true;
}

function getStepAnswers() {
  const inputs = practiceStepInputs.querySelectorAll("input");
  return Array.from(inputs).map((input) => input.value.trim());
}

function submitPracticeAnswer() {
  const question = practiceQuestions[practiceCurrentIndex];
  if (!question) return;

  let studentAnswer;
  if (question.type === "step-by-step") {
    studentAnswer = getStepAnswers();
  } else {
    studentAnswer = practiceAnswerInput.value.trim();
  }

  if (!studentAnswer || (Array.isArray(studentAnswer) && studentAnswer.every((a) => !a))) {
    showToast("Please enter an answer first.");
    return;
  }

  // If we're in the middle of a misconception intervention, handle this
  // as a corrective answer rather than a new practice attempt.
  // Corrective questions do NOT call recordPracticeAttempt and do not
  // affect the learner's practice accuracy or mastery assessment.
  if (practiceInterventionActive) {
    handleCorrectiveAnswer(studentAnswer);
    return;
  }

  const result = recordPracticeAttempt(question.id, studentAnswer);
  practiceResults.push({ questionId: question.id, ...result });
  emitPracticeAnswered(question.id, result.isCorrect, result.errorCategory, practiceConceptId);

  // Record mistake if incorrect
  if (!result.isCorrect) {
    recordMistake(
      question.id,
      studentAnswer,
      question.correctAnswer,
      result.errorCategory || ERROR_CATEGORIES.conceptual,
      result.errorMessage,
      result.firstWrongStep,
      0
    );
  }

  practiceAnswerInput.disabled = true;
  practiceSubmitBtn.hidden = true;

  if (result.isCorrect) {
    practiceResultEl.textContent = "Correct! Well done.";
    practiceResultEl.className = "quiz-feedback";
    practiceResultEl.style.color = "var(--green)";
    practiceFeedbackEl.textContent = "";
    practiceNextBtn.hidden = false;
  } else {
    // Check for a known misconception before showing generic feedback.
    // Only trigger a targeted intervention when the mistake can be
    // confidently matched to a defined misconception.
    const misconception = matchMisconception(practiceConceptId, {
      errorCategory: result.errorCategory || ERROR_CATEGORIES.conceptual,
      studentAnswer,
      firstWrongStep: result.firstWrongStep,
    });

    if (
      misconception &&
      misconception.correctiveQuestions &&
      misconception.correctiveQuestions.length > 0 &&
      !practiceInterventionShown.has(`${practiceConceptId}|${misconception.description}`)
    ) {
      startMisconceptionIntervention(misconception, practiceCurrentIndex);
    } else {
      practiceResultEl.textContent = "Not quite right. Let's look at why.";
      practiceResultEl.className = "quiz-feedback";
      practiceResultEl.style.color = "var(--rose)";
      practiceFeedbackEl.textContent = result.errorMessage || "Check your answer and try again.";
      practiceRetryBtn.hidden = false;

      if (result.firstWrongStep) {
        practiceFeedbackEl.textContent += ` Step ${result.firstWrongStep.stepNumber}: ${result.firstWrongStep.explanation}`;
      }
    }
  }

  updatePracticeProgress();
}

function retryPracticeQuestion() {
  // If in a misconception intervention, retry the current corrective question.
  if (practiceInterventionActive) {
    practiceAnswerInput.disabled = false;
    practiceAnswerInput.value = "";
    practiceResultEl.textContent = "";
    practiceFeedbackEl.textContent = "";
    practiceRetryBtn.hidden = true;
    practiceSubmitBtn.hidden = false;
    practiceAnswerInput.focus();
    return;
  }

  const question = practiceQuestions[practiceCurrentIndex];
  if (!question) return;

  practiceAnswerInput.disabled = false;
  practiceAnswerInput.value = "";
  practiceResultEl.textContent = "";
  practiceFeedbackEl.textContent = "";
  practiceRetryBtn.hidden = true;
  practiceSubmitBtn.hidden = false;

  if (question.type === "step-by-step") {
    const inputs = practiceStepInputs.querySelectorAll("input");
    inputs.forEach((input) => (input.value = ""));
  }

  practiceAnswerInput.focus();
}

/* ------------------------------------------------------------ Misconception intervention */

/**
 * Start a targeted misconception intervention.
 * Shows the misconception explanation and corrective questions.
 * @param {Object} misconception - Matched misconception data
 * @param {number} originalQuestionIndex - Practice question index to return to
 */
function startMisconceptionIntervention(misconception, originalQuestionIndex) {
  practiceInterventionActive = true;
  practiceInterventionShown.set(`${practiceConceptId}|${misconception.description}`, true);
  practiceInterventionQuestions = [...(misconception.correctiveQuestions || [])];
  practiceInterventionIndex = 0;
  practiceOriginalQuestionIndex = originalQuestionIndex;

  emitMisconceptionInterventionShown(
    practiceConceptId,
    misconception.description,
    originalQuestionIndex
  );

  // Hide practice question controls, show intervention content
  practiceAnswerInput.hidden = true;
  practiceStepInputs.hidden = true;
  practiceSubmitBtn.hidden = true;
  practiceRetryBtn.hidden = true;
  practiceNextBtn.hidden = true;

  // Render the intervention block into the feedback area
  practiceFeedbackEl.innerHTML = "";
  const container = document.createElement("div");
  renderMisconceptionIntervention(container, misconception, practiceInterventionQuestions);
  practiceFeedbackEl.appendChild(container);

  practiceResultEl.textContent = "Let's look at this more closely.";
  practiceResultEl.className = "quiz-feedback";
  practiceResultEl.style.color = "var(--amber)";

  // Show the first corrective question
  showCorrectiveQuestion();
}

/**
 * Display the current corrective question.
 */
function showCorrectiveQuestion() {
  const questionId = practiceInterventionQuestions[practiceInterventionIndex];
  if (!questionId) {
    endMisconceptionIntervention();
    return;
  }

  const question = getQuestion(questionId);
  if (!question) {
    endMisconceptionIntervention();
    return;
  }

  practiceProgressEl.textContent = `Practice ${practiceInterventionIndex + 1} of ${practiceInterventionQuestions.length}`;
  practiceQuestionEl.textContent = question.text;
  practiceInstructionEl.textContent = question.instruction;

  renderMath(practiceExpressionEl, question.text);

  practiceStepInputs.innerHTML = "";
  practiceAnswerInput.value = "";
  practiceAnswerInput.hidden = false;
  practiceAnswerInput.disabled = false;
  practiceStepInputs.hidden = true;
  practiceResultEl.textContent = "";

  if (question.type === "step-by-step" && question.steps.length > 0) {
    practiceAnswerInput.hidden = true;
    practiceStepInputs.hidden = false;
    question.steps.forEach((s, idx) => {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "quiz-answer-input";
      practiceStepInputs.appendChild(input);
    });
  }

  practiceAnswerInput.focus();
}

/**
 * Handle an answer submitted during a misconception intervention.
 * Corrective questions do NOT call recordPracticeAttempt — they must not
 * affect mastery state or the original practice results.
 * @param {string|string[]} studentAnswer
 */
function handleCorrectiveAnswer(studentAnswer) {
  const questionId = practiceInterventionQuestions[practiceInterventionIndex];
  const question = getQuestion(questionId);
  if (!question) {
    endMisconceptionIntervention();
    return;
  }

  const isCorrect = answersEquivalent(studentAnswer, question.correctAnswer);

  if (isCorrect) {
    practiceResultEl.textContent = "Correct! You've got it.";
    practiceResultEl.className = "quiz-feedback";
    practiceResultEl.style.color = "var(--green)";
    practiceFeedbackEl.textContent = "";

    // Move to next corrective question or end intervention
    practiceInterventionIndex += 1;
    if (practiceInterventionIndex >= practiceInterventionQuestions.length) {
      // Small delay then return to original practice question
      practiceInterventionTimer = setTimeout(() => {
        practiceInterventionTimer = null;
        endMisconceptionIntervention();
      }, 1200);
    } else {
      practiceNextBtn.hidden = false;
    }
  } else {
    practiceResultEl.textContent = "Not quite right. Try again.";
    practiceResultEl.className = "quiz-feedback";
    practiceResultEl.style.color = "var(--rose)";
    const errorMessage = question.errorTypes?.conceptual || "Check your answer and try again.";
    practiceFeedbackEl.textContent = errorMessage;
    practiceRetryBtn.hidden = false;
  }

  updatePracticeProgress();
}

/**
 * End the misconception intervention and return to the original practice question.
 */
function endMisconceptionIntervention() {
  if (practiceInterventionTimer) {
    clearTimeout(practiceInterventionTimer);
    practiceInterventionTimer = null;
  }
  practiceInterventionActive = false;
  emitMisconceptionInterventionCompleted(
    practiceConceptId,
    practiceInterventionQuestions.length
  );
  practiceInterventionQuestions = [];
  practiceInterventionIndex = 0;

  practiceAnswerInput.hidden = false;
  practiceStepInputs.hidden = true;
  practiceSubmitBtn.hidden = false;
  practiceRetryBtn.hidden = true;
  practiceNextBtn.hidden = true;

  practiceResultEl.textContent = "";
  practiceFeedbackEl.textContent = "";

  // Return to the original practice question
  practiceCurrentIndex = practiceOriginalQuestionIndex;
  showPracticeQuestion();
}

function nextPracticeQuestion() {
  if (practiceInterventionActive) {
    showCorrectiveQuestion();
    return;
  }
  practiceCurrentIndex += 1;
  showPracticeQuestion();
}

function finishPractice() {
  practiceOverlay.hidden = true;

  // Reset intervention dedup for the next practice session.
  practiceInterventionShown.clear();

  const correctCount = practiceResults.filter((r) => r.isCorrect).length;
  const total = practiceResults.length;
  const accuracy = total > 0 ? correctCount / total : 0;

  emitPracticeCompleted(
    practiceConceptId,
    accuracy,
    total,
    practiceConceptId && accuracy >= MASTERY_THRESHOLD,
    null
  );

  showToast(`Practice complete: ${correctCount} of ${total} correct.`);

  // Check if concept can be mastered
  if (practiceConceptId && accuracy >= MASTERY_THRESHOLD) {
    const masteryResult = assessMastery(practiceConceptId, practiceResults);
    emitMasteryAssessed(
      practiceConceptId,
      masteryResult.passed,
      masteryResult.accuracy,
      MASTERY_THRESHOLD
    );
    if (masteryResult.passed) {
      showToast("Concept mastered! Excellent work.");
    }
  }

  // Refresh the reader view to show updated mastery state
  syncCompleteButton();

  // Offer the Memory Journey after practice completes.
  if (practiceConceptId && hasMemoryJourney(practiceConceptId)) {
    openMemoryJourney(practiceConceptId);
  }

  // Open the next queued concept session, if any. Defer if Memory Journey
  // is active so the two overlays do not compete.
  const nextConcept = practiceConceptQueue.shift();
  if (nextConcept) {
    practicePendingConcept = nextConcept;
    if (!memoryJourneyActive) {
      const generation = practiceFlowGeneration;
      const timerId = setTimeout(() => {
        if (generation !== practiceFlowGeneration) return;
        if (practicePendingTimer !== timerId) return;
        openPractice(practicePendingConcept);
        practicePendingConcept = null;
        practicePendingTimer = null;
      }, 700);
      practicePendingTimer = timerId;
    }
  }
}

function takeMasteryCheck() {
  const masteryQuestions = getConfirmationQuestions(practiceConceptId);
  if (masteryQuestions.length === 0) {
    showToast("No mastery questions available for this topic.");
    return;
  }

  practiceQuestions = masteryQuestions;
  practiceCurrentIndex = 0;
  practiceResults = [];
  showPracticeQuestion();
}

function renderMath(element, text) {
  if (!text || !text.trim()) {
    element.textContent = "";
    return;
  }
  const trimmed = text.trim();
  if (trimmed.startsWith("$")) {
    const latex = trimmed.replace(/^\$(.+)\$$/s, "$1");
    element.innerHTML = katex.renderToString(latex, { throwOnError: false, trust: false });
  } else {
    element.textContent = trimmed;
  }
}

function updatePracticeProgress() {
  const answered = practiceResults.length;
  const total = practiceQuestions.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  practiceProgressEl.textContent = `Progress: ${answered} of ${total} (${pct}%)`;
}

/* -------------------------------------------------------- Complete / menu */

function syncCompleteButton() {
  const done = isLessonDone(chapter.slug);
  completeButton.textContent = done ? "Completed ✓" : "Mark complete";
  completeButton.classList.toggle("is-done", done);
  completeButton.setAttribute("aria-pressed", String(done));
}

completeButton.addEventListener("click", () => {
  const done = isLessonDone(chapter.slug);
  if (done) {
    // Already completed — offer mastery check
    const mastery = getMasteryState(chapter.slug);
    if (isMastered(chapter.slug)) {
      showToast("You've mastered this concept!");
    } else if (needsMasteryConfirmation(chapter.slug)) {
      resetPracticeQueue();
      practiceConceptQueue = getAllQuestionConceptIdsForLessonSlug(chapter.slug);
      openPractice(practiceConceptQueue.shift());
    } else {
      showToast("Lesson completed. Practice to build mastery.");
    }
    return;
  }

  markLessonDone(chapter.slug, !done);
  syncCompleteButton();
  if (!done) {
    showToast("Lesson complete — well done.");
    // Mark matching plan task(s) complete as the lesson is finished.
    for (const conceptId of conceptIdsForLessonSlug(chapter.slug)) {
      markPlanTaskComplete(conceptId, true);
    }
    // Offer practice questions to build mastery
    const practiceConcepts = getAllQuestionConceptIdsForLessonSlug(chapter.slug);
    const questions = getAllQuestionsForLessonSlug(chapter.slug);
    if (questions && questions.length > 0) {
      resetPracticeQueue();
      practiceConceptQueue = practiceConcepts;
      const generation = practiceFlowGeneration;
      const timerId = setTimeout(() => {
        if (generation !== practiceFlowGeneration) return;
        if (practicePendingTimer !== timerId) return;
        openPractice(practiceConceptQueue.shift());
        practicePendingTimer = null;
      }, 700);
      practicePendingTimer = timerId;
    } else {
      setTimeout(() => {
        if (current === pages.length - 1) goToNextLesson();
      }, 700);
    }
  }
});

nextLessonLink.addEventListener("click", (event) => {
  event.preventDefault();
  goToNextLesson();
});

function openToc() {
  tocPanel.hidden = false;
  document.body.classList.add("toc-open");
}
function closeToc() {
  tocPanel.hidden = true;
  document.body.classList.remove("toc-open");
}
document.querySelector("#reader-toc-button").addEventListener("click", openToc);
tocPanel.querySelectorAll("[data-toc-close]").forEach((element) =>
  element.addEventListener("click", closeToc)
);

/* ---------------------------------------------------------------- Resizing */

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const ratio = pages.length > 1 ? current / (pages.length - 1) : 0;
    const savedPage = current;
    buildPages();
    current = Math.round(ratio * Math.max(0, pages.length - 1));
    if (bookMode) current = Math.floor(current / 2) * 2;
    current = Math.max(0, Math.min(current, pages.length - 1));
    renderPage(false);
    setLessonPage(chapter.slug, current + 1);
    void savedPage;
  }, 280);
});

/* ------------------------------------------------------------------- Boot */

async function boot() {
  titleEl.textContent = chapter.title;
  kickerEl.textContent = stageKicker();
  document.title = `${chapter.title} · MathsFunda`;

  const weightageEl = document.getElementById("reader-weightage");
  if (weightageEl) {
    if (chapter.unitMarks !== null) {
      weightageEl.textContent = `${chapter.unitMarks} marks · ${chapter.unit
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")}`;
      weightageEl.className = `reader-weightage w-${chapter.weightageColor}`;
      weightageEl.hidden = false;
    } else {
      weightageEl.hidden = true;
    }
  }

  const next = nextChapter(chapter);
  nextLessonLink.textContent = next ? `Next: ${next.title} →` : "Back to the study home →";

  // Track the topic in the flashcard link.
  const deckLink = {
    "foundation-1-numbers-and-signs": "f1-numbers",
    "foundation-2-fractions-decimals-percentages": "f2-fractions",
    "foundation-3-ratio-and-proportion": "f3-ratio",
    "foundation-4-powers-and-roots": "f4-powers",
    "foundation-5-basic-algebra": "f5-algebra",
    "foundation-6-algebraic-operations": "f6-identities",
    "foundation-7-geometry-vocabulary": "f7-geometry",
    "foundation-8-measurement-and-units": "f8-measurement",
    "number-systems": "c9-number-systems",
    polynomials: "c9-polynomials",
    "geometry-basics": "c9-geometry",
     "linear-equations": "c9-linear-equations",
     "surface-area-volume": "c9-surface-area-volume",
     "quadrilaterals": "c9-quadrilaterals",
    "linear-inequalities": "c9-inequalities",
  }[chapter.slug];
  if (deckLink) tocFlashcards.href = `./flashcards.html?deck=${deckLink}`;
  tocEdit.href = `./studio.html?ch=${encodeURIComponent(chapter.slug)}`;
  const exportLink = document.querySelector("#reader-export-link");
  if (exportLink) exportLink.href = `./studio.html?ch=${encodeURIComponent(chapter.slug)}`;

  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore font loading errors */
    }
  }

  // Parent gate: answer key chapters are locked unless the parent unlocks them.
  if (chapter.slug.endsWith("-answer-key") && !parentUnlocked && !isParentUnlocked()) {
    parentUnlocked = false;
    showParentGate();
    return;
  }

  if (chapter.slug.endsWith("-answer-key")) {
    parentUnlocked = true;
    addLockButton();
  }

  emitLessonStarted(chapter.slug);

  buildPages();
  syncCompleteButton();
  setLessonPage(chapter.slug, current + 1);

  // Orientation bar: You are here
  const orient = orientation();
  const elDay = document.querySelector("#orient-day");
  const elPhase = document.querySelector("#orient-phase");
  const elConcept = document.querySelector("#orient-concept");
  const elActivity = document.querySelector("#orient-activity");
  if (elDay) elDay.textContent = String(orient.day);
  if (elPhase) elPhase.textContent = orient.phase;
  if (elConcept) elConcept.textContent = orient.conceptTitle;
  if (elActivity) elActivity.textContent = orient.activityLabel;

  // What happens next (single next step in footer)
  const nextStepEl = document.querySelector("#reader-next-step");
  const lessonComplete = isLessonDone(chapter.slug);
  const nextStepResult = nextStep({ onReader: true, lessonComplete });
  const after = afterThis({ onReader: true, lessonComplete, practised: false });
  if (nextStepEl) {
    if (nextStepResult.kind === "done") {
      nextStepEl.innerHTML = `<span class="reader-footer-next"><strong>You're done for today.</strong> Come back tomorrow.</span>`;
    } else {
      nextStepEl.innerHTML = `<span class="reader-footer-next">Next: <span class="next-link">${after ? after.label : "Practise the idea"}</span></span>`;
    }
  }

  // Mark the neighbouring lesson as "read" for orientation.
  void stageChapters(chapter.stage);

  // Shift any widgets that collide with the reader footer onto the next page.
  if (window.__mfInteractive?.fixOverflowDeferred) {
    window.__mfInteractive.fixOverflowDeferred();
  }
}

boot().catch((error) => {
  console.error("[reader] boot failed", error);
});

window.__mfReaderAPI = {
  buildPages,
  renderPage,
  get currentPage() {
    return current;
  },
  get pages() {
    return pages;
  },
};
