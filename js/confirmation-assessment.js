/**
 * Adaptive Learning Engine — Milestone 2: Confirmation Assessments
 *
 * Short, encouraging confirmation activities for concepts flagged as
 * needs_verification after the diagnostic.
 *
 * Design principles:
 *   - New questions, not repetitions of diagnostic questions
 *   - Immediate feedback after submission
 *   - Recorded separately from the original diagnostic
 *   - Incorrect → learning; Correct → not_started (until sufficient evidence)
 *   - Retry without penalty
 *   - Feels like a quick check, not another examination
 */

const CONFIRMATION_RESULTS_KEY = "mathfunda-confirmation-results-v1";

/**
 * Confirmation assessment questions for concepts flagged needs_verification.
 * Each question is independent and can be retried without penalty.
 */
const CONFIRMATION_QUESTIONS = {
  "numbers-ratio-proportion": [
    {
      id: "ratio-confirm-1",
      conceptId: "numbers-ratio-proportion",
      text: "Share £60 between two people in the ratio 2:3. How much does the first person get?",
      instruction: "Calculate",
      correctAnswer: "24",
      hint: "The ratio 2:3 means 5 equal parts total. £60 ÷ 5 = £12 per part. The first person gets 2 parts.",
    },
    {
      id: "ratio-confirm-2",
      conceptId: "numbers-ratio-proportion",
      text: "A paint mixture uses red and blue paint in the ratio 3:1. If 300 ml of red paint is used, how much blue paint is needed?",
      instruction: "Calculate",
      correctAnswer: "100 ml",
      hint: "The ratio 3:1 means for every 3 parts red, there is 1 part blue. 300 ml ÷ 3 = 100 ml per part.",
    },
  ],
  "mensuration-rectangle-area": [
    {
      id: "area-confirm-1",
      conceptId: "mensuration-rectangle-area",
      text: "Find the area of a rectangle measuring 9 cm long and 4 cm wide.",
      instruction: "Calculate",
      correctAnswer: "36 cm²",
      hint: "Area of a rectangle = length × width. 9 × 4 = 36.",
    },
  ],
  "mixed-rounding-placevalue": [
    {
      id: "rounding-confirm-1",
      conceptId: "mixed-rounding-placevalue",
      text: "Round 5.678 to two decimal places.",
      instruction: "Round",
      correctAnswer: "5.68",
      hint: "Look at the third decimal digit (8). Since 8 ≥ 5, round the second digit up: 5.67 → 5.68.",
    },
  ],
  "mensuration-perimeter": [
    {
      id: "perimeter-confirm-1",
      conceptId: "mensuration-perimeter",
      text: "Find the perimeter of a rectangle measuring 10 cm by 6 cm.",
      instruction: "Calculate",
      correctAnswer: "32 cm",
      hint: "Perimeter of a rectangle = 2 × (length + width). 2 × (10 + 6) = 2 × 16 = 32.",
    },
  ],
  "coordinates-midpoint": [
    {
      id: "midpoint-confirm-1",
      conceptId: "coordinates-midpoint",
      text: "Find the midpoint of the segment joining (2, 4) and (8, 10).",
      instruction: "Calculate",
      correctAnswer: "(5, 7)",
      hint: "Midpoint formula: ((x₁+x₂)÷2, (y₁+y₂)÷2). ((2+8)÷2, (4+10)÷2) = (5, 7).",
    },
  ],
};

/**
 * Read confirmation results from localStorage.
 */
function readConfirmationResults() {
  try {
    const stored = localStorage.getItem(CONFIRMATION_RESULTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* corrupt or unavailable storage */
  }
  return [];
}

/**
 * Save confirmation results to localStorage.
 */
function saveConfirmationResults(results) {
  try {
    localStorage.setItem(CONFIRMATION_RESULTS_KEY, JSON.stringify(results));
  } catch {
    /* storage may be full or blocked */
  }
}

/**
 * Get confirmation results for a specific concept.
 */
function getConfirmationResultsForConcept(conceptId) {
  const all = readConfirmationResults();
  return all.filter((r) => r.conceptId === conceptId);
}

/**
 * Record a confirmation assessment response.
 * Stored separately from diagnostic results — never overwrites diagnostic data.
 *
 * Each record includes an attempt ID (shared across all responses in one
 * confirmation session) and the concept classification at the time of the
 * response, so assessment history is preserved over time.
 */
let currentAttemptId = null;

function startConfirmationAttempt() {
  currentAttemptId = `confirm-${Date.now()}`;
  return currentAttemptId;
}

function getCurrentAttemptId() {
  return currentAttemptId;
}

function recordConfirmationResponse(conceptId, questionId, studentAnswer, isCorrect, timeSeconds) {
  const results = readConfirmationResults();

  const entry = {
    id: Date.now().toString(),
    attemptId: currentAttemptId || `confirm-${Date.now()}`,
    conceptId,
    questionId,
    studentAnswer,
    isCorrect,
    timeSeconds,
    answeredAt: new Date().toISOString(),
    type: "confirmation",
    classification: getConfirmationMasteryState(conceptId),
  };

  results.push(entry);
  saveConfirmationResults(results);
  return entry;
}

/**
 * Determine if a concept has sufficient confirmation evidence to move
 * from needs_verification to not_started.
 *
 * Rule: A concept moves to not_started when at least one confirmation
 * question has been answered correctly.
 */
function hasConfirmationEvidence(conceptId) {
  const results = getConfirmationResultsForConcept(conceptId);
  return results.some((r) => r.isCorrect);
}

/**
 * Get the next confirmation question for a concept that hasn't been
 * answered correctly yet.
 */
function getNextConfirmationQuestion(conceptId) {
  const questions = CONFIRMATION_QUESTIONS[conceptId];
  if (!questions) return null;

  const results = getConfirmationResultsForConcept(conceptId);
  const answeredQuestionIds = new Set(results.map((r) => r.questionId));

  // Return an unanswered question, or the first question if all have been attempted
  for (const q of questions) {
    if (!answeredQuestionIds.has(q.id)) return q;
  }

  // All questions attempted — return null (no more new questions)
  return null;
}

/**
 * Check whether all confirmation questions for a concept have been
 * attempted at least once.
 */
function allConfirmationQuestionsAttempted(conceptId) {
  const questions = CONFIRMATION_QUESTIONS[conceptId];
  if (!questions) return true;

  const results = getConfirmationResultsForConcept(conceptId);
  const attemptedQuestionIds = new Set(results.map((r) => r.questionId));

  return questions.every((q) => attemptedQuestionIds.has(q.id));
}

/**
 * Determine the mastery state for a concept based on confirmation results.
 *
 * Passing threshold: ALL confirmation questions for a concept must be correct
 * before the concept moves from needs_verification to not_started.
 *
 * Transitions:
 *   needs_verification + all questions correct → not_started
 *   needs_verification + some correct, some not → needs_verification (can retry)
 *   needs_verification + all attempted, none correct → learning
 *   needs_verification + some attempted, none correct yet → needs_verification (can retry)
 */
function getConfirmationMasteryState(conceptId) {
  const results = getConfirmationResultsForConcept(conceptId);
  const questions = CONFIRMATION_QUESTIONS[conceptId];
  const totalQuestions = questions ? questions.length : 0;

  if (results.length === 0) return "needs_verification";

  const correctCount = results.filter((r) => r.isCorrect).length;

  // All questions must be correct to confirm mastery
  if (correctCount === totalQuestions && totalQuestions > 0) {
    return "not_started";
  }

  // All questions attempted but none correct → confirmed weakness
  if (allConfirmationQuestionsAttempted(conceptId) && correctCount === 0) {
    return "learning";
  }

  // Some attempted, not all correct yet → can retry
  return "needs_verification";
}

/**
 * Get all concepts that need confirmation assessment.
 */
function getConceptsNeedingConfirmation(concepts) {
  return Object.values(concepts).filter(
    (c) => c.masteryState === "needs_verification" && c.assessmentRequired
  );
}

/**
 * Clear confirmation results for a concept (allows full retry).
 */
function clearConfirmationResultsForConcept(conceptId) {
  try {
    const all = readConfirmationResults();
    const filtered = all.filter((r) => r.conceptId !== conceptId);
    localStorage.setItem(CONFIRMATION_RESULTS_KEY, JSON.stringify(filtered));
  } catch {
    /* storage blocked */
  }
}

/**
 * Clear all confirmation results.
 */
function clearAllConfirmationResults() {
  try {
    localStorage.removeItem(CONFIRMATION_RESULTS_KEY);
  } catch {
    /* storage blocked */
  }
}

export {
  CONFIRMATION_RESULTS_KEY,
  CONFIRMATION_QUESTIONS,
  readConfirmationResults,
  saveConfirmationResults,
  getConfirmationResultsForConcept,
  recordConfirmationResponse,
  hasConfirmationEvidence,
  getNextConfirmationQuestion,
  allConfirmationQuestionsAttempted,
  getConfirmationMasteryState,
  getConceptsNeedingConfirmation,
  clearConfirmationResultsForConcept,
  clearAllConfirmationResults,
  startConfirmationAttempt,
};
