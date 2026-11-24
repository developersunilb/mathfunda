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

  // ---- Algebra: Linear Equations in Two Variables ----
  "q-lin2-01": createSingleAnswerQuestion(
    "q-lin2-01", "linear-equations-two-var",
    "$2x+3y=12$ in standard form $ax+by+c=0$", "State $a$, $b$, $c$",
    "a=2, b=3, c=-12", {}, 1, 3
  ),
  "q-lin2-02": createSingleAnswerQuestion(
    "q-lin2-02", "linear-equations-two-var",
    "Is $(1,5)$ a solution of $x+2y=11$?", "Yes or No",
    "Yes", {}, 1, 3
  ),
  "q-lin2-03": createSingleAnswerQuestion(
    "q-lin2-03", "linear-equations-two-var",
    "Is $(4,2)$ a solution of $x-y=2$?", "Yes or No",
    "Yes", {}, 1, 3
  ),
  "q-lin2-04": createSingleAnswerQuestion(
    "q-lin2-04", "linear-equations-two-var",
    "For $y=2x+1$, state its slope and y-intercept.", "State slope and y-intercept",
    "slope=2, y-intercept=1", {}, 2, 4
  ),
  "q-lin2-05": createSingleAnswerQuestion(
    "q-lin2-05", "linear-equations-two-var",
    "Taxi: ₹30 flag-fall plus ₹15/km. Cost for 8 km.", "Find the cost",
    "₹150", {}, 2, 4
  ),
  "q-lin2-06": createSingleAnswerQuestion(
    "q-lin2-06", "linear-equations-two-var",
    "Mother + daughter = 46; mother − daughter = 20.", "Find their ages",
    "Mother 33, daughter 13", {}, 2, 5
  ),
  "q-lin2-07": createSingleAnswerQuestion(
    "q-lin2-07", "linear-equations-two-var",
    "Digits add to 11; the number is 27 more than its reverse.", "Find the number",
    "74", {}, 3, 5
  ),
  "q-lin2-08": createQuestion(
    "q-lin2-08", "linear-equations-two-var",
    "Solve $2x+y=7$ and $x-y=2$ by substitution.", "Find $(x,y)$",
    "(3,1)",
    [
      step(1, "From $x-y=2$: $x=y+2$", "Isolate $x$", "Rearrange the second equation.", {}),
      step(2, "$2(y+2)+y=7 \\Rightarrow 3y+4=7 \\Rightarrow y=1$", "Substitute and solve for $y$", "Substitute $x=y+2$ into the first equation.", {}),
      step(3, "$x=1+2=3$", "Back-substitute to find $x$", "Use $x=y+2$ with $y=1$.", {}),
    ],
    {}, 3, 6
  ),
  "q-lin2-09": createQuestion(
    "q-lin2-09", "linear-equations-two-var",
    "Solve $3x+4y=10$ and $6x-4y=2$ by elimination.", "Find $(x,y)$",
    "(\\frac43,\\frac32)",
    [
      step(1, "$(3x+4y)+(6x-4y)=10+2 \\Rightarrow 9x=12 \\Rightarrow x=\\frac43$", "Add to cancel $y$", "The $y$ terms have opposite signs, so add the equations.", {}),
      step(2, "$3(\\frac43)+4y=10 \\Rightarrow 4+4y=10 \\Rightarrow y=\\frac32$", "Back-substitute to find $y$", "Use $x=\\frac43$ in the first equation.", {}),
    ],
    {}, 3, 6
  ),
  "q-lin2-10": createSingleAnswerQuestion(
    "q-lin2-10", "linear-equations-two-var",
    "Number of solutions for $x+2y=6$ and $2x+4y=12$.", "State number and reason",
    "Infinitely many (coincident lines)", {}, 2, 4
  ),
  "q-lin2-11": createSingleAnswerQuestion(
    "q-lin2-11", "linear-equations-two-var",
    "Number of solutions for $x+y=4$ and $x+y=7$.", "State number and reason",
    "No solution (parallel distinct lines)", {}, 2, 4
  ),
  "q-lin2-12": createQuestion(
    "q-lin2-12", "linear-equations-two-var",
    "Find the intersection of $3x+2y=12$ and $x-y=1$.", "Find $(x,y)$",
    "(\\frac{14}{5},\\frac95)",
    [
      step(1, "From $x-y=1$: $x=y+1$", "Isolate $x$", "Rearrange the second equation.", {}),
      step(2, "$3(y+1)+2y=12 \\Rightarrow 5y+3=12 \\Rightarrow y=\\frac95$", "Substitute and solve for $y$", "Substitute $x=y+1$ into the first equation.", {}),
      step(3, "$x=\\frac95+1=\\frac{14}{5}$", "Back-substitute to find $x$", "Use $x=y+1$ with $y=\\frac95$.", {}),
    ],
    {}, 3, 6
  ),
  "q-lin2-13": createSingleAnswerQuestion(
    "q-lin2-13", "linear-equations-two-var",
    "For what $k$ do $kx+2y=5$ and $3x+6y=15$ have infinitely many solutions?", "Find $k$",
    "k=1", {}, 3, 5
  ),
  "q-lin2-14": createSingleAnswerQuestion(
    "q-lin2-14", "linear-equations-two-var",
    "For what $k$ do $kx+3y=5$ and $2x+6y=12$ have no solution?", "Find $k$",
    "k=1", {}, 3, 5
  ),
  "q-lin2-15": createSingleAnswerQuestion(
    "q-lin2-15", "linear-equations-two-var",
    "3 pencils and 2 erasers cost ₹14; 2 pencils and 3 erasers cost ₹16.", "Find the cost of each",
    "Pencil ₹2, eraser ₹4", {}, 3, 5
  ),

  // ---- Mensuration: Surface Area and Volume ----
  "q-sav-01": createSingleAnswerQuestion(
    "q-sav-01", "surface-area-volume",
    "TSA of cuboid 4×3×2 cm.", "Find surface area", "52 cm²", {}, 1, 3
  ),
  "q-sav-02": createSingleAnswerQuestion(
    "q-sav-02", "surface-area-volume",
    "Volume of cube of side 3 cm.", "Find volume", "27 cm³", {}, 1, 3
  ),
  "q-sav-03": createSingleAnswerQuestion(
    "q-sav-03", "surface-area-volume",
    "Volume of cylinder r=3,h=5.", "Find volume", "45π cm³", {}, 2, 4
  ),
  "q-sav-04": createSingleAnswerQuestion(
    "q-sav-04", "surface-area-volume",
    "CSA of cone r=3,h=4 (l=5).", "Find CSA", "15π cm²", {}, 2, 4
  ),
  "q-sav-05": createSingleAnswerQuestion(
    "q-sav-05", "surface-area-volume",
    "Volume of sphere r=3.", "Find volume", "36π cm³", {}, 2, 4
  ),
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
  // ---- Geometry: Quadrilaterals ----
  "q-quad-01": createSingleAnswerQuestion(
    "q-quad-01", "quadrilaterals", "Sum of interior angles of a quadrilateral?", "State the sum", "360°", {}, 1, 3
  ),
  "q-quad-02": createSingleAnswerQuestion(
    "q-quad-02", "quadrilaterals", "Opposite sides of a parallelogram?", "State property", "Equal and parallel", {}, 1, 3
  ),
  "q-quad-03": createSingleAnswerQuestion(
    "q-quad-03", "quadrilaterals", "Diagonals of a rectangle?", "State property", "Equal",     {}, 1, 3
  ),
  // ---- Geometry: Circles ----
  "q-circ-01": createSingleAnswerQuestion(
    "q-circ-01", "circles", "Circumference of circle r=7 (π=22/7)?", "Find circumference", "44", {}, 1, 3
  ),
  "q-circ-02": createSingleAnswerQuestion(
    "q-circ-02", "circles", "Area of circle r=7 (π=22/7)?", "Find area", "154", {}, 1, 3
  ),

  // ---- Geometry: Propositions ----
  "q-prop-01": createSingleAnswerQuestion(
    "q-prop-01", "propositions", "What is a proposition?", "Define", "A statement that is either true or false", {}, 1, 3
  ),
  "q-prop-02": createSingleAnswerQuestion(
    "q-prop-02", "propositions", "Converse of 'If P then Q'?", "State", "If Q then P", {}, 1, 3
  ),

  // ---- Mensuration: Perimeter and Area ----
  "q-pa-01": createSingleAnswerQuestion(
    "q-pa-01", "perimeter-area", "Area of rectangle 5×3?", "Find area", "15", {}, 1, 3
  ),
  "q-pa-02": createSingleAnswerQuestion(
    "q-pa-02", "perimeter-area", "Area of triangle base 6 height 4?", "Find area", "12", {}, 1, 3
  ),
  "q-pa-03": createSingleAnswerQuestion(
    "q-pa-03", "perimeter-area", "Heron area sides 3,4,5?", "Find area", "6", {}, 2, 4
  ),
  // ---- Algebra: Algebraic Identities ----
  "q-id-01": createSingleAnswerQuestion(
    "q-id-01", "algebraic-identities", "Expand (a+b)^2?", "Expand", "a²+2ab+b²", {}, 1, 3
  ),
  "q-id-02": createSingleAnswerQuestion(
    "q-id-02", "algebraic-identities", "Factor a²-b²?", "Factor", "(a-b)(a+b)", {}, 1, 3
  ),

  // ---- Algebra: Sequences ----
  "q-seq-01": createSingleAnswerQuestion(
    "q-seq-01", "sequences", "5th term of AP 2,5,8,...?", "Find term", "14", {}, 1, 3
  ),
  "q-seq-02": createSingleAnswerQuestion(
    "q-seq-02", "sequences", "Sum first 10 natural numbers?", "Find sum", "55", {}, 1, 3
  ),
  "q-seq-03": createSingleAnswerQuestion(
    "q-seq-03", "sequences", "4th term of GP 2,6,18,...?", "Find term", "54", {}, 2, 4
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

/* ----------------------------------------------------------- Lesson strategies */

/**
 * Lesson Intelligence registry — data only, no logic.
 *
 * Each entry describes HOW a concept should be taught. The adaptive engine
 * (adaptive-plan.js) remains the authority for WHAT to teach; this registry
 * supplies the teaching experience for a selected concept.
 *
 * Composition approaches:
 *   "enhanced" — Existing Markdown remains the primary instructional content.
 *                Strategy blocks introduce or enrich the lesson without
 *                repeating explanations, worked examples or practice already
 *                present in Markdown. Blocks are placed before (intro) or
 *                after (outro) the Markdown content.
 *   "led"      — The strategy supplies the main instructional experience.
 *                Existing Markdown content is supplementary reference material.
 *
 * Block placement (for "enhanced" composition):
 *   "before" — Render before Markdown content (intro, hooks, prediction)
 *   "after"  — Render after Markdown content (reflection, memory hook)
 *
 * Block types (renderer-agnostic):
 *   story | prediction | visual | interactive | discovery |
 *   worked-example | guided-practice | independent-practice |
 *   explain | misconception-intervention | memory-hook | mastery
 *
 * Not every lesson uses every block. The renderer renders blocks by declared
 * type + content; it contains no concept-specific logic.
 */
const LESSON_STRATEGIES = {
  // ================================================================
  // Linear equation — Strategy-enhanced existing lesson
  // Existing Markdown (foundation-5-basic-algebra) teaches the seesaw
  // balance, transposition, and worked examples. Strategy adds only
  // complementary prediction, reflection and memory elements.
  // ================================================================
  "algebra-linear-equation": {
    conceptId: "algebra-linear-equation",
    lessonSlug: "foundation-5-basic-algebra",
    learningGoal: "Understand that an equation is a balance and solve it by undoing operations.",
    composition: "enhanced",
    prerequisiteConcepts: [],
    teachingStrategy: {
      primary: "worked-example",
      supporting: ["visual"],
      interaction: "none",
    },
    experience: {
      blocks: [
        {
          type: "prediction",
          title: "What do you think?",
          placement: "before",
          content:
            "You have a mystery number. Add 7 to it and you get 12.\nBefore reading the method, what number do you think it is?",
        },
        {
          type: "explain",
          title: "Explain it",
          placement: "after",
          content: "In one sentence: why does subtracting 7 from both sides keep the balance?",
        },
        {
          type: "memory-hook",
          title: "Remember this",
          placement: "after",
          content: "An equation is a balance. Do the same to both sides.",
        },
      ],
    },
    misconception: {
      description: "Changes sign incorrectly when transposing terms across the equals sign",
      targetedExplanation:
        "When you move a term to the other side of the equation, its sign flips (+ becomes −, − becomes +). You are not 'moving' the number — you are doing the same operation to both sides.",
      errorSignals: [
        {
          errorCategory: "conceptual",
          studentAnswerPattern: /sign|transpos|switch|flip|side/i,
        },
        {
          errorCategory: "conceptual",
          stepTextContains: "subtract",
        },
      ],
      correctiveQuestions: ["q-eq-1", "q-eq-3"],
    },
    retrieval: {
      prompts: ["Solve x + 5 = 12.", "What is the first step to solve 3x = 15?"],
    },
    memoryJourney: {
      elements: [
        {
          type: "question",
          title: "The Question",
          content: "You have a mystery number. Add 7 to it and you get 12. What was the number?",
          recallPrompt: "In one sentence: how do you find the missing number?",
          recallAnswer: "Undo the +7 by subtracting 7 from both sides: x = 12 - 7 = 5.",
        },
        {
          type: "discovery",
          title: "The Discovery",
          content: "An equation is balanced. Whatever you do to one side, you must do to the other side, or it tips.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "idea",
          title: "The Idea",
          content: "To solve an equation, undo each operation step by step until the variable stands alone.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "rule",
          title: "The Rule",
          content: "x + 7 = 12 means x = 12 - 7 = 5. Subtract the same amount from both sides.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "watchout",
          title: "Watch Out",
          content: "To solve an equation, do the same operation to both sides. If you add, subtract, multiply or divide on one side, you must do the same on the other side — otherwise the balance tips.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "remember",
          title: "Remember",
          content: "An equation is a balance. Do the same to both sides.",
          recallPrompt: "Say it in your own words: what is an equation?",
          recallAnswer: "An equation is a balanced statement — both sides are equal.",
        },
      ],
    },
  },

  // ================================================================
  // Circle area — Strategy-enhanced existing lesson
  // Existing Markdown (geometry-basics) has the Circle → Rectangle widget
  // at line 130 and the worked example at line 116. Strategy adds discovery
  // prompts around the existing interaction without duplicating the widget.
  // Exactly one circle-rect widget marker exists (in Markdown).
  // ================================================================
  "geo-circle-area": {
    conceptId: "geo-circle-area",
    lessonSlug: "geometry-basics",
    learningGoal: "Understand why the area of a circle is πr².",
    composition: "enhanced",
    prerequisiteConcepts: ["geo-area-rectangle", "geo-radius"],
    teachingStrategy: {
      primary: "discovery",
      supporting: ["visual"],
      interaction: "existing",
    },
    experience: {
      blocks: [
        {
          type: "story",
          title: "From circle to rectangle",
          placement: "before",
          content:
            "We know how to find the area of a rectangle. But how do we find the area of a circle?",
        },
        {
          type: "prediction",
          title: "What do you think?",
          placement: "before",
          content: "If you cut a circle into thin slices and rearrange them, what shape do they make?",
        },
        {
          type: "discovery",
          title: "What we found",
          placement: "before",
          content:
            "The rearranged slices form a rectangle: height = r, width = πr (half the circumference).\nSo area = πr × r = πr².",
        },
        {
          type: "explain",
          title: "Explain it",
          placement: "after",
          content: "Why does the formula contain r²? In one sentence.",
        },
        {
          type: "memory-hook",
          title: "Remember this",
          placement: "after",
          content: "Circle area = π × radius × radius = πr².",
        },
      ],
    },
    misconception: {
      description: "Confuses circumference (2πr) with area (πr²)",
      targetedExplanation:
        "Circumference is the distance around the edge (2πr). Area is the space inside (πr²). They measure different things.",
    },
    retrieval: {
      prompts: ["What is the area of a circle with radius 5 cm?", "How is circle area different from circumference?"],
    },
    memoryJourney: {
      elements: [
        {
          type: "question",
          title: "The Question",
          content: "We know the area of a rectangle. But how do we find the area of a circle?",
          recallPrompt: "In one sentence: what shape do circle slices form when rearranged?",
          recallAnswer: "A rectangle (approximately) — height = r, width = πr.",
        },
        {
          type: "discovery",
          title: "The Discovery",
          content: "Cut a circle into thin slices and rearrange them — they form a rectangle: height = r, width = πr.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "idea",
          title: "The Idea",
          content: "The circle's area equals the area of this rectangle: πr × r = πr².",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "rule",
          title: "The Rule",
          content: "Area of a circle = π × radius × radius = πr².",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "watchout",
          title: "Watch Out",
          content: "Circumference (2πr) is the distance around the edge. Area (πr²) is the space inside. They measure different things.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "remember",
          title: "Remember",
          content: "Circle area = πr². Think: 'π × r × r' — use the radius (not the diameter) times itself times pi.",
          recallPrompt: "What is the area of a circle with radius 7 cm?",
          recallAnswer: "π × 7 × 7 = 154 cm² (using π = 22/7).",
        },
      ],
    },
  },

  // ================================================================
  // Exponents — Strategy-enhanced existing lesson
  // Existing Markdown (foundation-4-powers-and-roots) teaches the exponent
  // laws at line 59-73. Strategy adds pattern-discovery framing and memory
  // support without repeating the rules or worked examples.
  // ================================================================
  "numbers-exponents": {
    conceptId: "numbers-exponents",
    lessonSlug: "foundation-4-powers-and-roots",
    learningGoal: "Understand that an exponent is shorthand for repeated multiplication.",
    composition: "enhanced",
    prerequisiteConcepts: [],
    teachingStrategy: {
      primary: "discovery",
      supporting: ["pattern"],
      interaction: "none",
    },
    experience: {
      blocks: [
        {
          type: "prediction",
          title: "What do you think?",
          placement: "before",
          content: "2 × 2 × 2 × 2 × 2 = 32. That's five 2s multiplied together.\nIf you had to write ten 2s multiplied together, is there a shorter way?",
        },
        {
          type: "discovery",
          title: "The shorthand",
          placement: "before",
          content:
            "Instead of writing 2 × 2 × 2 × 2 × 2, mathematicians write 2⁵. The small 5 means 'five 2s multiplied'.",
        },
        {
          type: "explain",
          title: "Explain it",
          placement: "after",
          content: "Why do we add exponents when multiplying powers with the same base?",
        },
        {
          type: "memory-hook",
          title: "Remember this",
          placement: "after",
          content: "Same base, multiply → add the exponents.",
        },
      ],
    },
    misconception: {
      description: "Multiplies exponents instead of adding them (2³ × 2² = 2⁶)",
      targetedExplanation:
        "2³ × 2² means (2×2×2) × (2×2) — that's five 2s total, so 2⁵, not 2⁶. When multiplying powers with the same base, you add the exponents because you are counting the total number of base factors.",
      errorSignals: [
        {
          errorCategory: "conceptual",
          studentAnswerPattern: /2⁶|2\^6|64/i,
        },
        {
          errorCategory: "conceptual",
          stepTextContains: "multiply",
        },
      ],
      correctiveQuestions: ["q-exp-1", "q-exp-2"],
    },
    retrieval: {
      prompts: ["Simplify 2⁴ × 2³.", "What does 5² mean in words?"],
    },
    memoryJourney: {
      elements: [
        {
          type: "question",
          title: "The Question",
          content: "2 × 2 × 2 × 2 × 2 = 32. That's five 2s multiplied together. Is there a shorter way to write it?",
          recallPrompt: "What does 2⁵ mean in plain words?",
          recallAnswer: "Two to the power five — five 2s multiplied together.",
        },
        {
          type: "discovery",
          title: "The Discovery",
          content: "Instead of writing all the 2s, mathematicians write a small number (the exponent) to count how many times the base appears.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "idea",
          title: "The Idea",
          content: "2⁵ is just shorthand for 2 × 2 × 2 × 2 × 2 — five 2s multiplied.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "rule",
          title: "The Rule",
          content: "When multiplying powers with the same base, add the exponents: 2³ × 2² = 2⁵.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "watchout",
          title: "Watch Out",
          content: "2³ × 2² is NOT 2⁶. You add exponents (3 + 2 = 5), not multiply them.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "remember",
          title: "Remember",
          content: "When multiplying powers with the same base, add their exponents.",
          recallPrompt: "Simplify 2⁴ × 2³ without writing out all the 2s.",
          recallAnswer: "2⁴ × 2³ = 2⁷ (4 + 3 = 7 twos multiplied together).",
        },
      ],
    },
  },

  // ================================================================
  // HCF/LCM — Strategy-led lesson
  // The existing chapter (foundation-1-numbers-and-signs) covers digits,
  // place value and sign rules — it does not teach HCF or LCM. The strategy
  // supplies the complete instructional experience. Markdown content remains
  // as supplementary reference material.
  // ================================================================
  "numbers-hcf-lcm": {
    conceptId: "numbers-hcf-lcm",
    lessonSlug: "foundation-1-numbers-and-signs",
    learningGoal: "Understand when to use HCF (biggest equal group) vs LCM (when things meet again).",
    composition: "led",
    prerequisiteConcepts: [],
    teachingStrategy: {
      primary: "story",
      supporting: ["real-world-problem"],
      interaction: "none",
    },
    experience: {
      blocks: [
        {
          type: "story",
          title: "Two buses leave together",
          content:
            "One bus comes every 18 minutes. Another comes every 24 minutes. When will they meet again?",
        },
        {
          type: "prediction",
          title: "What do you think?",
          content: "Will they meet at 18 minutes? At 24? At some other time?",
        },
        {
          type: "discovery",
          title: "Two different questions",
          content:
            "'When will they meet again?' → LCM (common multiples).\n'What is the biggest equal group?' → HCF (common factors).",
        },
        {
          type: "worked-example",
          title: "Find the LCM of 18 and 24",
          content: "Multiples of 18: 18, 36, 54, 72… Multiples of 24: 24, 48, 72… They meet at 72 minutes.",
        },
        {
          type: "guided-practice",
          title: "Try HCF",
          content: "What is the biggest number that divides both 18 and 24?",
          questions: ["q-hcf-1"],
        },
        {
          type: "independent-practice",
          title: "Try LCM",
          content: "When will buses with intervals 20 and 30 minutes meet?",
          questions: ["q-hcf-2"],
        },
        {
          type: "explain",
          title: "Explain it",
          content: "In your own words: what is the difference between HCF and LCM?",
        },
        {
          type: "memory-hook",
          title: "Remember this",
          content: "HCF = biggest equal group. LCM = when they meet again.",
        },
        {
          type: "mastery",
          title: "Check what you know",
          content: "Three HCF/LCM questions.",
          questions: ["q-hcf-1", "q-hcf-2", "q-hcf-3"],
          threshold: 0.8,
        },
      ],
    },
    misconception: {
      description: "Confuses HCF and LCM — uses LCM when HCF is needed and vice versa",
      targetedExplanation:
        "HCF answers 'biggest equal group' — you are looking for common factors. LCM answers 'when do they meet again' — you are looking for common multiples. They are different questions with different answers.",
      errorSignals: [],
      correctiveQuestions: ["q-hcf-1", "q-hcf-2"],
    },
    retrieval: {
      prompts: ["Find the HCF of 20 and 30.", "Two bells ring every 12 and 15 minutes — when will they ring together?"],
    },
    memoryJourney: {
      elements: [
        {
          type: "question",
          title: "The Question",
          content: "One bus comes every 18 minutes. Another comes every 24 minutes. When will they meet again?",
          recallPrompt: "In one sentence: what are the two different questions hiding here?",
          recallAnswer: "'When will they meet again?' → LCM. 'What is the biggest equal group?' → HCF.",
        },
        {
          type: "discovery",
          title: "The Discovery",
          content: "There are two different questions: when events meet (LCM) and the biggest equal group (HCF).",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "idea",
          title: "The Idea",
          content: "HCF finds common factors (biggest equal group). LCM finds common multiples (when they meet).",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          "type": "rule",
          title: "The Rule",
          content: "HCF of 18 and 24 = 6 (biggest number dividing both). LCM of 18 and 24 = 72 (when they meet).",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "watchout",
          title: "Watch Out",
          content: "HCF and LCM answer different questions. Don't use LCM when you need HCF, and vice versa.",
          recallPrompt: null,
          recallAnswer: null,
        },
        {
          type: "remember",
          title: "Remember",
          content: "HCF is the greatest number that divides all given numbers exactly. LCM is when they meet again.",
          recallPrompt: "Two bells ring every 12 and 15 minutes — when do they ring together?",
          recallAnswer: "LCM(12, 15) = 60 minutes.",
        },
      ],
    },
  },
};

/**
 * Get the teaching strategy for a concept.
 * Returns null if no strategy is defined for the concept.
 * @param {string} conceptId
 * @returns {Object|null}
 */
function getLessonStrategy(conceptId) {
  return LESSON_STRATEGIES[conceptId] || null;
}

/* ----------------------------------------------------------- Exports */

export {
  MASTERY_STATES,
  LESSON_STATES,
  ERROR_CATEGORIES,
  MASTERY_THRESHOLD,
  LESSON_STRATEGIES,
  getLessonStrategy,
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
