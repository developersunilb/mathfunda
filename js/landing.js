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
import "../css/site.css";

const allSlugs = chapters.map((chapter) => chapter.slug);

/* ------------------------------------------------------------------ Facts */

const overall = summary(allSlugs);
const streak = streakDays();

document.querySelector("#fact-lessons").textContent = String(chapters.length);
document.querySelector("#fact-cards").textContent = String(totalCards());
document.querySelector("#fact-progress").textContent = `${overall.percent}%`;
document.querySelector("#fact-streak").textContent = String(streak);

const ring = document.querySelector("#overall-ring");
ring.style.setProperty("--value", overall.percent);
document.querySelector("#overall-percent").textContent = `${overall.percent}%`;
document.querySelector("#overall-title").textContent =
  overall.done === 0 ? "Your course" : overall.done === overall.total ? "Course complete" : "Course in progress";
document.querySelector("#overall-detail").textContent =
  overall.done === 0
    ? "No lessons completed yet. Start with the roadmap."
    : `${overall.done} of ${overall.total} lessons complete.`;

/* ------------------------------------------------------------- Next lesson */

const last = lastLesson();
let nextSlug = null;

if (last && !isLessonDone(last.slug)) {
  nextSlug = last.slug;
} else {
  nextSlug = nextUnfinished(allSlugs);
}

const nextLesson = chapters.find((chapter) => chapter.slug === nextSlug) || chapters[0];
const nextStage = STAGES.find((stage) => stage.id === nextLesson.stage);

document.querySelector("#next-lesson-title").textContent = nextLesson.title;
document.querySelector("#next-lesson-meta").textContent = `${nextLesson.minutes} min · ${nextStage ? nextStage.title : "Lesson"}`;
document.querySelector("#next-lesson-link").href = lessonHref(
  nextLesson.slug,
  lessonState(nextLesson.slug).page
);

document.querySelector("#hero-continue").textContent = overall.done === 0 ? "Start with the roadmap" : `Continue: ${nextLesson.title}`;
document.querySelector("#hero-continue").href = lessonHref(
  nextLesson.slug,
  lessonState(nextLesson.slug).page
);
document.querySelector("#nav-continue").textContent = overall.done === 0 ? "Start learning" : "Continue";
document.querySelector("#nav-continue").href = document.querySelector("#hero-continue").href;

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
