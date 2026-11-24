/**
 * Orientation — Milestone 8: Guided Learning & Cognitive Simplicity
 *
 * Shared module imported by every page so the child always knows:
 *   1. Where am I?        (Day, phase, concept, activity)
 *   2. What do I do now?  (single dominant next step)
 *   3. Why am I doing this?(purpose stated in plain language)
 *   4. What happens next? (the step after this one)
 *
 * Navigation levels:
 *   Level 1 — Today          index.html            (the guided hub)
 *   Level 2 — My Plan        study-plan-personalized.html, learn.html
 *   Level 3 - Explore        flashcards.html, formulas.html, vocabulary.html, methods.html
 *
 * All data stays client-side in localStorage. Nothing is transmitted.
 */

import { getPlanCompletion, isPlanTaskComplete } from "./plan-sync.js";
import {
  PHASES,
  getPhaseForDay,
  lessonSlugForConcept,
  SYLLABUS_CONCEPTS,
} from "./adaptive-plan.js";
import {
  lessonHref,
  chapters,
  chapterById,
  stageChapters,
} from "./curriculum.js";
import {
  lessonState,
  isLessonDone,
} from "./progress.js";
import {
  getMasteryState,
  isMastered,
} from "./lesson-engine.js";
import {
  questionConceptIdForLessonSlug,
} from "./adaptive-plan.js";

/* --------------------------------------------------------------- Storage keys */

const CURRENT_DAY_KEY = "mathfunda-plan-current-day-v1";
const PLAN_DATA_KEY = "mathfunda-adaptive-plan-v1";
const STUDY_MODE_KEY = "mathfunda-plan-mode-v1";
const SESSION_KEY = "mathfunda-learning-session-v1";

/* --------------------------------------------------------------- Navigation levels */

export const LEVEL_TODAY = "today";
export const LEVEL_PLAN = "plan";
export const LEVEL_EXPLORE = "explore";

const LEVEL_BY_PAGE = {
  "./index.html": LEVEL_TODAY,
  "./study-plan-personalized.html": LEVEL_PLAN,
  "./learn.html": LEVEL_PLAN,
  "./reader.html": LEVEL_TODAY,
  "./flashcards.html": LEVEL_EXPLORE,
  "./formulas.html": LEVEL_EXPLORE,
  "./vocabulary.html": LEVEL_EXPLORE,
  "./methods.html": LEVEL_EXPLORE,
};

export function currentLevel() {
  const path = location.pathname;
  const name = path.slice(path.lastIndexOf("/") + 1);
  const key = `./${name}`;
  return LEVEL_BY_PAGE[key] ?? LEVEL_TODAY;
}

/* --------------------------------------------------------------- Storage helpers */

function loadJson(key, def) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {
    /* storage blocked or private mode */
  }
  return def;
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be full or blocked */
  }
}

/* --------------------------------------------------------------- Day & phase */

export function currentDay() {
  return loadJson(CURRENT_DAY_KEY, 1);
}

export function setCurrentDay(day) {
  saveJson(CURRENT_DAY_KEY, Math.max(1, Math.min(45, Number(day) || 1)));
}

export function phaseForDay(day) {
  return getPhaseForDay(day);
}

export function currentPhase() {
  return phaseForDay(currentDay());
}

/* --------------------------------------------------------------- Plan data */

function planData() {
  return loadJson(PLAN_DATA_KEY, null);
}

function todaysPlanEntry() {
  const plan = planData();
  if (!plan || !plan.dailyPlan || !plan.dailyPlan.length) return null;
  const day = currentDay();
  return plan.dailyPlan.find((d) => d.day === day) || null;
}

export function studyMode() {
  return loadJson(STUDY_MODE_KEY, "normal");
}

/* --------------------------------------------------------------- Concepts & activity */

/**
 * Child-friendly label for a concept, derived from the lesson title or
 * syllabus topic. Falls back to a generic "today's idea".
 */
function conceptTitleForLesson(slug) {
  const chapter = chapters.find((entry) => entry.slug === slug);
  if (chapter && chapter.title) return chapter.title;
  const conceptId = questionConceptIdForLessonSlug(slug);
  if (conceptId && SYLLABUS_CONCEPTS[conceptId]) {
    return SYLLABUS_CONCEPTS[conceptId].topic;
  }
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    || "Today's idea";
}

/**
 * The concept the child is working on today: the first unfinished plan task
 * with a lesson link, falling back to the last visited lesson.
 */
export function currentConcept() {
  const today = todaysPlanEntry();
  if (today) {
    const task = today.concepts.find(
      (c) => c.conceptId !== "revision-practice" && c.lessonSlug
    );
    if (task) return { title: task.topic, slug: task.lessonSlug };
  }
  const last = loadJson("mathfunda-progress-v1", {}).last;
  if (last && last.slug) {
    return { title: conceptTitleForLesson(last.slug), slug: last.slug };
  }
  return { title: "Today's lesson", slug: null };
}

/**
 * What the child is doing right now on this page:
 *   'learn'   — reading a lesson
 *   'practise' — answering practice questions
 *   'mastery' — taking a mastery check
 *   'review'  — revising / mistake notebook
 *   'complete' — today's goal is done
 */
export function currentActivity(slug = null) {
  const lesson = slug || currentConcept().slug;
  if (!lesson) return "learn";
  if (isMastered(lesson)) return "complete";
  if (isLessonDone(lesson)) return "mastery";
  return "learn";
}

export function activityLabel(activity) {
  const labels = {
    learn: "Read the lesson",
    practise: "Practise the idea",
    mastery: "Take the check",
    review: "Review your mistakes",
    complete: "Today's goal complete",
  };
  return labels[activity] || "Keep going";
}

/* --------------------------------------------------------------- Next step */

/**
 * The single dominant next action for the current screen.
 * Returns { label, href, kind } where kind is 'primary' | 'next' | 'done'.
 */
export function nextStep(context = {}) {
  const { onReader = false, lessonComplete = false, practised = false } = context;
  const today = todaysPlanEntry();
  const done = getPlanCompletion();

  // No plan yet -> start today
  if (!today || today.concepts.length === 0) {
    return {
      label: "Start today's learning",
      href: "./study-plan-personalized.html",
      kind: "primary",
      why: "Your plan is waiting. Pick up where you left off.",
    };
  }

  const unfinished = today.concepts.filter(
    (c) => c.conceptId !== "revision-practice" && !done[c.conceptId]
  );

  if (unfinished.length > 0) {
    const task = unfinished[0];
    const slug = task.lessonSlug || lessonSlugForConcept(task.conceptId);
    const hasLesson = Boolean(slug);
    return {
      label: hasLesson
        ? `Start ${task.topic}`
        : `Read about ${task.topic}`,
      href: hasLesson ? lessonHref(slug) : "./study-plan-personalized.html",
      kind: "primary",
      why: `This is today's focus: ${task.topic}.`,
    };
  }

  // All today's tasks complete
  return {
    label: "You're done for today",
    href: "./index.html",
    kind: "done",
    why: "Every task for today is complete. Come back tomorrow.",
  };
}

/**
 * What happens after the current step (the step after this one).
 */
export function afterThis(context = {}) {
  const { onReader = false, lessonComplete = false, practised = false } = context;
  const today = todaysPlanEntry();
  const done = getPlanCompletion();

  if (!today) return null;

  if (onReader && !lessonComplete) {
    return {
      label: "Finish the lesson, then practise",
      why: "Read the page through, then try the practice questions below it.",
    };
  }
  if (onReader && lessonComplete && !practised) {
    return {
      label: "Practise the idea",
      why: "Three short questions check that it stuck.",
    };
  }
  if (practised) {
    return {
      label: "Take the mastery check",
      why: "Eight out of ten correct marks the idea as learned.",
    };
  }

  const unfinished = today.concepts.filter(
    (c) => c.conceptId !== "revision-practice" && !done[c.conceptId]
  );
  if (unfinished.length > 0) {
    return {
      label: `Then move to ${unfinished[0].topic}`,
      why: "The next idea in today's plan.",
    };
  }
  return {
    label: "Stop here for today",
    why: "Today's goal is complete. Rest tomorrow.",
  };
}

/* --------------------------------------------------------------- Return to today */

/**
 * URL that always returns to the exact current learning state.
 */
export function returnToTodayUrl() {
  return "./study-plan-personalized.html";
}

export function returnToTodayLabel() {
  return "← Return to today's learning";
}

/* --------------------------------------------------------------- Learning session */

/**
 * Start a focused learning session. Persisted so a refresh mid-session
 * resumes exactly where the child stopped.
 */
export function startSession(slug, page, activity) {
  const session = {
    slug,
    page: Math.max(1, Number(page) || 1),
    activity,
    startedAt: Date.now(),
    day: currentDay(),
  };
  saveJson(SESSION_KEY, session);
  return session;
}

/**
 * Read the current learning session (if any).
 */
export function getSession() {
  return loadJson(SESSION_KEY, null);
}

/**
 * Clear the session once the child stops naturally.
 */
export function endSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage blocked */
  }
}

/**
 * Resume message for a child reopening the app mid-session.
 */
export function resumeMessage() {
  const session = getSession();
  if (!session) return null;
  const chapter = chapters.find((entry) => entry.slug === session.slug);
  return {
    title: chapter ? chapter.title : "Your lesson",
    page: session.page,
    activity: session.activity,
    href: lessonHref(session.slug, session.page),
  };
}

/* --------------------------------------------------------------- Orientation summary */

/**
 * Everything a screen needs to render the "You are here" bar.
 */
export function orientation() {
  const day = currentDay();
  const phase = phaseForDay(day);
  const concept = currentConcept();
  const activity = currentActivity();
  const step = nextStep();

  return {
    day,
    totalDays: 45,
    phase: phase.label,
    conceptTitle: concept.title,
    conceptSlug: concept.slug,
    activity,
    activityLabel: activityLabel(activity),
    nextStep: step,
  };
}

/* --------------------------------------------------------------- Page-level helpers */

/**
 * Is the current page a Level 3 optional/explore resource?
 */
export function isExplorePage() {
  return currentLevel() === LEVEL_EXPLORE;
}

/**
 * Is the current page the Level 1 Today hub?
 */
export function isTodayPage() {
  return currentLevel() === LEVEL_TODAY;
}

export { PLAN_DATA_KEY, CURRENT_DAY_KEY, SESSION_KEY };
