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
import {
  orientation,
} from "./orientation.js";
import "../css/site.css";

const params = new URLSearchParams(location.search);
const requested = params.get("stage") || STAGES[0].id;
const stage = STAGE_BY_ID[requested] || STAGES[0];

const allStageChapters = stageChapters(stage.id);
const stageLessons = allStageChapters.filter((lesson) => !lesson.resource);
// Fallback: if no lessons after filtering, use all stage chapters
const effectiveLessons = stageLessons.length > 0 ? stageLessons : allStageChapters;
const progress = summary(effectiveLessons.map((lesson) => lesson.slug));

// Debug logging
console.log("[learn] stage.id:", stage.id, "stage.part:", stage.part);
console.log("[learn] chapters length:", chapters.length, "first chapter:", chapters[0]?.part, chapters[0]?.slug);
console.log("[learn] STAGE_BY_ID foundations:", STAGE_BY_ID["foundations"]?.part, STAGE_BY_ID["foundations"]?.id);
console.log("[learn] allStageChapters:", allStageChapters.length, "stageLessons:", stageLessons.length, "effective:", effectiveLessons.length);
if (allStageChapters.length > 0) {
  console.log("[learn] first allStageChapters:", allStageChapters[0].slug, allStageChapters[0].part);
}

document.querySelector("#stage-kicker").textContent = stage.kicker.toUpperCase();
document.querySelector("#stage-title").textContent = stage.title;
document.querySelector("#stage-blurb").textContent = stage.blurb;
document.querySelector("#stage-count").textContent = `${effectiveLessons.length} lesson${effectiveLessons.length === 1 ? "" : "s"}`;
document.querySelector("#stage-minutes").textContent = `${effectiveLessons.reduce((sum, lesson) => sum + lesson.minutes, 0)} min of reading`;
document.querySelector("#stage-done").textContent = `${progress.done} complete`;
document.title = `${stage.title} · MathsFunda`;

const ring = document.querySelector("#stage-ring");
ring.style.setProperty("--value", progress.percent);
document.querySelector("#stage-percent").textContent = `${progress.percent}%`;

const nextLesson = effectiveLessons[0];
const continueButton = document.querySelector("#stage-continue");
if (nextLesson) {
  continueButton.href = lessonHref(nextLesson.slug, lessonState(nextLesson.slug).page);
  continueButton.textContent =
    progress.done === 0 ? "Start stage" : progress.done === progress.total ? "Review stage" : "Continue stage";
} else {
  continueButton.href = "./index.html";
  continueButton.textContent = "No lessons available";
}
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

effectiveLessons.forEach((lesson, index) => {
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

// Orientation bar
const orient = orientation();
const elDay = document.querySelector("#orient-day");
const elPhase = document.querySelector("#orient-phase");
const elConcept = document.querySelector("#orient-concept");
const elActivity = document.querySelector("#orient-activity");
if (elDay) elDay.textContent = String(orient.day);
if (elPhase) elPhase.textContent = orient.phase;
if (elConcept) elConcept.textContent = orient.conceptTitle;
if (elActivity) elActivity.textContent = orient.activityLabel;

void chapters;
