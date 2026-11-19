/**
 * Lesson Intelligence — logic only.
 *
 * Responsibilities:
 *   - Look up a teaching strategy for a concept (from content-model.js LESSON_STRATEGIES).
 *   * Validate that a strategy has the required shape.
 *   * Resolve an ordered teaching sequence (blocks) from a strategy.
 *
 * This module contains no concept-specific rendering logic and no content data.
 * Content lives in content-model.js; rendering lives in reader.js (not yet wired).
 */

import { LESSON_STRATEGIES, getLessonStrategy } from "./content-model.js";

/**
 * Valid block types understood by the renderer.
 * This list is structural, not concept-specific.
 */
const VALID_BLOCK_TYPES = new Set([
  "story",
  "prediction",
  "visual",
  "interactive",
  "discovery",
  "worked-example",
  "guided-practice",
  "independent-practice",
  "explain",
  "misconception-intervention",
  "memory-hook",
  "mastery",
]);

/* --------------------------------------------------------------- Strategy lookup */

/**
 * Get the teaching strategy for a concept.
 * Returns null if no strategy is defined for the concept.
 * @param {string} conceptId
 * @returns {Object|null}
 */
export function getStrategy(conceptId) {
  return getLessonStrategy(conceptId);
}

/* --------------------------------------------------------------- Validation */

/**
 * Validate a teaching strategy's structure.
 * Returns { valid: boolean, errors: string[] }.
 *
 * Required: conceptId, learningGoal, teachingStrategy.primary,
 *   experience.blocks (non-empty array of blocks with type + content).
 * Optional: prerequisiteConcepts, teachingStrategy.supporting,
 *   teachingStrategy.interaction, misconception, mastery, retrieval.
 *
 * Block shape required: type (one of VALID_BLOCK_TYPES), content (string).
 * Questions are optional arrays of question IDs.
 * @param {Object} strategy
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateStrategy(strategy) {
  const errors = [];

  if (!strategy || typeof strategy !== "object") {
    return { valid: false, errors: ["Strategy must be an object"] };
  }

  if (typeof strategy.conceptId !== "string" || !strategy.conceptId.trim()) {
    errors.push("conceptId is required and must be a non-empty string");
  }

  if (
    typeof strategy.learningGoal !== "string" ||
    !strategy.learningGoal.trim()
  ) {
    errors.push("learningGoal is required and must be a non-empty string");
  }

  if (!strategy.teachingStrategy || typeof strategy.teachingStrategy !== "object") {
    errors.push("teachingStrategy is required and must be an object");
  } else {
    if (
      typeof strategy.teachingStrategy.primary !== "string" ||
      !strategy.teachingStrategy.primary.trim()
    ) {
      errors.push("teachingStrategy.primary is required and must be a non-empty string");
    }
  }

  if (!strategy.experience || typeof strategy.experience !== "object") {
    errors.push("experience is required and must be an object");
  } else if (!Array.isArray(strategy.experience.blocks)) {
    errors.push("experience.blocks is required and must be an array");
  } else if (strategy.experience.blocks.length === 0) {
    errors.push("experience.blocks must contain at least one block");
  } else {
    strategy.experience.blocks.forEach((block, index) => {
      if (!block || typeof block !== "object") {
        errors.push(`Block ${index} must be an object`);
        return;
      }
      if (
        typeof block.type !== "string" ||
        !VALID_BLOCK_TYPES.has(block.type)
      ) {
        errors.push(
          `Block ${index} has invalid type "${block.type}". Must be one of: ${[...VALID_BLOCK_TYPES].join(", ")}`
        );
      }
      if (typeof block.content !== "string" || !block.content.trim()) {
        errors.push(`Block ${index} (${block.type}) must have non-empty content`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/* --------------------------------------------------------------- Sequence resolution */

/**
 * Resolve an ordered teaching sequence from a strategy.
 * Returns the block list from experience.blocks, preserving order.
 * Blocks with empty question arrays are retained (practice blocks may be
 * rendered from Markdown content rather than question IDs).
 *
 * @param {Object} strategy
 * @returns {Object[]} Ordered block list, or empty array if no blocks.
 */
export function resolveSequence(strategy) {
  if (!strategy || !strategy.experience || !Array.isArray(strategy.experience.blocks)) {
    return [];
  }
  return [...strategy.experience.blocks];
}

/* --------------------------------------------------------------- Composition resolution */

/**
 * Valid composition types.
 */
const VALID_COMPOSITION_TYPES = new Set(["enhanced", "led"]);

/**
 * Get the composition type of a strategy.
 * Returns "enhanced" or "led". Defaults to "led".
 * @param {Object} strategy
 * @returns {string}
 */
export function getCompositionType(strategy) {
  if (!strategy || typeof strategy.composition !== "string") {
    return "led";
  }
  return VALID_COMPOSITION_TYPES.has(strategy.composition) ? strategy.composition : "led";
}

/**
 * Resolve composition into intro blocks, outro blocks, and led blocks.
 *
 * For "enhanced" composition:
 *   introBlocks — blocks with placement "before" (render before Markdown)
 *   outroBlocks — blocks with placement "after" (render after Markdown)
 *   ledBlocks — empty array
 *
 * For "led" composition:
 *   introBlocks — empty array
 *   outroBlocks — empty array
 *   ledBlocks — all blocks in order (render as main content)
 *
 * @param {Object} strategy
 * @returns {{introBlocks: Object[], outroBlocks: Object[], ledBlocks: Object[]}}
 */
export function resolveComposition(strategy) {
  const result = {
    introBlocks: [],
    outroBlocks: [],
    ledBlocks: [],
  };

  if (!strategy || !strategy.experience || !Array.isArray(strategy.experience.blocks)) {
    return result;
  }

  const composition = getCompositionType(strategy);

  if (composition === "enhanced") {
    strategy.experience.blocks.forEach((block) => {
      if (block.placement === "after") {
        result.outroBlocks.push(block);
      } else {
        // Default placement for enhanced is "before"
        result.introBlocks.push(block);
      }
    });
  } else {
    // led: all blocks are main content
    result.ledBlocks = [...strategy.experience.blocks];
  }

  return result;
}

/**
 * Check whether a concept uses "enhanced" composition.
 * @param {string} conceptId
 * @returns {boolean}
 */
export function isEnhancedComposition(conceptId) {
  const strategy = getLessonStrategy(conceptId);
  return strategy ? getCompositionType(strategy) === "enhanced" : false;
}

/**
 * Check whether a concept uses "led" composition.
 * @param {string} conceptId
 * @returns {boolean}
 */
export function isLedComposition(conceptId) {
  const strategy = getLessonStrategy(conceptId);
  return strategy ? getCompositionType(strategy) === "led" : false;
}

/**
 * Check whether a concept has a defined teaching strategy.
 * @param {string} conceptId
 * @returns {boolean}
 */
export function hasStrategy(conceptId) {
  return getLessonStrategy(conceptId) !== null;
}

/**
 * Return the list of concept IDs that have defined strategies.
 * @returns {string[]}
 */
export function listStrategies() {
  return Object.keys(LESSON_STRATEGIES);
}

/* --------------------------------------------------------------- Misconception matching */

/**
 * Error information collected when a learner makes a mistake.
 * @typedef {Object} ErrorInfo
 * @property {string} errorCategory - One of ERROR_CATEGORIES values
 * @property {string} studentAnswer - The learner's answer
 * @property {Object|null} firstWrongStep - First wrong step details, if step-by-step
 */

/**
 * Match a mistake to a known misconception for a concept.
 *
 * Matching rules (all must hold):
 *   - errorCategory must match one of the misconception's errorSignals
 *   - If studentAnswerPattern is defined, it must test against studentAnswer
 *   - If stepTextContains is defined, it must be included in firstWrongStep.stepText
 *   - All defined signals within a matching errorCategory must match
 *
 * Returns the misconception object if a reliable match is found, otherwise null.
 * @param {string} conceptId
 * @param {ErrorInfo} errorInfo
 * @returns {Object|null}
 */
export function matchMisconception(conceptId, errorInfo) {
  const strategy = getLessonStrategy(conceptId);
  if (!strategy || !strategy.misconception) {
    return null;
  }

  const misconception = strategy.misconception;
  if (!misconception.errorSignals || !Array.isArray(misconception.errorSignals)) {
    return null;
  }

  const { errorCategory, studentAnswer, firstWrongStep } = errorInfo || {};

  for (const signal of misconception.errorSignals) {
    // Error category must match
    if (signal.errorCategory && signal.errorCategory !== errorCategory) {
      continue;
    }

    // Student answer pattern must match if defined
    if (signal.studentAnswerPattern) {
      const pattern =
        typeof signal.studentAnswerPattern === "string"
          ? new RegExp(signal.studentAnswerPattern, "i")
          : signal.studentAnswerPattern;
      if (!pattern.test(studentAnswer || "")) {
        continue;
      }
    }

    // Step text must contain keyword if defined
    if (signal.stepTextContains) {
      if (!firstWrongStep || !firstWrongStep.stepText) {
        continue;
      }
      if (!firstWrongStep.stepText.toLowerCase().includes(signal.stepTextContains.toLowerCase())) {
        continue;
      }
    }

    // All signals in this entry matched
    return misconception;
  }

  return null;
}

/**
 * Get the misconception data for a concept, if any.
 * @param {string} conceptId
 * @returns {Object|null}
 */
export function getMisconception(conceptId) {
  const strategy = getLessonStrategy(conceptId);
  return strategy ? strategy.misconception || null : null;
}

/**
 * Check whether a concept has a defined misconception.
 * @param {string} conceptId
 * @returns {boolean}
 */
export function hasMisconception(conceptId) {
  return getMisconception(conceptId) !== null;
}

/* --------------------------------------------------------------- Memory Journey */

/**
 * Get the memory journey data for a concept, if any.
 * Returns the journey object with elements array, or null.
 * @param {string} conceptId
 * @returns {Object|null}
 */
export function getMemoryJourney(conceptId) {
  const strategy = getLessonStrategy(conceptId);
  return strategy ? strategy.memoryJourney || null : null;
}

/**
 * Check whether a concept has a defined memory journey.
 * @param {string} conceptId
 * @returns {boolean}
 */
export function hasMemoryJourney(conceptId) {
  return getMemoryJourney(conceptId) !== null;
}
