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
} from "./curriculum.js";
import { conceptIdsForLessonSlug, questionConceptIdForLessonSlug } from "./adaptive-plan.js";
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
} from "./content-model.js";
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
  paginateChapter(builder, { title: chapter.title, html: renderMarkdown(chapter.content) }, label);
  pages = builder.pages;

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
  showPracticeQuestion();
}

function closePractice() {
  practiceOverlay.hidden = true;
  practiceActive = false;
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

  const result = recordPracticeAttempt(question.id, studentAnswer);
  practiceResults.push({ questionId: question.id, ...result });

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
    practiceResultEl.textContent = "Not quite right. Let's look at why.";
    practiceResultEl.className = "quiz-feedback";
    practiceResultEl.style.color = "var(--rose)";
    practiceFeedbackEl.textContent = result.errorMessage || "Check your answer and try again.";
    practiceRetryBtn.hidden = false;

    if (result.firstWrongStep) {
      practiceFeedbackEl.textContent += ` Step ${result.firstWrongStep.stepNumber}: ${result.firstWrongStep.explanation}`;
    }
  }

  updatePracticeProgress();
}

function retryPracticeQuestion() {
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

function nextPracticeQuestion() {
  practiceCurrentIndex += 1;
  showPracticeQuestion();
}

function finishPractice() {
  practiceOverlay.hidden = true;

  const correctCount = practiceResults.filter((r) => r.isCorrect).length;
  const total = practiceResults.length;
  const accuracy = total > 0 ? correctCount / total : 0;

  showToast(`Practice complete: ${correctCount} of ${total} correct.`);

  // Check if concept can be mastered
  if (practiceConceptId && accuracy >= MASTERY_THRESHOLD) {
    const masteryResult = assessMastery(practiceConceptId, practiceResults);
    if (masteryResult.passed) {
      showToast("Concept mastered! Excellent work.");
      // Mark matching plan task(s) complete once the concept is mastered.
      for (const conceptId of conceptIdsForLessonSlug(practiceConceptId)) {
        markPlanTaskComplete(conceptId, true);
      }
    }
  }

  // Refresh the reader view to show updated mastery state
  syncCompleteButton();
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
      openPractice(questionConceptIdForLessonSlug(chapter.slug));
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
    const practiceConcept = questionConceptIdForLessonSlug(chapter.slug);
    const questions = getQuestionsForConcept(practiceConcept);
    if (questions && questions.length > 0) {
      setTimeout(() => {
        openPractice(practiceConcept);
      }, 700);
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
    "linear-inequalities": "c9-inequalities",
  }[chapter.slug];
  if (deckLink) tocFlashcards.href = `./flashcards.html?deck=${deckLink}`;
  tocEdit.href = `./studio.html?ch=${encodeURIComponent(chapter.slug)}`;

  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore font loading errors */
    }
  }

  // Parent gate: answer key chapter is locked unless the parent unlocks it.
  if (chapter.slug === "diagnostic-answer-key" && !parentUnlocked && !isParentUnlocked()) {
    parentUnlocked = false;
    showParentGate();
    return;
  }

  if (chapter.slug === "diagnostic-answer-key") {
    parentUnlocked = true;
    addLockButton();
  }

  buildPages();
  syncCompleteButton();
  setLessonPage(chapter.slug, current + 1);

  // Mark the neighbouring lesson as "read" for orientation.
  void stageChapters(chapter.stage);
}

boot();
