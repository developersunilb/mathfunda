/**
 * Content Model — Milestone 6
 *
 * Structured question/lesson content definitions with mathematical validation.
 * Independent of any UI — works on desktop, mobile and iPad.
 *
 * Key principles:
 * - Questions have structured solution steps for first-wrong-step detection
 * - Error categorization: conceptual, calculation, arithmetic, format
 * - All content is mathematically validated
 * - No hardcoded student results; everything is driven by content definitions
 */

const MASTERY_STATES = {
  not_started: "not_started",
  introduced: "introduced",
  learning: "learning",
  practising: "practising",
  needs_reinforcement: "needs_reinforcement",
  mastered: "mastered",
};

const LESSON_STATES = {
  not_started: "not_started",
  in_progress: "in_progress",
  completed: "completed",
};

const ERROR_CATEGORIES = {
  conceptual: "conceptual",      // Wrong method / misunderstanding
  calculation: "calculation",    // Right method, arithmetic error
  arithmetic: "arithmetic",      // Simple arithmetic mistake
  format: "format",              // Right answer, wrong formatting
};

const MASTERY_THRESHOLD = 0.8; // 80% accuracy for mastery confirmation

/* ----------------------------------------------------------- Question definitions */

/**
 * A structured step in a multi-step solution.
 * @property {number} step - Step number (1-based)
 * @property {string} text - LaTeX or plain text description
 * @property {string} expected - The expected intermediate answer
 * @property {string} explanation - Human-readable explanation of this step
 * @property {Object} errorTypes - Map of error category -> feedback message
 */
function step(stepNum, text, expected, explanation, errorTypes = {}) {
  return { step: stepNum, text, expected, explanation, errorTypes };
}

/**
 * A structured question definition.
 * @property {string} id - Stable question ID
 * @property {string} conceptId - Canonical concept this question assesses
 * @property {string} text - Question text (LaTeX or plain)
 * @property {string} instruction - What to do
 * @property {string} correctAnswer - Final correct answer
 * @property {step[]} steps - Structured solution steps (empty for single-answer)
 * @property {Object} errorTypes - Map of error category -> feedback message
 * @property {number} difficulty - 1 (easy) to 5 (hard)
 * @property {number} estimatedMinutes - Suggested solving time
 */
function createQuestion(id, conceptId, text, instruction, correctAnswer, steps = [], errorTypes = {}, difficulty = 1, estimatedMinutes = 5) {
  return {
    id,
    conceptId,
    text,
    instruction,
    correctAnswer,
    steps,
    errorTypes,
    difficulty,
    estimatedMinutes,
    type: steps.length > 0 ? "step-by-step" : "single-answer",
  };
}

/**
 * Single-answer question (no intermediate steps).
 */
function createSingleAnswerQuestion(id, conceptId, text, instruction, correctAnswer, errorTypes = {}, difficulty = 1, estimatedMinutes = 5) {
  return createQuestion(id, conceptId, text, instruction, correctAnswer, [], errorTypes, difficulty, estimatedMinutes);
}

/* ----------------------------------------------------------- Question bank */

// Foundation questions (linked to diagnostic concepts)
const QUESTION_BANK = {

  // ---- Numbers: Division ----
  "q-div-1": createSingleAnswerQuestion(
    "q-div-1", "real-numbers", "$348 \\div 12$", "Calculate", "29",
    {}, 1, 2
  ),
  "q-div-2": createSingleAnswerQuestion(
    "q-div-2", "real-numbers", "$144 \\div 12$", "Calculate", "12",
    {}, 1, 2
  ),

  // ---- Numbers: HCF & LCM ----
  "q-hcf-1": createSingleAnswerQuestion(
    "q-hcf-1", "hcf-lcm", "$18 \\text{ and } 24$", "Find the HCF", "6",
    {}, 2, 3
  ),
  "q-hcf-2": createSingleAnswerQuestion(
    "q-hcf-2", "hcf-lcm", "$18 \\text{ and } 24$", "Find the LCM", "72",
    {}, 2, 3
  ),
  "q-hcf-3": createSingleAnswerQuestion(
    "q-hcf-3", "hcf-lcm", "$20 \\text{ and } 30$", "Find the HCF", "10",
    {}, 1, 3
  ),

  // ---- Numbers: Exponents ----
  "q-exp-1": createSingleAnswerQuestion(
    "q-exp-1", "laws-exponents", "$2^3 \\times 2^2$", "Simplify", "32",
    {}, 2, 3
  ),
  "q-exp-2": createSingleAnswerQuestion(
    "q-exp-2", "laws-exponents", "$5^2 \\times 5^3$", "Simplify", "5^5",
    {}, 2, 3
  ),
  "q-exp-3": createSingleAnswerQuestion(
    "q-exp-3", "laws-exponents", "$(3^2)^3$", "Simplify", "3^6",
    {}, 2, 3
  ),

  // ---- Numbers: Decimal to Fraction ----
  "q-dec-1": createSingleAnswerQuestion(
    "q-dec-1", "fractions-decimals", "$0.375$", "Write as a fraction in simplest form", "3/8",
    {}, 2, 4
  ),
  "q-dec-2": createSingleAnswerQuestion(
    "q-dec-2", "fractions-decimals", "$0.6$", "Write as a fraction in simplest form", "3/5",
    {}, 1, 3
  ),
  "q-dec-3": createSingleAnswerQuestion(
    "q-dec-3", "fractions-decimals", "$0.125$", "Write as a fraction in simplest form", "1/8",
    {}, 2, 4
  ),

  // ---- Algebra: Expanding Brackets (Step-by-step) ----
  "q-brackets-1": createQuestion(
    "q-brackets-1", "expanding-brackets",
    "$3(x + 2)$", "Expand", "3x + 6",
    [
      step(1, "$3 \\times x + 3 \\times 2$", "Distribute the 3", "Multiply 3 by each term inside the brackets.", {
        conceptual: "Remember to multiply 3 by BOTH x and 2, not just the first term.",
      }),
      step(2, "$3x + 6$", "3x + 6", "Simplify: 3 × 2 = 6.", {
        arithmetic: "Check your arithmetic: 3 × 2 = 6.",
      }),
    ],
    {
      conceptual: "Remember the distributive property: a(b + c) = ab + ac.",
    },
    2, 5
  ),
  "q-brackets-2": createQuestion(
    "q-brackets-2", "expanding-brackets",
    "$4(2x - 3) + 5$", "Expand and simplify", "8x - 7",
    [
      step(1, "$4 \\times 2x - 4 \\times 3 + 5$", "Distribute the 4", "Multiply 4 by each term inside the brackets.", {
        conceptual: "Distribute the 4 to both terms: 4 × 2x and 4 × 3.",
      }),
      step(2, "$8x - 12 + 5$", "8x - 12 + 5", "Simplify: 4 × 2x = 8x, 4 × 3 = 12.", {
        arithmetic: "Check: 4 × 2x = 8x and 4 × 3 = 12.",
      }),
      step(3, "$8x - 7$", "8x - 7", "Combine like terms: -12 + 5 = -7.", {
        arithmetic: "Check: -12 + 5 = -7.",
      }),
    ],
    {
      conceptual: "Distribute first, then combine like terms at the end.",
    },
    3, 8
  ),
  "q-brackets-3": createQuestion(
    "q-brackets-3", "expanding-brackets",
    "$2(x - 5) + 3(x + 1)$", "Expand and simplify", "2x - 7",
    [
      step(1, "$2x - 10 + 3x + 3$", "Distribute both sets", "Distribute 2 and 3 respectively.", {
        conceptual: "Distribute 2 into (x - 5) and 3 into (x + 1) separately.",
      }),
      step(2, "$5x - 7$", "5x - 7", "Combine like terms: 2x + 3x = 5x, -10 + 3 = -7.", {
        arithmetic: "Check: 2x + 3x = 5x and -10 + 3 = -7.",
      }),
    ],
    {
      conceptual: "Watch the signs when distributing negative numbers.",
    },
    3, 8
  ),

  // ---- Algebra: Linear Equations ----
  "q-eq-1": createSingleAnswerQuestion(
    "q-eq-1", "linear-equations-one-var", "$3x + 7 = 22$", "Solve for x", "5",
    {}, 2, 4
  ),
  "q-eq-2": createSingleAnswerQuestion(
    "q-eq-2", "linear-equations-one-var", "$x/4 = 9$", "Solve for x", "36",
    {}, 1, 3
  ),
  "q-eq-3": createSingleAnswerQuestion(
    "q-eq-3", "linear-equations-one-var", "$2x - 5 = 11$", "Solve for x", "8",
    {}, 2, 4
  ),

  // ---- Coordinate Geometry: Midpoint ----
  "q-mid-1": createSingleAnswerQuestion(
    "q-mid-1", "midpoint", "Join (2, 4) and (8, 10)", "Find the midpoint", "(5, 7)",
    {}, 2, 4
  ),
  "q-mid-2": createSingleAnswerQuestion(
    "q-mid-2", "midpoint", "Join (0, 0) and (6, 8)", "Find the midpoint", "(3, 4)",
    {}, 2, 4
  ),
  "q-mid-3": createSingleAnswerQuestion(
    "q-mid-3", "midpoint", "Join (-2, 4) and (4, -2)", "Find the midpoint", "(1, 1)",
    {}, 3, 5
  ),

  // ---- Mensuration: Rectangle Area ----
  "q-area-1": createSingleAnswerQuestion(
    "q-area-1", "area-rectangle", "$9 \\text{ cm by } 4 \\text{ cm}$", "Find the area", "36 cm^2",
    {}, 1, 3
  ),
  "q-area-2": createSingleAnswerQuestion(
    "q-area-2", "area-rectangle", "$12 \\text{ cm by } 5 \\text{ cm}$", "Find the area", "60 cm^2",
    {}, 1, 3
  ),

  // ---- Mensuration: Perimeter ----
  "q-perim-1": createSingleAnswerQuestion(
    "q-perim-1", "perimeter", "$10 \\text{ cm by } 6 \\text{ cm}$", "Find the perimeter", "32 cm",
    {}, 1, 3
  ),
  "q-perim-2": createSingleAnswerQuestion(
    "q-perim-2", "perimeter", "$7 \\text{ cm by } 3 \\text{ cm}$", "Find the perimeter", "20 cm",
    {}, 1, 3
  ),

  // ---- Numbers: Rounding ----
  "q-round-1": createSingleAnswerQuestion(
    "q-round-1", "rounding-placevalue", "$5.678$", "Round to two decimal places", "5.68",
    {}, 2, 3
  ),
  "q-round-2": createSingleAnswerQuestion(
    "q-round-2", "rounding-placevalue", "$3.14159$", "Round to two decimal places", "3.14",
    {}, 2, 3
  ),

  // ---- Numbers: Ratio ----
  "q-ratio-1": createSingleAnswerQuestion(
    "q-ratio-1", "ratio-proportion", "£60 in ratio 2:3", "First person's share", "£24",
    {}, 2, 4
  ),
  "q-ratio-2": createSingleAnswerQuestion(
    "q-ratio-2", "ratio-proportion", "300 ml red paint ratio 3:1", "Blue paint needed", "100 ml",
    {}, 2, 4
  ),
};

/**
 * Get all questions for a concept.
 */
function getQuestionsForConcept(conceptId) {
  return Object.values(QUESTION_BANK).filter((q) => q.conceptId === conceptId);
}

/**
 * Get a question by ID.
 */
function getQuestion(questionId) {
  return QUESTION_BANK[questionId] || null;
}

/**
 * Get all question IDs.
 */
function getAllQuestionIds() {
  return Object.keys(QUESTION_BANK);
}

/* ----------------------------------------------------------- Answer equivalence */

/**
 * Normalise an answer string for comparison.
 */
function normalizeAnswer(answer) {
  if (answer === null || answer === undefined) return null;
  return String(answer).trim().toLowerCase();
}

/**
 * Remove units for numeric comparison.
 */
function stripUnits(value) {
  return value
    .replace(/%/g, "")
    .replace(/°/g, "")
    .replace(/cm/gi, "")
    .replace(/\^2/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * Try to parse a value as a number, including fractions like "5/4".
 */
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

/**
 * Extract final value from equation-style answers ("x = 5" -> "5").
 */
function extractFinalValue(value) {
  const cleaned = normalizeAnswer(value);
  if (!cleaned) return null;
  const eqParts = cleaned.split("=");
  if (eqParts.length > 1) return eqParts[eqParts.length - 1].trim();
  const colonParts = cleaned.split(":");
  if (colonParts.length > 1) return colonParts[colonParts.length - 1].trim();
  return null;
}

/**
 * Check whether a student answer is equivalent to the correct answer.
 * Supports exact match, unit-stripped match, numeric/fraction comparison,
 * and extraction of final value from equation-style answers.
 */
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

/* ----------------------------------------------------------- Content validation */

/**
 * Validate a single question definition for mathematical correctness.
 * Returns { valid: boolean, errors: string[] }.
 */
function validateQuestion(question) {
  const errors = [];

  if (!question.id || typeof question.id !== "string") {
    errors.push("Question missing valid id.");
  }
  if (!question.conceptId || typeof question.conceptId !== "string") {
    errors.push("Question missing valid conceptId.");
  }
  if (!question.text || typeof question.text !== "string") {
    errors.push("Question missing text.");
  }
  if (!question.instruction || typeof question.instruction !== "string") {
    errors.push("Question missing instruction.");
  }
  if (!question.correctAnswer || typeof question.correctAnswer !== "string") {
    errors.push("Question missing correctAnswer.");
  }
  if (!Array.isArray(question.steps)) {
    errors.push("Question steps must be an array.");
  } else {
    question.steps.forEach((step, idx) => {
      if (!step.text || typeof step.text !== "string") {
        errors.push(`Step ${idx + 1}: missing text.`);
      }
      if (!step.expected || typeof step.expected !== "string") {
        errors.push(`Step ${idx + 1}: missing expected answer.`);
      }
    });
  }
  if (question.difficulty === undefined || question.difficulty < 1 || question.difficulty > 5) {
    errors.push("Question difficulty must be 1-5.");
  }
  if (question.estimatedMinutes === undefined || question.estimatedMinutes < 1) {
    errors.push("Question estimatedMinutes must be >= 1.");
  }

  // Verify the correct answer is not empty or placeholder
  const placeholderPatterns = ["todo", "tbd", "xxx", "answer here", "insert"];
  const lowerAnswer = question.correctAnswer.toLowerCase();
  if (placeholderPatterns.some((p) => lowerAnswer.includes(p))) {
    errors.push(`correctAnswer "${question.correctAnswer}" appears to be a placeholder.`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate all questions in the bank.
 */
function validateAllQuestions() {
  const allErrors = [];
  for (const [id, question] of Object.entries(QUESTION_BANK)) {
    const result = validateQuestion(question);
    if (!result.valid) {
      allErrors.push(`Question ${id}: ${result.errors.join(", ")}`);
    }
  }
  return { valid: allErrors.length === 0, errors: allErrors };
}

/* ----------------------------------------------------------- Exports */

export {
  MASTERY_STATES,
  LESSON_STATES,
  ERROR_CATEGORIES,
  MASTERY_THRESHOLD,
  createQuestion,
  createSingleAnswerQuestion,
  step,
  QUESTION_BANK,
  getQuestionsForConcept,
  getQuestion,
  getAllQuestionIds,
  normalizeAnswer,
  stripUnits,
  tryParseNumber,
  extractFinalValue,
  answersEquivalent,
  validateQuestion,
  validateAllQuestions,
};
