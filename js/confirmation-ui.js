/**
 * Confirmation Assessment UI
 *
 * Short, encouraging confirmation check for concepts flagged needs_verification.
 * Presents questions one at a time with immediate feedback.
 */

import "katex/dist/katex.min.css";
import renderMathInElement from "katex/dist/contrib/auto-render.mjs";
import {
  CONFIRMATION_QUESTIONS,
  readConfirmationResults,
  recordConfirmationResponse,
  getNextConfirmationQuestion,
  allConfirmationQuestionsAttempted,
  getConfirmationMasteryState,
  getConceptsNeedingConfirmation,
  clearConfirmationResultsForConcept,
  startConfirmationAttempt,
} from "./confirmation-assessment.js";
import {
  mapDiagnosticToConcepts,
  readPlanData,
  savePlanData,
  clearPlanData,
} from "./adaptive-plan.js";
import "../css/site.css";

/* ---------------------------------------------------------------- Elements */

const introSection = document.querySelector("#confirmation-intro");
const questionSection = document.querySelector("#confirmation-question");
const completeSection = document.querySelector("#confirmation-complete");

const conceptListEl = document.querySelector("#confirmation-concept-list");
const startButton = document.querySelector("#confirmation-start");
const submitButton = document.querySelector("#confirmation-submit");
const nextButton = document.querySelector("#confirmation-next");
const retryButton = document.querySelector("#confirmation-retry");

const qNumberEl = document.querySelector("#confirmation-q-number");
const qTotalEl = document.querySelector("#confirmation-q-total");
const conceptTitleEl = document.querySelector("#confirmation-concept-title");
const instructionEl = document.querySelector("#confirmation-instruction");
const expressionEl = document.querySelector("#confirmation-expression");
const answerInput = document.querySelector("#confirmation-answer");
const hintEl = document.querySelector("#confirmation-hint");
const resultEl = document.querySelector("#confirmation-result");
const progressEl = document.querySelector("#confirmation-progress");
const completeMessageEl = document.querySelector("#confirmation-complete-message");
const completeStatsEl = document.querySelector("#confirmation-complete-stats");

/* ---------------------------------------------------------------- State */

let conceptsNeedingConfirmation = [];
let currentConceptIndex = 0;
let currentQuestionIndex = 0;
let confirmationPlan = []; // Ordered list of {conceptId, questionId}
let results = []; // {conceptId, questionId, studentAnswer, isCorrect, timeSeconds}

/* ---------------------------------------------------------------- Helpers */

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
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

/* ---------------------------------------------------------------- Intro */

function renderIntro() {
  console.log("renderIntro() called");
  // We need actual diagnostic results. Read them directly.
  let diagnosticResults = [];
  try {
    const stored = localStorage.getItem("mathfunda-diagnostic-results");
    if (stored) diagnosticResults = JSON.parse(stored);
  } catch {
    /* no data */
  }
  console.log("diagnosticResults count:", diagnosticResults.length);
  console.log("diagnosticResults:", diagnosticResults);

  let concepts = {};
  if (diagnosticResults.length > 0) {
    concepts = mapDiagnosticToConcepts(diagnosticResults);
    console.log("concepts:", concepts);
  }

  const needingConfirmation = getConceptsNeedingConfirmation(concepts);
  conceptsNeedingConfirmation = needingConfirmation;
  console.log("conceptsNeedingConfirmation:", needingConfirmation);
  console.log("needingConfirmation.length:", needingConfirmation.length);

  if (needingConfirmation.length === 0) {
    introSection.innerHTML = `
      <p class="eyebrow">QUICK CONFIRMATION CHECK</p>
      <h1>Nothing to confirm.</h1>
      <p>All your diagnostic answers are clear. No confirmation questions needed.</p>
      <div style="margin-top:1.5rem;">
        <a href="./study-plan-personalized.html" class="primary-button" type="button">View my learning plan</a>
        <a href="./index.html" class="quiet-button" type="button" style="margin-left:0.5rem;">Back to course</a>
      </div>
    `;
    return;
  }

  let html = "<p>These concepts need a quick confirmation:</p><ul style='margin:1rem 0;'>";
  for (const concept of needingConfirmation) {
    const qCount = CONFIRMATION_QUESTIONS[concept.id]?.length ?? 0;
    html += `<li><strong>${concept.topic}</strong> (${concept.unit}) — ${qCount} quick question${qCount === 1 ? "" : "s"}</li>`;
  }
  html += "</ul>";
  conceptListEl.innerHTML = html;
}

/* ---------------------------------------------------------------- Build plan */

function buildConfirmationPlan() {
  console.log("buildConfirmationPlan() called");
  console.log("conceptsNeedingConfirmation:", conceptsNeedingConfirmation);
  confirmationPlan = [];
  const existingResults = readConfirmationResults();
  const correctAnswers = new Set();
  for (const r of existingResults) {
    if (r.isCorrect) {
      correctAnswers.add(`${r.conceptId}:${r.questionId}`);
    }
  }

  for (const concept of conceptsNeedingConfirmation) {
    const questions = CONFIRMATION_QUESTIONS[concept.id] || [];
    for (const q of questions) {
      // Skip questions already answered correctly in a previous session
      if (correctAnswers.has(`${concept.id}:${q.id}`)) continue;
      confirmationPlan.push({ conceptId: concept.id, questionId: q.id, question: q });
    }
  }
  qTotalEl.textContent = confirmationPlan.length;
  console.log("confirmationPlan built:", confirmationPlan.length, "questions");
}

/* ---------------------------------------------------------------- Question display */

function showQuestion() {
  introSection.hidden = true;
  questionSection.hidden = false;
  completeSection.hidden = false; // will be hidden below
  completeSection.hidden = true;

  const item = confirmationPlan[currentQuestionIndex];
  if (!item) {
    showComplete();
    return;
  }

  const { conceptId, question } = item;

  // Find concept title
  let conceptTitle = conceptId;
  try {
    const stored = localStorage.getItem("mathfunda-diagnostic-results");
    const dr = stored ? JSON.parse(stored) : [];
    const concepts = mapDiagnosticToConcepts(dr);
    const c = concepts[conceptId];
    if (c) conceptTitle = c.topic;
  } catch {
    /* ignore */
  }

  conceptTitleEl.textContent = conceptTitle;
  qNumberEl.textContent = currentQuestionIndex + 1;

  instructionEl.textContent = question.instruction;
  renderMath(expressionEl, question.text);

  hintEl.textContent = "";
  resultEl.textContent = "";
  resultEl.className = "quiz-feedback";

  answerInput.value = "";
  answerInput.disabled = false;
  answerInput.focus();

  submitButton.hidden = false;
  nextButton.hidden = true;
  retryButton.hidden = true;

  updateProgress();
}

function updateProgress() {
  const answered = confirmationPlan.slice(0, currentQuestionIndex).length;
  const total = confirmationPlan.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  progressEl.innerHTML = `<p><strong>Progress:</strong> ${answered} of ${total} (${pct}%)</p>`;
}

/* ---------------------------------------------------------------- Answer handling */

function normalizeAnswer(answer) {
  return String(answer || "").trim().toLowerCase();
}

function stripUnits(value) {
  return value.replace(/%/g, "").replace(/°/g, "").replace(/cm/gi, "").replace(/\^2/g, "").replace(/\s+/g, "").trim();
}

function tryParseNumber(value) {
  const cleaned = stripUnits(value);
  if (!cleaned) return null;
  const fractionMatch = cleaned.match(/^(-?\d+)\/(-?\d+)$/);
  if (fractionMatch) {
    const denom = parseFloat(fractionMatch[2]);
    if (denom === 0) return null;
    return parseFloat(fractionMatch[1]) / denom;
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function extractFinalValue(value) {
  const cleaned = normalizeAnswer(value);
  if (!cleaned) return null;
  const eqParts = cleaned.split("=");
  if (eqParts.length > 1) return eqParts[eqParts.length - 1].trim();
  const colonParts = cleaned.split(":");
  if (colonParts.length > 1) return colonParts[colonParts.length - 1].trim();
  return null;
}

function answersEquivalent(student, correct) {
  const s = normalizeAnswer(student);
  const c = normalizeAnswer(correct);
  if (s === null || c === null) return false;
  if (s === c) return true;
  const sStripped = stripUnits(s);
  const cStripped = stripUnits(c);
  if (sStripped === cStripped) return true;
  const sNum = tryParseNumber(sStripped);
  const cNum = tryParseNumber(cStripped);
  if (sNum !== null && cNum !== null) {
    return Math.abs(sNum - cNum) < 0.001;
  }
  const correctFinal = extractFinalValue(c);
  if (correctFinal && correctFinal !== c) {
    const cfStripped = stripUnits(correctFinal);
    if (sStripped === cfStripped) return true;
    const cfNum = tryParseNumber(cfStripped);
    if (sNum !== null && cfNum !== null) {
      return Math.abs(sNum - cfNum) < 0.001;
    }
  }
  return false;
}

function checkAnswer() {
  const item = confirmationPlan[currentQuestionIndex];
  if (!item) return;

  const studentAnswer = answerInput.value.trim();
  if (!studentAnswer) {
    showToast("Please type an answer first.");
    return;
  }

  const isCorrect = answersEquivalent(studentAnswer, item.question.correctAnswer);

  // Record the response
  recordConfirmationResponse(
    item.conceptId,
    item.questionId,
    studentAnswer,
    isCorrect,
    0 // time not tracked for confirmation
  );

  results.push({
    conceptId: item.conceptId,
    questionId: item.questionId,
    studentAnswer,
    isCorrect,
  });

  // Show feedback
  answerInput.disabled = true;
  submitButton.hidden = true;

  if (isCorrect) {
    resultEl.textContent = "Correct! Well done.";
    resultEl.className = "quiz-feedback";
    resultEl.style.color = "var(--green)";
    hintEl.textContent = "";
    nextButton.hidden = false;
  } else {
    resultEl.textContent = "Not quite right. That's okay — try another question.";
    resultEl.className = "quiz-feedback";
    resultEl.style.color = "var(--rose)";
    hintEl.textContent = item.question.hint || "";
    retryButton.hidden = false;
  }

  updateProgress();
}

function goNext() {
  currentQuestionIndex += 1;
  if (currentQuestionIndex >= confirmationPlan.length) {
    showComplete();
  } else {
    showQuestion();
  }
}

function retryConcept() {
  const item = confirmationPlan[currentQuestionIndex];
  if (!item) return;
  // Clear this concept's confirmation results and show a fresh question
  clearConfirmationResultsForConcept(item.conceptId);
  answerInput.value = "";
  answerInput.disabled = false;
  resultEl.textContent = "";
  hintEl.textContent = "";
  retryButton.hidden = true;
  submitButton.hidden = false;
  answerInput.focus();
  showToast("Retrying this concept. Take your time.");
}

/* ---------------------------------------------------------------- Complete */

function showComplete() {
  introSection.hidden = true;
  questionSection.hidden = true;
  completeSection.hidden = false;

  // Calculate stats
  const total = results.length;
  const correct = results.filter((r) => r.isCorrect).length;

  // Update mastery states in the plan data
  try {
    const stored = localStorage.getItem("mathfunda-diagnostic-results");
    const dr = stored ? JSON.parse(stored) : [];
    const concepts = mapDiagnosticToConcepts(dr);

    let planData = readPlanData();
    if (!planData) {
      planData = {
        planVersion: 1,
        generatedAt: new Date().toISOString(),
        diagnosticVersion: 1,
        curriculumVersion: "CBSE-2026-27",
        studentId: "local-device-only",
        totalQuestions: dr.length,
        concepts,
        sortedConceptIds: Object.keys(concepts),
        summary: { totalConcepts: 0, mastered: 0, learning: 0, needsVerification: 0, notStarted: 0 },
      };
    }

    // Update concepts based on confirmation results
    for (const concept of conceptsNeedingConfirmation) {
      const newState = getConfirmationMasteryState(concept.id);
      if (planData.concepts[concept.id]) {
        planData.concepts[concept.id].masteryState = newState;
        planData.concepts[concept.id].priorityReason = newState === "not_started" ? "Confirmed correct in quick check" : planData.concepts[concept.id].priorityReason;
        planData.concepts[concept.id].studyTimeAllocated = newState === "learning";
        planData.concepts[concept.id].assessmentRequired = newState === "needs_verification";
      }
    }

    // Recalculate summary
    const conceptValues = Object.values(planData.concepts);
    planData.summary = {
      totalConcepts: conceptValues.length,
      mastered: conceptValues.filter((c) => c.masteryState === "mastered").length,
      learning: conceptValues.filter((c) => c.masteryState === "learning").length,
      needsVerification: conceptValues.filter((c) => c.masteryState === "needs_verification").length,
      notStarted: conceptValues.filter((c) => c.masteryState === "not_started").length,
    };

    planData.generatedAt = new Date().toISOString();
    savePlanData(planData);
  } catch {
    /* best effort */
  }

  let message;
  if (total === 0) {
    message = "No confirmation questions were needed.";
  } else if (correct === total) {
    message = "All correct — you know this material well.";
  } else if (correct > 0) {
    message = `You got ${correct} of ${total} right. The rest will be included in your learning plan.`;
  } else {
    message = "No problem — these topics will be part of your learning plan.";
  }
  completeMessageEl.textContent = message;

  completeStatsEl.innerHTML = `
    <p><strong>Questions answered:</strong> ${total}</p>
    <p><strong>Correct:</strong> ${correct}</p>
    <p><strong>Needs practice:</strong> ${total - correct}</p>
  `;
}

/* ---------------------------------------------------------------- Boot */

startButton.addEventListener("click", () => {
  console.log("START BUTTON CLICKED");
  console.log("startButton element:", startButton);
  console.log("conceptsNeedingConfirmation:", conceptsNeedingConfirmation);
  startConfirmationAttempt();
  buildConfirmationPlan();
  console.log("confirmationPlan length:", confirmationPlan.length);
  currentQuestionIndex = 0;
  showQuestion();
});

submitButton.addEventListener("click", checkAnswer);
answerInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") checkAnswer();
});

nextButton.addEventListener("click", goNext);
retryButton.addEventListener("click", retryConcept);

console.log("=== CONFIRMATION-UI.JS LOADED ===");
console.log("introSection:", introSection);
console.log("questionSection:", questionSection);
console.log("completeSection:", completeSection);
console.log("startButton:", startButton);
console.log("startButton type:", startButton?.type);
console.log("startButton tagName:", startButton?.tagName);

// Render intro on load
renderMathInElement(document.body, {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "\\(", right: "\\)", display: false },
    { left: "$", right: "$", display: false },
  ],
  throwOnError: false,
});
try {
  renderIntro();
} catch (e) {
  console.error("Failed to render intro:", e);
  introSection.innerHTML = `
    <p class="eyebrow">QUICK CONFIRMATION CHECK</p>
    <h1>Something went wrong loading your results.</h1>
    <p>Please refresh the page and try again, or go to the diagnostic page first.</p>
    <div style="margin-top:1.5rem;">
      <a href="./diagnostic.html" class="primary-button" type="button">Take diagnostic</a>
      <a href="./study-plan-personalized.html" class="quiet-button" type="button" style="margin-left:0.5rem;">View study plan</a>
    </div>
  `;
}
