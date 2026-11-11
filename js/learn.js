import {
  STAGES,
  STAGE_BY_ID,
  chapters,
  lessonHref,
  stageChapters,
} from "./curriculum.js";
import {
  isLessonDone,
  lessonState,
  nextUnfinished,
  summary,
} from "./progress.js";
import "../css/site.css";

const params = new URLSearchParams(location.search);
const requested = params.get("stage") || STAGES[0].id;
const stage = STAGE_BY_ID[requested] || STAGES[0];

const stageLessons = stageChapters(stage.id);
const progress = summary(stageLessons.map((lesson) => lesson.slug));

document.querySelector("#stage-kicker").textContent = stage.kicker.toUpperCase();
document.querySelector("#stage-title").textContent = stage.title;
document.querySelector("#stage-blurb").textContent = stage.blurb;
document.querySelector("#stage-count").textContent = `${stageLessons.length} lesson${stageLessons.length === 1 ? "" : "s"}`;
document.querySelector("#stage-minutes").textContent = `${stageLessons.reduce((sum, lesson) => sum + lesson.minutes, 0)} min of reading`;
document.querySelector("#stage-done").textContent = `${progress.done} complete`;
document.title = `${stage.title} · MathsFunda`;

const ring = document.querySelector("#stage-ring");
ring.style.setProperty("--value", progress.percent);
document.querySelector("#stage-percent").textContent = `${progress.percent}%`;

const nextSlug = nextUnfinished(stageLessons.map((lesson) => lesson.slug));
const nextLesson = stageLessons.find((lesson) => lesson.slug === nextSlug) || stageLessons[0];
const continueButton = document.querySelector("#stage-continue");
continueButton.href = nextLesson ? lessonHref(nextLesson.slug, lessonState(nextLesson.slug).page) : "./index.html";
continueButton.textContent =
  progress.done === 0 ? "Start stage" : progress.done === progress.total ? "Review stage" : "Continue stage";
document.querySelector("#stage-progress-copy").textContent =
  progress.done === 0
    ? "Start with the first lesson."
    : progress.done === progress.total
      ? "Every lesson in this stage is complete."
      : `${progress.total - progress.done} lesson${progress.total - progress.done === 1 ? "" : "s"} left.`;

/* ------------------------------------------------------------------ Tabs */

const tabs = document.querySelector("#stage-tabs");
STAGES.forEach((entry) => {
  const link = document.createElement("a");
  link.href = `./learn.html?stage=${entry.id}`;
  link.textContent = entry.title;
  link.className = entry.id === stage.id ? "is-active" : "";
  tabs.appendChild(link);
});

/* ------------------------------------------------------------- Lesson list */

const list = document.querySelector("#lesson-list");

stageLessons.forEach((lesson, index) => {
  const done = isLessonDone(lesson.slug);
  const saved = lessonState(lesson.slug);
  const item = document.createElement("li");
  item.className = `lesson-row${done ? " is-done" : ""}`;
  item.innerHTML = `
    <span class="lesson-number">${String(index + 1).padStart(2, "0")}</span>
    <div class="lesson-row-copy">
      <a class="lesson-row-title" href="${lessonHref(lesson.slug, saved.page)}">${lesson.title}</a>
      <p>${lesson.blurb}</p>
      <div class="lesson-row-meta">
        <span>${lesson.minutes} min</span>
        <span>${done ? "Completed" : saved.page > 1 ? `Page ${saved.page}` : "Not started"}</span>
      </div>
    </div>
    <span class="lesson-status" aria-hidden="true">${done ? "✓" : "→"}</span>
  `;
  list.appendChild(item);
});

/* -------------------------------------------------------------- Stage pager */

const stageIndex = STAGES.findIndex((entry) => entry.id === stage.id);
const previous = STAGES[stageIndex - 1];
const next = STAGES[stageIndex + 1];
const previousLink = document.querySelector("#stage-prev");
const nextLink = document.querySelector("#stage-next");

if (previous) {
  previousLink.href = `./learn.html?stage=${previous.id}`;
  previousLink.textContent = `← ${previous.title}`;
} else {
  previousLink.hidden = true;
}

if (next) {
  nextLink.href = `./learn.html?stage=${next.id}`;
  nextLink.textContent = `${next.title} →`;
} else {
  nextLink.href = "./index.html";
  nextLink.textContent = "Back to home →";
}

// Keep the header CTA useful.
const navContinue = document.querySelector("#nav-continue");
if (nextLesson) {
  navContinue.href = lessonHref(nextLesson.slug, lessonState(nextLesson.slug).page);
  navContinue.textContent = progress.done === 0 ? "Start stage" : "Continue";
}

void chapters;
