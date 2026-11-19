/**
 * Pilot Events — minimal event emitter for the Stage 3 learning study.
 *
 * Emits lightweight events at key points in the learning flow.
 * Events are stored in localStorage for later retrieval by the observer.
 * No personal information, no answer text, no analytics framework.
 *
 * Design principles:
 *   - Smallest possible event payload
 *   - Clearly separated from learning logic
 *   - No new analytics framework
 *   - Events persist in localStorage only
 */

const STORAGE_KEY = "mathfunda-pilot-events-v1";

let listeners = new Set();

function readEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function writeEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    /* storage may be full or blocked */
  }
}

function appendEvent(type, payload = {}) {
  const events = readEvents();
  const event = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    timestamp: Date.now(),
    ...payload,
  };
  events.push(event);
  writeEvents(events);
  listeners.forEach((listener) => listener(event));
  return event;
}

/**
 * Subscribe to pilot events.
 * @param {Function} listener - Called with each event object
 * @returns {Function} Unsubscribe function
 */
export function onPilotEvent(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Get all stored pilot events.
 * @returns {Array}
 */
export function getPilotEvents() {
  return readEvents();
}

/**
 * Clear all stored pilot events (for testing / fresh session).
 */
export function clearPilotEvents() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked */
  }
}

/* --------------------------------------------------------------- Event emitters */

/**
 * Learner enters a lesson concept (reader boot).
 * @param {string} conceptId
 */
export function emitLessonStarted(conceptId) {
  return appendEvent("lesson_started", { conceptId });
}

/**
 * Practice session begins.
 * @param {string} conceptId
 * @param {number} questionCount
 */
export function emitPracticeStarted(conceptId, questionCount) {
  return appendEvent("practice_started", { conceptId, questionCount });
}

/**
 * Individual answer attempt.
 * @param {string} questionId
 * @param {boolean} isCorrect
 * @param {string|null} errorCategory
 * @param {string} conceptId
 */
export function emitPracticeAnswered(questionId, isCorrect, errorCategory, conceptId) {
  return appendEvent("practice_answered", {
    questionId,
    isCorrect,
    errorCategory,
    conceptId,
  });
}

/**
 * Targeted misconception explanation triggered.
 * @param {string} conceptId
 * @param {string} misconceptionDescription
 * @param {number} originalQuestionIndex
 */
export function emitMisconceptionInterventionShown(
  conceptId,
  misconceptionDescription,
  originalQuestionIndex
) {
  return appendEvent("misconception_intervention_shown", {
    conceptId,
    misconceptionDescription,
    originalQuestionIndex,
  });
}

/**
 * Intervention finished, returned to practice.
 * @param {string} conceptId
 * @param {number} correctiveQuestionsCount
 */
export function emitMisconceptionInterventionCompleted(
  conceptId,
  correctiveQuestionsCount
) {
  return appendEvent("misconception_intervention_completed", {
    conceptId,
    correctiveQuestionsCount,
  });
}

/**
 * Practice session ends.
 * @param {string} conceptId
 * @param {number} accuracy
 * @param {number} totalQuestions
 * @param {boolean} masteryAssessed
 * @param {boolean|null} masteryPassed
 */
export function emitPracticeCompleted(
  conceptId,
  accuracy,
  totalQuestions,
  masteryAssessed,
  masteryPassed
) {
  return appendEvent("practice_completed", {
    conceptId,
    accuracy,
    totalQuestions,
    masteryAssessed,
    masteryPassed,
  });
}

/**
 * Mastery confirmation run.
 * @param {string} conceptId
 * @param {boolean} passed
 * @param {number} accuracy
 * @param {number} threshold
 */
export function emitMasteryAssessed(conceptId, passed, accuracy, threshold) {
  return appendEvent("mastery_assessed", {
    conceptId,
    passed,
    accuracy,
    threshold,
  });
}

/**
 * Memory Journey opened after practice.
 * @param {string} conceptId
 * @param {number} elementCount
 */
export function emitMemoryJourneyStarted(conceptId, elementCount) {
  return appendEvent("memory_journey_started", { conceptId, elementCount });
}

/**
 * A recall prompt displayed to learner.
 * @param {string} conceptId
 * @param {number} elementIndex
 * @param {string} elementType
 * @param {boolean} hasRecallPrompt
 */
export function emitMemoryRecallShown(
  conceptId,
  elementIndex,
  elementType,
  hasRecallPrompt
) {
  return appendEvent("memory_recall_shown", {
    conceptId,
    elementIndex,
    elementType,
    hasRecallPrompt,
  });
}

/**
 * Learner revealed the recall answer.
 * @param {string} conceptId
 * @param {number} elementIndex
 * @param {string} elementType
 */
export function emitMemoryRevealUsed(conceptId, elementIndex, elementType) {
  return appendEvent("memory_reveal_used", {
    conceptId,
    elementIndex,
    elementType,
  });
}

/**
 * Memory Journey finished (reached last element).
 * @param {string} conceptId
 * @param {number} elementsViewed
 * @param {number} recallsShown
 * @param {number} revealsUsed
 */
export function emitMemoryJourneyCompleted(
  conceptId,
  elementsViewed,
  recallsShown,
  revealsUsed
) {
  return appendEvent("memory_journey_completed", {
    conceptId,
    elementsViewed,
    recallsShown,
    revealsUsed,
  });
}

/**
 * Learner closed Memory Journey early.
 * @param {string} conceptId
 * @param {number} elementIndex
 * @param {number} elementsViewed
 * @param {number} recallsShown
 * @param {number} revealsUsed
 */
export function emitMemoryJourneyExited(
  conceptId,
  elementIndex,
  elementsViewed,
  recallsShown,
  revealsUsed
) {
  return appendEvent("memory_journey_exited", {
    conceptId,
    elementIndex,
    elementsViewed,
    recallsShown,
    revealsUsed,
  });
}
