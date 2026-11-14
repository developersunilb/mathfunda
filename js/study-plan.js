/**
 * Personalised Study Plan Page — Milestone 5
 *
 * Primary screen: Today's Learning (what to do next)
 * Secondary screen: 45-day overview (progress at a glance)
 *
 * All data stays client-side in localStorage. No personal information
 * is transmitted or stored in source code.
 */

import {
  generate45DayPlan,
  generatePlanData,
  mapDiagnosticToConcepts,
  STUDY_MODES,
  PHASES,
  lessonSlugForConcept,
} from "./adaptive-plan.js";
import {
  readConfirmationResults,
  getConfirmationMasteryState,
  CONFIRMATION_QUESTIONS,
} from "./confirmation-assessment.js";
import {
  markPlanTaskComplete,
  getPlanCompletion,
  isPlanTaskComplete,
} from "./plan-sync.js";
import {
  markLessonDone,
  isLessonDone,
} from "./progress.js";
import {
  completeLesson,
  isLessonCompleted,
} from "./lesson-engine.js";
import {
  lessonHref,
  chapters,
  chapterById,
} from "./curriculum.js";

/* --------------------------------------------------------------- Storage keys */

const PLAN_DATA_KEY = "mathfunda-adaptive-plan-v1";
const COMPLETION_KEY = "mathfunda-plan-completion-v1";
const CURRENT_DAY_KEY = "mathfunda-plan-current-day-v1";
const STUDY_MODE_KEY = "mathfunda-plan-mode-v1";
const DIAGNOSTIC_RESULTS_KEY = "mathfunda-diagnostic-results";

/* --------------------------------------------------------------- Elements */

const todaySection = document.querySelector("#today-section");
const todayEmpty = document.querySelector("#today-empty");
const todayTasks = document.querySelector("#today-tasks");
const todayTitle = document.querySelector("#today-title");
const todaySubtitle = document.querySelector("#today-subtitle");
const todayProgress = document.querySelector("#today-progress");
const todayTaskList = document.querySelector("#today-task-list");
const markDayCompleteBtn = document.querySelector("#mark-day-complete");

const recommendationSection = document.querySelector("#recommendation-section");
const recommendationList = document.querySelector("#recommendation-list");

const confirmationSection = document.querySelector("#confirmation-section");
const confirmationList = document.querySelector("#confirmation-list");

const overviewSection = document.querySelector("#overview-section");
const overviewSubtitle = document.querySelector("#overview-subtitle");
const overviewToggle = document.querySelector("#overview-toggle");
const overviewTimeline = document.querySelector("#overview-timeline");
const overviewSummary = document.querySelector("#overview-summary");

const statTotalDays = document.querySelector("#stat-total-days");
const statCompletedDays = document.querySelector("#stat-completed-days");
const statCoverage = document.querySelector("#stat-coverage");
const statCurrentDay = document.querySelector("#stat-current-day");

const parentSection = document.querySelector("#parent-summary-section");
const parentContent = document.querySelector("#parent-summary-content");

const modeButtons = document.querySelectorAll(".mode-btn");

/* --------------------------------------------------------------- State */

let planData = null;
let dailyPlan = [];
let completion = {}; // { [conceptId]: boolean }
let currentDay = 1;
let studyMode = "normal";
let concepts = {}; // { [conceptId]: concept entry }

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function loadFromStorage(key, def) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {
    /* storage blocked */
  }
  return def;
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked */
  }
}

/* --------------------------------------------------------------- Initialisation */

function init() {
  // Load persisted state
  completion = getPlanCompletion();
  currentDay = loadFromStorage(CURRENT_DAY_KEY, 1);
  studyMode = loadFromStorage(STUDY_MODE_KEY, "normal");

  // Sync plan task completion across tabs (e.g. lesson completed in reader)
  window.addEventListener("storage", (event) => {
    if (event.key === "mathfunda-plan-completion-v1") {
      completion = getPlanCompletion();
      renderAll();
      const allDone = checkDayComplete();
      markDayCompleteBtn.disabled = !allDone;
    }
  });

  // Set mode button states
  modeButtons.forEach((btn) => {
    if (btn.dataset.mode === studyMode) {
      btn.classList.add("mode-btn-active");
    } else {
      btn.classList.remove("mode-btn-active");
    }
  });

  // Load or generate plan data
  planData = loadFromStorage(PLAN_DATA_KEY, null);
  if (!planData) {
    generateInitialPlan();
  } else {
    concepts = planData.concepts || {};
    saveToStorage(PLAN_DATA_KEY, planData);
    regeneratePlan();
  }

  // Event listeners
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      studyMode = btn.dataset.mode;
      modeButtons.forEach((b) => {
        b.classList.toggle("mode-btn-active", b.dataset.mode === studyMode);
      });
      saveToStorage(STUDY_MODE_KEY, studyMode);
      regeneratePlan();
    });
  });

  markDayCompleteBtn.addEventListener("click", markDayComplete);

  overviewToggle.addEventListener("click", () => {
    const hidden = overviewTimeline.hidden;
    overviewTimeline.hidden = !hidden;
    overviewToggle.textContent = hidden ? "Hide timeline" : "Show timeline";
  });
}

function generateInitialPlan() {
  let diagnosticResults = [];
  try {
    const stored = localStorage.getItem(DIAGNOSTIC_RESULTS_KEY);
    if (stored) diagnosticResults = JSON.parse(stored);
  } catch {
    /* no diagnostic data yet */
  }

  if (diagnosticResults.length > 0) {
    planData = generatePlanData(diagnosticResults);
  } else {
    // No diagnostic results — generate an empty plan with all syllabus concepts
    planData = {
      planVersion: 1,
      generatedAt: new Date().toISOString(),
      diagnosticVersion: 1,
      curriculumVersion: "CBSE-2026-27",
      studentId: "local-device-only",
      totalQuestions: 0,
      concepts: {},
      sortedConceptIds: [],
      summary: {
        totalConcepts: 0,
        mastered: 0,
        learning: 0,
        needsVerification: 0,
        notStarted: 0,
      },
    };
  }

  concepts = planData.concepts || {};
  saveToStorage(PLAN_DATA_KEY, planData);
  regeneratePlan();
}

function regeneratePlan() {
  dailyPlan = generate45DayPlan(planData, studyMode, completion, currentDay).dailyPlan;
  saveToStorage(PLAN_DATA_KEY, planData);
  renderAll();
}

/* --------------------------------------------------------------- Rendering */

function renderAll() {
  renderToday();
  renderRecommendations();
  renderConfirmationStatus();
  renderOverview();
  renderParentSummary();
}

function renderToday() {
  const dayEntry = dailyPlan.find((d) => d.day === currentDay);

  if (!dayEntry || dayEntry.concepts.length === 0) {
    todaySection.hidden = false;
    todayEmpty.hidden = false;
    todayTasks.hidden = true;
    todayTitle.textContent = "All caught up for today";
    todaySubtitle.textContent = "No tasks scheduled. Come back tomorrow or review earlier lessons.";
    return;
  }

  todaySection.hidden = false;
  todayEmpty.hidden = true;
  todayTasks.hidden = false;

  const phase = getPhaseForDay(currentDay);
  const totalTasks = dayEntry.concepts.filter((c) => c.conceptId !== "revision-practice").length;
  const completedTasks = dayEntry.concepts.filter(
    (c) => c.conceptId !== "revision-practice" && completion[c.conceptId]
  ).length;

  todayTitle.textContent = `Day ${currentDay} · ${phase.label}`;
  todaySubtitle.textContent = `${dayEntry.totalMinutes} minutes of study · ${totalTasks} task${totalTasks === 1 ? "" : "s"}`;
  todayProgress.textContent = `${completedTasks} of ${totalTasks} complete`;

  todayTaskList.innerHTML = dayEntry.concepts
    .map((c) => {
      if (c.conceptId === "revision-practice") {
        return renderRevisionTask(c);
      }
      const done = completion[c.conceptId] || false;
      const concept = concepts[c.conceptId] || {};
      const lessonSlug = c.lessonSlug || lessonSlugForConcept(c.conceptId);
      const hasLesson = Boolean(lessonSlug);
      const priorityBadge = c.priorityScore > 0
        ? `<span class="priority-badge priority-${c.priorityScore >= 0.5 ? "high" : c.priorityScore >= 0.25 ? "medium" : "low"}">${c.priorityScore.toFixed(2)}</span>`
        : "";
      const lessonLink = hasLesson
        ? `<a href="${lessonHref(lessonSlug)}" class="task-open" target="_blank" rel="noopener" title="Open lesson">↗</a>`
        : "";
      return `
        <div class="plan-task${done ? " is-done" : ""}${hasLesson ? "" : " no-lesson"}>
          <div class="task-header">
            <input type="checkbox" id="task-${c.conceptId}-${dayEntry.day}" ${done ? "checked" : ""} data-concept-id="${c.conceptId}" />
            <label for="task-${c.conceptId}-${dayEntry.day}" class="task-label">
              ${hasLesson
                ? `<a href="${lessonHref(lessonSlug)}" class="task-title-link" target="_blank" rel="noopener">${c.topic}</a>`
                : c.topic}
              ${priorityBadge}
            </label>
            ${lessonLink}
            <span class="task-time">${c.minutes} min</span>
          </div>
          <div class="task-meta">
            <span class="task-unit">${c.unit}</span>
            ${c.isPrerequisite ? '<span class="task-tag tag-prerequisite">Foundation</span>' : ""}
            ${c.isRevision ? '<span class="task-tag tag-revision">Revision</span>' : ""}
          </div>
          ${done ? '<p class="task-done">✓ Completed</p>' : ""}
        </div>
      `;
    })
    .join("");

  // Add checkbox listeners
  todayTaskList.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", (event) => {
      const conceptId = event.target.dataset.conceptId;
      markTaskComplete(conceptId, event.target.checked);
    });
  });
}

function renderRevisionTask(c) {
  return `
    <div class="plan-task task-revision">
      <div class="task-header">
        <span class="task-label">${c.topic}</span>
        <span class="task-time">${c.minutes} min</span>
      </div>
      <div class="task-meta">
        <span class="task-unit">${c.unit}</span>
        <span class="task-tag tag-revision">Revision</span>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------- Recommendations (left panel) */

function renderRecommendations() {
  if (!dailyPlan || dailyPlan.length === 0) {
    if (recommendationSection) recommendationSection.hidden = true;
    return;
  }

  // Collect unfinished concepts from the next 3 days, deduped, sorted by priority.
  const seen = new Set();
  const upcoming = [];
  const daysToScan = dailyPlan.slice(
    dailyPlan.findIndex((d) => d.day >= currentDay),
    dailyPlan.findIndex((d) => d.day >= currentDay) + 3
  );

  for (const day of daysToScan) {
    for (const c of day.concepts) {
      if (c.conceptId === "revision-practice") continue;
      if (seen.has(c.conceptId)) continue;
      if (completion[c.conceptId]) continue;
      seen.add(c.conceptId);
      upcoming.push({ ...c, day: day.day });
    }
  }

  upcoming.sort((a, b) => b.priorityScore - a.priorityScore || a.day - b.day);

  if (upcoming.length === 0) {
    if (recommendationSection) recommendationSection.hidden = true;
    return;
  }

  recommendationSection.hidden = false;
  recommendationList.innerHTML = `
    <p class="eyebrow">UP NEXT</p>
    ${upcoming
      .map((c) => {
        const lessonSlug = c.lessonSlug || lessonSlugForConcept(c.conceptId);
        const hasLesson = Boolean(lessonSlug);
        const link = hasLesson
          ? `<a href="${lessonHref(lessonSlug)}" class="rec-title" target="_blank" rel="noopener">${c.topic}</a>`
          : `<span class="rec-title">${c.topic}</span>`;
        return `
          <div class="rec-item${isPlanTaskComplete(c.conceptId) ? " rec-done" : ""}">
            ${link}
            <span class="rec-time">${c.minutes} min · Day ${c.day}</span>
          </div>
        `;
      })
      .join("")
    }
  `;
}

function markTaskComplete(conceptId, completed) {
  completion[conceptId] = completed;
  markPlanTaskComplete(conceptId, completed);

  // Also mark the underlying lesson as done so progress reflects it.
  const slug = lessonSlugForConcept(conceptId);
  if (slug) {
    markLessonDone(slug, completed);
    completeLesson(slug, completed);
  }

  renderToday();
  renderRecommendations();
  renderOverview();

  const allDone = checkDayComplete();
  markDayCompleteBtn.disabled = !allDone;
  if (allDone) {
    markDayCompleteBtn.textContent = "Mark today's tasks complete";
  } else {
    markDayCompleteBtn.textContent = "Mark today's tasks complete";
  }
}

function checkDayComplete() {
  const dayEntry = dailyPlan.find((d) => d.day === currentDay);
  if (!dayEntry) return true;
  const tasks = dayEntry.concepts.filter((c) => c.conceptId !== "revision-practice");
  return tasks.length > 0 && tasks.every((c) => completion[c.conceptId] === true);
}

function markDayComplete() {
  if (!checkDayComplete()) {
    showToast("Please complete all tasks before marking the day done.");
    return;
  }

  currentDay += 1;
  saveToStorage(CURRENT_DAY_KEY, currentDay);
  regeneratePlan();
  showToast("Day complete. Well done!");
}

/* --------------------------------------------------------------- Confirmation Status */

function renderConfirmationStatus() {
  let diagnosticResults = [];
  try {
    const stored = localStorage.getItem(DIAGNOSTIC_RESULTS_KEY);
    if (stored) diagnosticResults = JSON.parse(stored);
  } catch {
    /* no data */
  }

  if (diagnosticResults.length === 0) {
    confirmationSection.hidden = true;
    return;
  }

  let conceptMastery = {};
  try {
    conceptMastery = mapDiagnosticToConcepts(diagnosticResults);
  } catch {
    /* mapping failed */
  }

  const confirmationResults = readConfirmationResults();
  const confirmedConceptIds = new Set(
    confirmationResults.filter((r) => r.isCorrect).map((r) => r.conceptId)
  );

  const needingConfirmation = Object.values(conceptMastery).filter(
    (c) => c.masteryState === "needs_verification" && c.assessmentRequired
  );

  if (needingConfirmation.length === 0) {
    confirmationSection.hidden = true;
    return;
  }

  confirmationSection.hidden = false;
  confirmationList.innerHTML = needingConfirmation
    .map((c) => {
      const questions = CONFIRMATION_QUESTIONS[c.id] || [];
      const answeredCorrectly = confirmedConceptIds.has(c.id);
      const remaining = questions.filter(
        (q) => !confirmationResults.some(
          (r) => r.conceptId === c.id && r.questionId === q.id && r.isCorrect
        )
      ).length;

      return `
        <div class="confirmation-item">
          <div class="confirmation-info">
            <strong>${c.topic}</strong>
            <span class="confirmation-priority">${c.priorityScore.toFixed(2)}</span>
            ${answeredCorrectly
              ? '<span class="confirmation-status status-confirmed">Confirmed</span>'
              : `<span class="confirmation-status status-pending">${remaining} remaining</span>`}
          </div>
          <div class="confirmation-action">
            <a href="./confirmation.html" class="quiet-button" type="button">
              ${answeredCorrectly ? "Review" : "Start check"}
            </a>
          </div>
        </div>
      `;
    })
    .join("");
}

/* --------------------------------------------------------------- Overview (45-Day) */

function renderOverview() {
  if (!dailyPlan || dailyPlan.length === 0) {
    overviewSection.hidden = true;
    return;
  }

  overviewSection.hidden = false;

  const totalDays = dailyPlan.length;
  const completedDays = currentDay - 1;
  const coverage = planData.coverage?.coveragePercent || 0;

  statTotalDays.textContent = totalDays;
  statCompletedDays.textContent = completedDays;
  statCoverage.textContent = `${coverage}%`;
  statCurrentDay.textContent = `Day ${currentDay}`;

  overviewSubtitle.textContent = `${dailyPlan.reduce((sum, d) => sum + d.totalMinutes, 0)} total minutes planned across ${totalDays} days`;

  // Render phase days
  const phaseDays = {
    [PHASES.foundationRepair.label]: document.querySelector("#phase-foundation-days"),
    [PHASES.syllabusDevelopment.label]: document.querySelector("#phase-build-days"),
    [PHASES.revisionPerformance.label]: document.querySelector("#phase-perform-days"),
  };

  // Group days by phase
  const daysByPhase = {};
  for (const day of dailyPlan) {
    if (!daysByPhase[day.phase]) daysByPhase[day.phase] = [];
    daysByPhase[day.phase].push(day);
  }

  for (const [phaseName, container] of Object.entries(phaseDays)) {
    const phaseDaysList = daysByPhase[phaseName] || [];
    container.innerHTML = phaseDaysList
      .map((d) => {
        const done = d.day < currentDay;
        const current = d.day === currentDay;
        return `
          <div class="phase-day${done ? " is-done" : ""}${current ? " is-current" : ""}">
            <span class="day-number">Day ${d.day}</span>
            <span class="day-minutes">${d.totalMinutes} min</span>
            ${done ? '<span class="day-status">✓</span>' : ""}
            ${current ? '<span class="day-status">Today</span>' : ""}
          </div>
        `;
      })
      .join("");
  }
}

/* --------------------------------------------------------------- Parent Summary */

function renderParentSummary() {
  let diagnosticResults = [];
  try {
    const stored = localStorage.getItem(DIAGNOSTIC_RESULTS_KEY);
    if (stored) diagnosticResults = JSON.parse(stored);
  } catch {
    /* no data */
  }

  if (diagnosticResults.length === 0) {
    parentSection.hidden = true;
    return;
  }

  parentSection.hidden = false;

  const answered = diagnosticResults.filter((r) => !r.skipped).length;
  const skipped = diagnosticResults.filter((r) => r.skipped).length;
  const correct = diagnosticResults.filter((r) => !r.skipped && r.studentAnswer === r.correctAnswer).length;
  const totalTime = diagnosticResults.reduce((sum, r) => sum + r.timeSeconds, 0);

  // Group by topic for strengths/weaknesses
  const byTopic = {};
  for (const r of diagnosticResults) {
    if (!byTopic[r.topic]) byTopic[r.topic] = { total: 0, correct: 0 };
    byTopic[r.topic].total += 1;
    if (!r.skipped && r.studentAnswer === r.correctAnswer) byTopic[r.topic].correct += 1;
  }

  const topicScores = Object.entries(byTopic)
    .map(([topic, data]) => ({ topic, pct: data.total ? Math.round((data.correct / data.total) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct);

  parentContent.innerHTML = `
    <div class="parent-stats">
      <div class="parent-stat">
        <strong>${answered} of ${diagnosticResults.length}</strong><span>questions answered</span>
      </div>
      <div class="parent-stat">
        <strong>${correct}</strong><span>correct answers</strong>
      </div>
      <div class="parent-stat">
        <strong>${skipped}</strong><span>questions skipped (untimed reassessment available)</span>
      </div>
      <div class="parent-stat">
        <strong>${Math.floor(totalTime / 60)}m ${totalTime % 60}s</strong><span>total diagnostic time</span>
      </div>
    </div>

    <h3>Strengths</h3>
    <ul class="parent-list">
      ${topicScores.slice(0, 3).map((t) => `<li><strong>${t.topic}</strong> — ${t.pct}% correct</li>`).join("") || "<li>No data yet.</li>"}
    </ul>

    <h3>Areas to practise together</h3>
    <ul class="parent-list">
      ${topicScores.slice(-3).reverse().map((t) => `<li><strong>${t.topic}</strong> — ${t.pct}% correct</li>`).join("") || "<li>No data yet.</li>"}
    </ul>

    <p class="parent-note">
      Your child's results are stored only on this device. Nothing is uploaded or shared.
      Use the confirmation check to clarify skipped questions before starting study tasks.
    </p>
  `;
}

/* --------------------------------------------------------------- Phase helper */

function getPhaseForDay(day) {
  if (day >= PHASES.foundationRepair.start && day <= PHASES.foundationRepair.end) {
    return PHASES.foundationRepair;
  }
  if (day >= PHASES.syllabusDevelopment.start && day <= PHASES.syllabusDevelopment.end) {
    return PHASES.syllabusDevelopment;
  }
  return PHASES.revisionPerformance;
}

/* --------------------------------------------------------------- Boot */

init();
