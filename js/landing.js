import "katex/dist/katex.min.css";
import {
  STAGES,
  chapters,
  lessonHref,
  nextChapter,
  stageChapters,
  stageHref,
} from "./curriculum.js";
import {
  cardState,
  dueCount,
  isLessonDone,
  lastLesson,
  lessonState,
  nextUnfinished,
  streakDays,
  summary,
} from "./progress.js";
import { allCards, totalCards } from "./flashcard-data.js";
import { formulaOfTheDay, renderInline } from "./formulas.js";
import {
  orientation,
  currentLevel,
  startSession,
  nextStep,
  returnToTodayUrl,
  currentDay,
  currentPhase,
  currentConcept,
  currentActivity,
} from "./orientation.js";
import "../css/site.css";

const allSlugs = chapters.map((chapter) => chapter.slug);

/* ------------------------------------------------------------------ Orientation bar */

const orient = orientation();

const orientDay = document.querySelector("#orient-day");
const orientPhase = document.querySelector("#orient-phase");
const orientConcept = document.querySelector("#orient-concept");
const orientActivity = document.querySelector("#orient-activity");

if (orientDay) orientDay.textContent = String(orient.day);
if (orientPhase) orientPhase.textContent = orient.phase;
if (orientConcept) orientConcept.textContent = orient.conceptTitle;
if (orientActivity) orientActivity.textContent = orient.activityLabel;

/* ------------------------------------------------------------------ Facts */

const overall = summary(allSlugs);
const streak = streakDays();

const factLessonsEl = document.querySelector("#fact-lessons");
const factCardsEl = document.querySelector("#fact-cards");
const factProgressEl = document.querySelector("#fact-progress");
const factStreakEl = document.querySelector("#fact-streak");
if (factLessonsEl) factLessonsEl.textContent = String(chapters.length);
if (factCardsEl) factCardsEl.textContent = String(totalCards());
if (factProgressEl) factProgressEl.textContent = `${overall.percent}%`;
if (factStreakEl) factStreakEl.textContent = String(streak);

const ring = document.querySelector("#overall-ring");
if (ring) ring.style.setProperty("--value", overall.percent);
const overallPercentEl = document.querySelector("#overall-percent");
if (overallPercentEl) overallPercentEl.textContent = `${overall.percent}%`;
const overallTitleEl = document.querySelector("#overall-title");
if (overallTitleEl) overallTitleEl.textContent =
  overall.done === 0 ? "Your course" : overall.done === overall.total ? "Course complete" : "Course in progress";
const overallDetailEl = document.querySelector("#overall-detail");
if (overallDetailEl) overallDetailEl.textContent =
  overall.done === 0
    ? "No lessons completed yet. Start with the roadmap."
    : `${overall.done} of ${overall.total} lessons complete.`;

/* ------------------------------------------------------------- Next step (primary CTA) */

const step = nextStep();

const heroContinue = document.querySelector("#hero-continue");
const navContinue = document.querySelector("#nav-continue");
const todayWhy = document.querySelector("#today-why");
const nextLessonTitle = document.querySelector("#next-lesson-title");
const nextLessonMeta = document.querySelector("#next-lesson-meta");
const nextLessonLink = document.querySelector("#next-lesson-link");

if (heroContinue) {
  heroContinue.textContent = step.label;
  heroContinue.href = step.href;
  heroContinue.className = step.kind === "done" ? "quiet-button" : "primary-button";
  heroContinue.addEventListener("click", (event) => {
    if (step.kind !== "done" && step.href) {
      startSession(
        currentConcept().slug || "",
        lessonState(currentConcept().slug || "").page,
        currentActivity(currentConcept().slug)
      );
    }
  });
}

if (navContinue) {
  navContinue.textContent = step.label.length > 20 ? "Continue today" : step.label;
  navContinue.href = step.href;
}

if (todayWhy) todayWhy.textContent = step.why || "One short lesson, then a few practice questions.";

if (nextLessonTitle) nextLessonTitle.textContent = step.label;
if (nextLessonMeta) nextLessonMeta.textContent = step.why || "";
if (nextLessonLink) nextLessonLink.href = step.href;

/* ------------------------------------------------------------- Resume card */

const resumeSection = document.getElementById("resume");
const resumeLink = document.getElementById("resume-link");
const resumeTitle = document.getElementById("resume-title");
const resumePage = document.getElementById("resume-page");

const last = lastLesson();

if (last && last.slug && !isLessonDone(last.slug)) {
  const chapter = chapters.find((c) => c.slug === last.slug);
  const saved = lessonState(last.slug);
  if (chapter) {
    resumeSection.hidden = false;
    resumeTitle.textContent = chapter.title;
    resumePage.textContent = `Page ${saved.page}`;
    resumeLink.href = lessonHref(last.slug, saved.page);
  }
}

if (last && !isLessonDone(last.slug)) {
  nextSlug = last.slug;
} else {
  nextSlug = nextUnfinished(allSlugs);
}

const nextLesson = chapters.find((chapter) => chapter.slug === nextSlug) || chapters[0];
const nextStage = STAGES.find((stage) => stage.id === nextLesson.stage);

/* ------------------------------------------------------------------- Today */

document.querySelector("#today-date").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const now = Date.now();
const reviewsDue = allCards.filter((card) => {
  const state = cardState(card.id);
  return state.reps > 0 && state.due <= now;
}).length;
const newCards = allCards.filter((card) => cardState(card.id).reps === 0).length;
const totalDue = dueCount(allCardIds());

function allCardIds() {
  return allCards.map((card) => card.id);
}

document.querySelector("#due-cards").textContent = reviewsDue
  ? `${reviewsDue} card${reviewsDue === 1 ? "" : "s"} due`
  : `${newCards} new cards`;
document.querySelector("#today-cards small").textContent = reviewsDue
  ? "Spaced review · about ten minutes"
  : "Pick a deck and start with ten";
document.querySelector("#today-cards").setAttribute(
  "aria-label",
  reviewsDue ? `${reviewsDue} flashcards due for review` : `${newCards} new flashcards available`
);
void totalDue;

/* --------------------------------------------------------- Formula of day */

const formula = formulaOfTheDay(chapters);
const slot = document.querySelector("#formula-of-day");
if (formula) {
  slot.innerHTML = `
    <p class="formula-topic">${formula.chapter.title} · ${formula.heading}</p>
    <p class="formula-label">${renderInline(formula.label)}</p>
    <div class="formula-value">${renderInline(formula.value)}</div>
  `;
} else {
  slot.textContent = "Open the formula vault.";
}

/* --------------------------------------------------------- Stage cards */

const stageCards = document.querySelector("#stage-cards");

STAGES.forEach((stage, index) => {
  const lessons = stageChapters(stage.id);
  const stageProgress = summary(lessons.map((lesson) => lesson.slug));
  const isNext = stage.id === nextLesson.stage;
  const complete = stageProgress.done === stageProgress.total;

  const card = document.createElement("article");
  card.className = `stage-card accent-${stage.accent}${isNext ? " is-next" : ""}${complete ? " is-complete" : ""}`;
  card.innerHTML = `
    <div class="stage-card-top">
      <span class="stage-index">${String(index + 1).padStart(2, "0")}</span>
      ${isNext ? '<span class="stage-badge">Recommended next</span>' : complete ? '<span class="stage-badge is-done">Complete</span>' : ""}
    </div>
    <p class="eyebrow">${stage.kicker}</p>
    <h3><a href="${stageHref(stage.id)}">${stage.title}</a></h3>
    <p class="stage-blurb">${stage.blurb}</p>
    <div class="stage-bar" role="img" aria-label="${stageProgress.percent}% complete">
      <span style="width: ${stageProgress.percent}%"></span>
    </div>
    <div class="stage-foot">
      <span>${stageProgress.done}/${stageProgress.total} lessons</span>
      <a class="stage-link" href="${stageHref(stage.id)}">${complete ? "Review" : isNext ? "Continue" : "Open"} →</a>
    </div>
  `;
  stageCards.appendChild(card);
});

/* ---------------------------------------------- Browse: every lesson */

const stageSections = document.querySelector("#stage-sections");

STAGES.forEach((stage, index) => {
  const lessons = stageChapters(stage.id);
  if (!lessons.length) return;
  const stageProgress = summary(lessons.map((lesson) => lesson.slug));

  const details = document.createElement("details");
  details.className = "browse-group";
  if (index === 0) details.open = true;

  const items = lessons
    .map((lesson) => {
      const done = isLessonDone(lesson.slug);
      const saved = lessonState(lesson.slug);
      return `
        <a class="browse-lesson${done ? " is-done" : ""}" href="${lessonHref(lesson.slug, saved.page)}">
          <span class="browse-check" aria-hidden="true">${done ? "✓" : ""}</span>
          <span class="browse-copy">
            <strong>${lesson.title}</strong>
            <small>${lesson.blurb}</small>
          </span>
          <span class="browse-meta">${lesson.minutes} min</span>
          ${lesson.unitMarks !== null
            ? `<span class="browse-weightage w-${lesson.weightageColor}">${lesson.unitMarks} marks</span>`
            : `<span class="browse-weightage w-slate">—</span>`}
          ${saved.page > 1 && !done
            ? `<span class="browse-resume" title="Resume from page ${saved.page}">↻ p${saved.page}</span>`
            : ""}
        </a>`;
    })
    .join("");

  details.innerHTML = `
    <summary>
      <span class="browse-summary-title">${stage.title}</span>
      <span class="browse-summary-meta">${stageProgress.done}/${stageProgress.total} · ${stage.kicker}</span>
    </summary>
    <div class="browse-lessons">${items}</div>
  `;
  stageSections.appendChild(details);
});

/* Keep the count honest if a chapter is added later. */
void nextChapter;

/* ------------------------------------------------------------------ Diagnostic button */

const diagnosticButton = document.querySelector('a[href="./diagnostic.html"]');
if (diagnosticButton) {
  try {
    const stored = localStorage.getItem("mathfunda-diagnostic-results");
    if (stored) {
      const results = JSON.parse(stored);
      if (Array.isArray(results) && results.length > 0) {
        diagnosticButton.textContent = "Start Study plan";
        diagnosticButton.href = "./study-plan-personalized.html";
        diagnosticButton.className = "primary-button";
      }
    }
  } catch (e) {
    /* storage may be blocked */
  }
}

/* ------------------------------------------------------------------ Upload diagnostic JSON */

const uploadInput = document.querySelector("#diagnostic-upload");
const uploadBtn = document.querySelector("#diagnostic-upload-btn");
if (uploadInput && uploadBtn) {
  uploadBtn.addEventListener("click", () => uploadInput.click());

  uploadInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const results = JSON.parse(reader.result);
        if (Array.isArray(results) && results.length > 0) {
          localStorage.setItem("mathfunda-diagnostic-results", JSON.stringify(results));
          localStorage.setItem("mathfunda-diagnostic-live", JSON.stringify(results));

          if (diagnosticButton) {
            diagnosticButton.textContent = "Start Study plan";
            diagnosticButton.href = "./study-plan-personalized.html";
            diagnosticButton.className = "primary-button";
          }

          uploadInput.value = "";
          alert("Diagnostic results loaded. Click 'Start Study plan' to begin.");
        } else {
          alert("Invalid diagnostic file: expected an array of question results.");
        }
      } catch (err) {
        alert("Failed to read diagnostic file. Please check it is valid JSON.");
      }
    };
    reader.readAsText(file);
  });
}
