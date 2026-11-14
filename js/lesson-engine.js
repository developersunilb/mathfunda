/**
 * Lesson Engine — Milestone 6
 *
 * Core learning logic independent of any UI. Works on desktop, mobile and iPad.
 *
 * Responsibilities:
 *   - Lesson state tracking (separate from mastery)
 *   - Mastery state management (6 states)
 *   - Practice question delivery with first-wrong-step detection
 *   - Immediate feedback with error categorization
 *   - Mastery confirmation with fresh independent questions (80% threshold)
 *   - Mistake notebook
 *
 * All data persists in localStorage. Nothing is transmitted.
 */

import {
  MASTERY_STATES,
  LESSON_STATES,
  ERROR_CATEGORIES,
  MASTERY_THRESHOLD,
  getQuestionsForConcept,
  getQuestion,
  getAllQuestionIds,
  answersEquivalent,
  validateAllQuestions,
} from "./content-model.js";

/* --------------------------------------------------------------- Storage keys */

const LESSON_ENGINE_KEY = "mathfunda-lesson-engine-v1";
const MISTAKE_NOTEBOOK_KEY = "mathfunda-mistake-notebook-v1";

/* --------------------------------------------------------------- Default state */

const EMPTY_STATE = () => ({
  version: 1,
  // Lesson progress: { [lessonSlug]: { state, page, visitedAt, completedAt } }
  lessons: {},
  // Concept mastery: { [conceptId]: { state, lastAssessed, updatedAt, evidenceCount } }
  mastery: {},
  // Practice attempts: { [questionId]: { studentAnswer, isCorrect, errorCategory, timestamp, attemptCount } }
  practiceAttempts: {},
  // Mistake notebook entries
  mistakes: {},
});

/* --------------------------------------------------------------- State management */

let state = readState();
const listeners = new Set();

function readState() {
  try {
    const stored = JSON.parse(localStorage.getItem(LESSON_ENGINE_KEY) || "null");
    if (stored && typeof stored === "object" && stored.version) {
      return { ...EMPTY_STATE(), ...stored };
    }
  } catch {
    /* corrupt or unavailable storage */
  }
  return EMPTY_STATE();
}

function commit() {
  try {
    localStorage.setItem(LESSON_ENGINE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be full or blocked */
  }
  listeners.forEach((listener) => listener(state));
}

/**
 * Reset all engine state (for testing).
 * Clears both module-level state and localStorage.
 */
function resetEngineState() {
  state = EMPTY_STATE();
  try {
    localStorage.removeItem(LESSON_ENGINE_KEY);
    localStorage.removeItem(MISTAKE_NOTEBOOK_KEY);
  } catch {
    /* storage blocked */
  }
  commit();
}

function onEngineChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* --------------------------------------------------------------- Lesson state */

/**
 * Get lesson state for a lesson slug.
 * States: not_started, in_progress, completed (separate from mastery)
 */
function getLessonState(slug) {
  return state.lessons[slug] || {
    state: LESSON_STATES.not_started,
    page: 1,
    visitedAt: 0,
    completedAt: 0,
  };
}

/**
 * Mark a lesson as in progress when the student starts reading.
 */
function startLesson(slug) {
  const entry = getLessonState(slug);
  if (entry.state === LESSON_STATES.not_started) {
    state.lessons[slug] = {
      ...entry,
      state: LESSON_STATES.in_progress,
      visitedAt: Date.now(),
    };
    commit();
  }
}

/**
 * Mark a lesson page as visited (page progress persists independently of mastery).
 */
function setLessonPage(slug, page) {
  const entry = getLessonState(slug);
  let newState = entry.state;
  if (entry.state === LESSON_STATES.not_started) {
    newState = LESSON_STATES.in_progress;
  }
  state.lessons[slug] = {
    ...entry,
    state: newState,
    page: Math.max(1, Number(page) || 1),
    visitedAt: Date.now(),
  };
  commit();
}

/**
 * Mark a lesson as completed (reading finished, NOT mastery).
 */
function completeLesson(slug, completed = true) {
  const entry = getLessonState(slug);
  state.lessons[slug] = {
    ...entry,
    state: completed ? LESSON_STATES.completed : LESSON_STATES.in_progress,
    completedAt: completed ? Date.now() : 0,
  };
  commit();
}

/**
 * Check if a lesson is completed (reading done, not mastery).
 */
function isLessonCompleted(slug) {
  return getLessonState(slug).state === LESSON_STATES.completed;
}

/* --------------------------------------------------------------- Mastery state */

/**
 * Get mastery state for a concept.
 * States: not_started, introduced, learning, practising, needs_reinforcement, mastered
 */
function getMasteryState(conceptId) {
  return state.mastery[conceptId] || {
    state: MASTERY_STATES.not_started,
    lastAssessed: 0,
    updatedAt: 0,
    evidenceCount: 0,
  };
}

/**
 * Update mastery state for a concept.
 */
function setMasteryState(conceptId, newState, evidenceCount = 1) {
  const existing = getMasteryState(conceptId);
  state.mastery[conceptId] = {
    state: newState,
    lastAssessed: Date.now(),
    updatedAt: Date.now(),
    evidenceCount: existing.evidenceCount + evidenceCount,
  };
  commit();
}

/**
 * Check if a concept is mastered.
 */
function isMastered(conceptId) {
  return getMasteryState(conceptId).state === MASTERY_STATES.mastered;
}

/**
 * Check if a concept needs verification (skipped diagnostic, unconfirmed).
 */
function needsVerification(conceptId) {
  return getMasteryState(conceptId).state === MASTERY_STATES.needs_reinforcement ||
    getMasteryState(conceptId).state === MASTERY_STATES.not_started;
}

/* --------------------------------------------------------------- Practice questions */

/**
 * Record a practice attempt for a question.
 * Returns the assessment result including error categorization.
 */
function recordPracticeAttempt(questionId, studentAnswer, timeSeconds = 0) {
  const question = getQuestion(questionId);
  if (!question) {
    throw new Error(`Unknown question ID: ${questionId}`);
  }

  const isCorrect = answersEquivalent(studentAnswer, question.correctAnswer);

  // Determine error category if incorrect
  let errorCategory = null;
  let errorMessage = null;
  let firstWrongStep = null;

  if (!isCorrect && question.steps.length > 0) {
    // Step-by-step question: find the first wrong step
    const stepAssessment = assessSteps(studentAnswer, question);
    firstWrongStep = stepAssessment.firstWrongStep;
    errorCategory = stepAssessment.errorCategory;
    errorMessage = stepAssessment.errorMessage;
  } else if (!isCorrect) {
    // Single-answer question: categorize the error
    errorCategory = categorizeError(studentAnswer, question.correctAnswer, question.errorTypes);
    errorMessage = question.errorTypes[errorCategory] || "Check your answer and try again.";
  }

  const attempt = {
    questionId,
    studentAnswer,
    isCorrect,
    errorCategory,
    errorMessage,
    firstWrongStep,
    timeSeconds,
    timestamp: Date.now(),
  };

  // Store attempt
  if (!state.practiceAttempts[questionId]) {
    state.practiceAttempts[questionId] = [];
  }
  state.practiceAttempts[questionId].push(attempt);

  // Update concept mastery based on result
  updateMasteryFromAttempt(question.conceptId, isCorrect, errorCategory);

  commit();

  return {
    questionId,
    isCorrect,
    errorCategory,
    errorMessage,
    firstWrongStep,
    correctAnswer: question.correctAnswer,
    conceptId: question.conceptId,
  };
}

/**
 * Assess a step-by-step answer to find the first wrong step.
 * studentAnswer is expected to be an array of step answers, or a single string
 * for the final answer.
 */
function assessSteps(studentAnswer, question) {
  const steps = question.steps;
  const studentSteps = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const studentStepAnswer = studentSteps[i] || "";

    if (!answersEquivalent(studentStepAnswer, step.expected)) {
      // Found the first wrong step
      const errorCategory = step.errorTypes?.conceptual
        ? ERROR_CATEGORIES.conceptual
        : step.errorTypes?.arithmetic
          ? ERROR_CATEGORIES.arithmetic
          : ERROR_CATEGORIES.conceptual;
      return {
        firstWrongStep: {
          stepNumber: step.step,
          stepText: step.text,
          expectedAnswer: step.expected,
          studentAnswer: studentStepAnswer,
          explanation: step.explanation,
        },
        errorCategory,
        errorMessage: step.errorTypes?.[errorCategory] || step.explanation,
      };
    }
  }

  // All steps correct but final answer might still be wrong
  const finalAnswer = studentSteps[studentSteps.length - 1] || "";
  if (!answersEquivalent(finalAnswer, question.correctAnswer)) {
    return {
      firstWrongStep: {
        stepNumber: steps.length,
        stepText: "Final answer",
        expectedAnswer: question.correctAnswer,
        studentAnswer: finalAnswer,
        explanation: "Check your final answer.",
      },
      errorCategory: ERROR_CATEGORIES.calculation,
      errorMessage: "Check your final calculation.",
    };
  }

  return { firstWrongStep: null, errorCategory: null, errorMessage: null };
}

/**
 * Categorize an error for single-answer questions.
 */
function categorizeError(studentAnswer, correctAnswer, errorTypes) {
  const s = normalizeAnswerForCategorization(studentAnswer);
  const c = normalizeAnswerForCategorization(correctAnswer);

  // Format error: same answer, different formatting
  if (s !== null && c !== null && s === c) {
    return ERROR_CATEGORIES.format;
  }

  // Check if it's a calculation error (numeric but wrong)
  const sNum = tryParseNumber(stripUnitsForCategorization(s));
  const cNum = tryParseNumber(stripUnitsForCategorization(c));
  if (sNum !== null && cNum !== null) {
    return ERROR_CATEGORIES.calculation;
  }

  // Default to conceptual (wrong method/understanding)
  return ERROR_CATEGORIES.conceptual;
}

/* --------------------------------------------------------------- Mastery confirmation */

/**
 * Get fresh independent questions for mastery confirmation.
 * Excludes questions already answered correctly in practice.
 */
function getConfirmationQuestions(conceptId, excludeCorrect = true) {
  const allQuestions = getQuestionsForConcept(conceptId);
  if (!allQuestions || allQuestions.length === 0) return [];

  if (!excludeCorrect) return allQuestions;

  // Filter out questions already answered correctly
  return allQuestions.filter((q) => {
    const attempts = state.practiceAttempts[q.id] || [];
    return !attempts.some((a) => a.isCorrect);
  });
}

/**
 * Run a mastery confirmation assessment.
 * Returns { passed: boolean, accuracy: number, results: AttemptResult[] }.
 * Passing threshold: MASTERY_THRESHOLD (80%).
 */
function assessMastery(conceptId, questionResults) {
  if (!questionResults || questionResults.length === 0) {
    return { passed: false, accuracy: 0, results: [] };
  }

  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const accuracy = correctCount / questionResults.length;
  const passed = accuracy >= MASTERY_THRESHOLD;

  // Update mastery state
  const newState = passed
    ? MASTERY_STATES.mastered
    : MASTERY_STATES.needs_reinforcement;

  setMasteryState(conceptId, newState, questionResults.length);

  return { passed, accuracy, results: questionResults };
}

/**
 * Check if a concept needs mastery confirmation (needs_verification from diagnostic).
 */
function needsMasteryConfirmation(conceptId) {
  const mastery = getMasteryState(conceptId);
  return mastery.state === MASTERY_STATES.not_started ||
    mastery.state === MASTERY_STATES.needs_reinforcement;
}

/* --------------------------------------------------------------- Mistake notebook */

/**
 * Record a mistake in the notebook.
 * Entries are never overwritten — each attempt is preserved.
 */
function recordMistake(questionId, studentAnswer, correctAnswer, errorCategory, errorMessage, firstWrongStep, timeSeconds) {
  const question = getQuestion(questionId);
  if (!question) {
    throw new Error(`Unknown question ID: ${questionId}`);
  }

  const entry = {
    id: `mistake-${Date.now()}`,
    questionId,
    conceptId: question.conceptId,
    questionText: question.text,
    instruction: question.instruction,
    studentAnswer,
    correctAnswer,
    errorCategory,
    errorMessage,
    firstWrongStep,
    timeSeconds,
    timestamp: Date.now(),
    reviewed: false,
    retried: false,
    retryCorrect: null,
  };

  if (!state.mistakes[question.conceptId]) {
    state.mistakes[question.conceptId] = [];
  }
  state.mistakes[question.conceptId].push(entry);

  commit();

  return entry;
}

/**
 * Get all mistake entries for a concept.
 */
function getMistakesForConcept(conceptId) {
  return state.mistakes[conceptId] || [];
}

/**
 * Get all mistake entries.
 */
function getAllMistakes() {
  const all = [];
  for (const entries of Object.values(state.mistakes)) {
    all.push(...entries);
  }
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Mark a mistake entry as reviewed.
 */
function markMistakeReviewed(mistakeId) {
  for (const entries of Object.values(state.mistakes)) {
    const entry = entries.find((e) => e.id === mistakeId);
    if (entry) {
      entry.reviewed = true;
      commit();
      return entry;
    }
  }
  return null;
}

/**
 * Record a retry of a mistake.
 */
function recordMistakeRetry(mistakeId, retryCorrect, studentAnswer) {
  for (const entries of Object.values(state.mistakes)) {
    const entry = entries.find((e) => e.id === mistakeId);
    if (entry) {
      entry.retried = true;
      entry.retryCorrect = retryCorrect;
      entry.retryStudentAnswer = studentAnswer;
      entry.retryTimestamp = Date.now();
      commit();
      return entry;
    }
  }
  return null;
}

/**
 * Clear all mistakes for a concept (allows full retry).
 */
function clearMistakesForConcept(conceptId) {
  if (state.mistakes[conceptId]) {
    delete state.mistakes[conceptId];
    commit();
  }
}

/* --------------------------------------------------------------- Mastery update from attempt */

/**
 * Update mastery state based on a practice attempt result.
 */
function updateMasteryFromAttempt(conceptId, isCorrect, errorCategory) {
  const existing = getMasteryState(conceptId);
  const allQuestions = getQuestionsForConcept(conceptId);
  const correctAttempts = Object.values(state.practiceAttempts)
    .flat()
    .filter((a) => {
      const q = getQuestion(a.questionId);
      return q && q.conceptId === conceptId && a.isCorrect;
    });

  const uniqueCorrectQuestions = new Set(correctAttempts.map((a) => a.questionId));
  const totalQuestions = allQuestions.length;
  const accuracy = totalQuestions > 0 ? uniqueCorrectQuestions.size / totalQuestions : 0;

  if (existing.state === MASTERY_STATES.not_started) {
    // First attempt
    if (isCorrect) {
      setMasteryState(conceptId, MASTERY_STATES.introduced, 1);
    } else {
      setMasteryState(conceptId, MASTERY_STATES.learning, 1);
    }
  } else if (existing.state === MASTERY_STATES.introduced) {
    if (isCorrect && uniqueCorrectQuestions.size >= Math.ceil(totalQuestions * 0.5)) {
      setMasteryState(conceptId, MASTERY_STATES.learning, 1);
    } else if (!isCorrect) {
      setMasteryState(conceptId, MASTERY_STATES.learning, 1);
    }
  } else if (existing.state === MASTERY_STATES.learning) {
    if (isCorrect && accuracy >= MASTERY_THRESHOLD) {
      setMasteryState(conceptId, MASTERY_STATES.practising, 1);
    } else if (!isCorrect) {
      setMasteryState(conceptId, MASTERY_STATES.learning, 1);
    }
  } else if (existing.state === MASTERY_STATES.practising) {
    if (isCorrect && accuracy >= MASTERY_THRESHOLD) {
      setMasteryState(conceptId, MASTERY_STATES.mastered, 1);
    } else if (!isCorrect) {
      setMasteryState(conceptId, MASTERY_STATES.learning, 1);
    }
  } else if (existing.state === MASTERY_STATES.needs_reinforcement) {
    if (isCorrect && accuracy >= MASTERY_THRESHOLD) {
      setMasteryState(conceptId, MASTERY_STATES.mastered, 1);
    }
  }
  // mastered state stays mastered
}

/* --------------------------------------------------------------- Utility */

function normalizeAnswerForCategorization(answer) {
  return String(answer || "").trim().toLowerCase();
}

function stripUnitsForCategorization(value) {
  return value.replace(/%/g, "").replace(/°/g, "").replace(/cm/gi, "").replace(/\^2/g, "").replace(/\s+/g, "").trim();
}

/**
 * Read mistake notebook from localStorage.
 */
function readMistakeNotebook() {
  try {
    const stored = JSON.parse(localStorage.getItem(MISTAKE_NOTEBOOK_KEY) || "null");
    if (stored && typeof stored === "object") {
      return stored;
    }
  } catch {
    /* corrupt or unavailable storage */
  }
  return {};
}

/**
 * Write mistake notebook to localStorage.
 */
function writeMistakeNotebook(notebook) {
  try {
    localStorage.setItem(MISTAKE_NOTEBOOK_KEY, JSON.stringify(notebook));
  } catch {
    /* storage blocked */
  }
}

/* --------------------------------------------------------------- Initialize mistake notebook from storage */

// Merge any existing mistake notebook entries into state
const storedMistakes = readMistakeNotebook();
if (Object.keys(storedMistakes).length > 0) {
  state.mistakes = { ...state.mistakes, ...storedMistakes };
}

/* --------------------------------------------------------------- Exports */

export {
  LESSON_ENGINE_KEY,
  MISTAKE_NOTEBOOK_KEY,
  MASTERY_STATES,
  LESSON_STATES,
  ERROR_CATEGORIES,
  MASTERY_THRESHOLD,
  onEngineChange,
  getLessonState,
  startLesson,
  setLessonPage,
  completeLesson,
  isLessonCompleted,
  getMasteryState,
  setMasteryState,
  isMastered,
  needsVerification,
  needsMasteryConfirmation,
  recordPracticeAttempt,
  getConfirmationQuestions,
  assessMastery,
  recordMistake,
  getMistakesForConcept,
  getAllMistakes,
  markMistakeReviewed,
  recordMistakeRetry,
  clearMistakesForConcept,
  resetEngineState,
};
