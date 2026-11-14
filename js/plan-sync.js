/**
 * Plan completion sync — shared between the study plan page and the lesson
 * reader. Both pages read/write the same localStorage key so that completing
 * a lesson in the reader auto-checks the corresponding task in "Today's
 * Learning", and vice versa.
 *
 * All data stays client-side in localStorage. Nothing is transmitted.
 */

const COMPLETION_KEY = "mathfunda-plan-completion-v1";

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

/**
 * Mark a plan task (concept) complete or incomplete.
 * @param {string} conceptId
 * @param {boolean} completed
 */
export function markPlanTaskComplete(conceptId, completed) {
  const completion = loadFromStorage(COMPLETION_KEY, {});
  completion[conceptId] = completed === true;
  saveToStorage(COMPLETION_KEY, completion);
}

/**
 * Read the full plan completion map { [conceptId]: boolean }.
 */
export function getPlanCompletion() {
  return loadFromStorage(COMPLETION_KEY, {});
}

/**
 * Check if a single plan task is complete.
 * @param {string} conceptId
 * @returns {boolean}
 */
export function isPlanTaskComplete(conceptId) {
  return Boolean(getPlanCompletion()[conceptId]);
}

export { COMPLETION_KEY };
