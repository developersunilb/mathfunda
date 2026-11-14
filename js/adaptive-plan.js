/**
 * Adaptive Learning Engine — Milestone 1: Concept Mapper
 *
 * Reads diagnostic results from localStorage and maps them to per-concept
 * mastery states, priority scores, and a structured plan data model.
 *
 * No student results are hard-coded. The mapper reads whatever diagnostic
 * results exist in localStorage and produces a reusable, structured output.
 *
 * All data stays client-side in localStorage. Nothing is transmitted.
 */

import {
  CONFIRMATION_RESULTS_KEY,
  readConfirmationResults,
} from "./confirmation-assessment.js";

const DIAGNOSTIC_RESULTS_KEY = "mathfunda-diagnostic-results";
const ADAPTIVE_PLAN_KEY = "mathfunda-adaptive-plan-v1";

const CURRICULUM_VERSION = "CBSE-2026-27";
const PLAN_VERSION = 1;
const DIAGNOSTIC_VERSION = 1;
const TOTAL_MARKS = 80;

/* --------------------------------------------------------------- Concept registry */

/**
 * Stable concept IDs. Each concept maps to one or more diagnostic questions.
 * Unit weightage is a prioritisation signal only — it does not mean an
 * individual concept carries that many marks.
 */
const CONCEPTS = {
  "numbers-division": {
    id: "numbers-division",
    topic: "Division",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-number-skill",
    isPrerequisite: true,
    diagnosticQuestions: [1],
  },
  "numbers-integer-ops": {
    id: "numbers-integer-ops",
    topic: "Integer Addition and Subtraction",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-number-skill",
    isPrerequisite: true,
    diagnosticQuestions: [2],
  },
  "numbers-fraction-addition": {
    id: "numbers-fraction-addition",
    topic: "Adding Fractions",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-number-skill",
    isPrerequisite: true,
    diagnosticQuestions: [3],
  },
  "numbers-decimal-multiplication": {
    id: "numbers-decimal-multiplication",
    topic: "Multiplying Decimals",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-number-skill",
    isPrerequisite: true,
    diagnosticQuestions: [4],
  },
  "numbers-percentage": {
    id: "numbers-percentage",
    topic: "Percentage of a Quantity",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-number-skill",
    isPrerequisite: true,
    diagnosticQuestions: [5],
  },
  "numbers-ratio-proportion": {
    id: "numbers-ratio-proportion",
    topic: "Ratio and Proportion",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-prerequisite",
    isPrerequisite: true,
    diagnosticQuestions: [6],
  },
  "numbers-hcf-lcm": {
    id: "numbers-hcf-lcm",
    topic: "HCF and LCM",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-number-skill",
    isPrerequisite: true,
    diagnosticQuestions: [7],
  },
  "numbers-exponents": {
    id: "numbers-exponents",
    topic: "Laws of Exponents",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "number-system",
    isPrerequisite: false,
    diagnosticQuestions: [8],
  },
  "algebra-like-terms": {
    id: "algebra-like-terms",
    topic: "Like Terms",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    diagnosticQuestions: [9],
  },
  "algebra-linear-equation": {
    id: "algebra-linear-equation",
    topic: "Linear Equation",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    diagnosticQuestions: [10],
  },
  "geometry-triangle-angle": {
    id: "geometry-triangle-angle",
    topic: "Triangle Angle Sum",
    unit: "Geometry",
    unitWeightage: 25,
    classification: "geometry-prerequisite",
    isPrerequisite: true,
    diagnosticQuestions: [11],
  },
  "mensuration-rectangle-area": {
    id: "mensuration-rectangle-area",
    topic: "Rectangle Area",
    unit: "Mensuration",
    unitWeightage: 14,
    classification: "mensuration-prerequisite",
    isPrerequisite: true,
    diagnosticQuestions: [12],
  },
  "mixed-sign-rules": {
    id: "mixed-sign-rules",
    topic: "Sign Rules and Order of Operations",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-number-skill",
    isPrerequisite: true,
    diagnosticQuestions: [13],
  },
  "mixed-fraction-division": {
    id: "mixed-fraction-division",
    topic: "Dividing Fractions",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-number-skill",
    isPrerequisite: true,
    diagnosticQuestions: [14],
  },
  "mixed-decimal-fraction": {
    id: "mixed-decimal-fraction",
    topic: "Decimal to Fraction Conversion",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-number-skill",
    isPrerequisite: true,
    diagnosticQuestions: [15],
  },
  "algebra-expanding-brackets": {
    id: "algebra-expanding-brackets",
    topic: "Expanding Brackets",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    diagnosticQuestions: [16],
  },
  "algebra-equation-fraction": {
    id: "algebra-equation-fraction",
    topic: "Equation with a Fraction",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    diagnosticQuestions: [17],
  },
  "mixed-rounding-placevalue": {
    id: "mixed-rounding-placevalue",
    topic: "Rounding and Place Value",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "foundational-number-skill",
    isPrerequisite: true,
    diagnosticQuestions: [18],
  },
  "mensuration-perimeter": {
    id: "mensuration-perimeter",
    topic: "Perimeter",
    unit: "Mensuration",
    unitWeightage: 14,
    classification: "mensuration-prerequisite",
    isPrerequisite: true,
    diagnosticQuestions: [19],
  },
  "coordinates-quadrant": {
    id: "coordinates-quadrant",
    topic: "Quadrant Identification",
    unit: "Coordinate Geometry",
    unitWeightage: 4,
    classification: "coordinate-geometry",
    isPrerequisite: false,
    diagnosticQuestions: [20],
  },
  "coordinates-midpoint": {
    id: "coordinates-midpoint",
    topic: "Midpoint Calculation",
    unit: "Coordinate Geometry",
    unitWeightage: 4,
    classification: "coordinate-geometry",
    isPrerequisite: false,
    diagnosticQuestions: [20],
  },
};

const CONCEPT_BY_ID = Object.fromEntries(
  Object.values(CONCEPTS).map((c) => [c.id, c])
);

/**
 * Canonical concept ID registry.
 *
 * Maps diagnostic concept IDs to their canonical syllabus concept IDs.
 * Both diagnostic results and syllabus concepts resolve to the same canonical
 * concept, ensuring:
 *   - Confirmed weaknesses carry into syllabus scheduling.
 *   - Mastered concepts aren't unnecessarily retaught.
 *   - Confirmation results update the corresponding syllabus concepts.
 *   - Future students receive the same adaptive behaviour using their own results.
 *
 * Keys are diagnostic concept IDs; values are syllabus concept IDs.
 * Unmapped diagnostic concepts (not part of the syllabus) are omitted.
 */
const CANONICAL_REGISTRY = {
  // Number Systems → Real Numbers concepts
  "numbers-division": "ns-real-numbers",
  "numbers-integer-ops": "ns-real-numbers",
  "numbers-decimal-multiplication": "ns-real-numbers",
  "numbers-percentage": "ns-real-numbers",
  "mixed-sign-rules": "ns-real-numbers",
  "mixed-fraction-division": "ns-real-numbers",
  "mixed-decimal-fraction": "ns-real-numbers",
  // Number Systems → Laws of Exponents
  "numbers-exponents": "ns-laws-exponents",
  // Algebra → Algebraic Identities (expanding brackets is part of identities)
  "algebra-expanding-brackets": "alg-algebraic-identities",
  // Algebra → Polynomials (linear equations in one variable are polynomial equations)
  "algebra-linear-equation": "alg-polynomials",
  // Geometry → Lines and Angles (triangle angle is part of lines and angles)
  "geometry-triangle-angle": "geo-lines-angles",
  // Coordinate Geometry → Cartesian System (quadrants are part of cartesian system)
  "coordinates-quadrant": "cg-cartesian-system",
};

/**
 * Reverse mapping: canonical concept ID -> diagnostic concept ID(s).
 * Used when propagating diagnostic results to syllabus concepts.
 */
const CANONICAL_TO_DIAGNOSTIC = Object.fromEntries(
  Object.entries(CANONICAL_REGISTRY).map(([diagId, canonId]) => [canonId, diagId])
);

/**
 * Resolve a diagnostic concept ID to its canonical syllabus concept ID.
 * Returns null if the concept is not part of the syllabus.
 */
function resolveCanonicalId(diagnosticId) {
  return CANONICAL_REGISTRY[diagnosticId] ?? null;
}

/* ----------------------------------------------------------- Answer equivalence */

/**
 * Normalise a student or correct answer for comparison.
 */
function normalizeAnswer(answer) {
  if (answer === null || answer === undefined) return null;
  return String(answer).trim().toLowerCase();
}

/**
 * Remove units and formatting so numeric comparison works across formats.
 * Handles %, °, cm, ^2, spaces.
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
 * Try to parse a value as a number, including simple fractions like "5/4".
 * Returns null if not parseable.
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
 * Extract the final answer value from an expression like "x = 5" or
 * "HCF = 6, LCM = 72". Takes the part after the last "=" or ":" delimiter.
 * Returns null if no delimiter is found.
 */
function extractFinalValue(value) {
  const cleaned = normalizeAnswer(value);
  if (!cleaned) return null;

  // Try splitting on "=" first, then ":"
  const eqParts = cleaned.split("=");
  if (eqParts.length > 1) {
    return eqParts[eqParts.length - 1].trim();
  }

  const colonParts = cleaned.split(":");
  if (colonParts.length > 1) {
    return colonParts[colonParts.length - 1].trim();
  }

  return null;
}

/**
 * Check whether a student answer is equivalent to the correct answer.
 * Supports exact match, unit-stripped match, numeric/fraction comparison,
 * and extraction of the final value from equation-style answers
 * (e.g., "x = 5" vs student "5").
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

  // Try comparing student answer with the final value extracted from the
  // correct answer (e.g. correct "x = 5", student "5").
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

/* ------------------------------------------------------------ Mastery assignment */

/**
 * Assign an initial mastery state from a single diagnostic result.
 *
 * Transitions:
 *   Diagnostic incorrect     -> learning
 *   Diagnostic skipped       -> needs_verification
 *   Diagnostic correct       -> not_started
 */
function assignInitialMastery(result) {
  if (result.skipped) {
    return { state: "needs_verification", reason: "Skipped in diagnostic" };
  }
  if (result.studentAnswer === null || result.studentAnswer === undefined) {
    return { state: "needs_verification", reason: "No answer provided" };
  }
  if (answersEquivalent(result.studentAnswer, result.correctAnswer)) {
    return { state: "not_started", reason: "Correct in diagnostic" };
  }
  return { state: "learning", reason: "Incorrect answer in diagnostic" };
}

/* ------------------------------------------------------------ Priority calculation */

/**
 * Calculate diagnostic priority score for a concept.
 *
 * Diagnostic Priority = Diagnostic Error Score × (CBSE Unit Weightage / 80)
 *
 * Error Score:
 *   - Incorrect answer: 3
 *   - Skipped / needs verification: 2
 *   - Correct: 0
 *
 * Unit weightage is a prioritisation signal only — it does not mean an
 * individual concept carries those marks. This reflects HOW MUCH attention
 * a concept needs based on the diagnostic evidence alone.
 */
function calculatePriorityScore(masteryState, unitWeightage) {
  let errorScore = 0;
  if (masteryState === "learning") errorScore = 3;
  else if (masteryState === "needs_verification") errorScore = 2;
  else if (masteryState === "needs_reinforcement") errorScore = 3;
  else errorScore = 0;

  return Math.round((errorScore * (unitWeightage / TOTAL_MARKS)) * 1000) / 1000;
}

/**
 * Calculate learning sequence priority for scheduling.
 *
 * This is SEPARATE from diagnostic priority. Diagnostic priority tells us
 * HOW MUCH attention a concept needs. Learning sequence priority tells us
 * WHEN to study it, considering prerequisites and mastery state.
 *
 * Ordering (highest to lowest priority for scheduling):
 *   1. Prerequisites with learning needs (foundational concepts first)
 *   2. Non-prerequisites with learning needs
 *   3. Needs verification (waiting for confirmation)
 *   4. Not started (no diagnostic evidence yet)
 *   5. Mastered (excluded from routine scheduling)
 *
 * Within each tier, diagnostic priority breaks ties.
 */
function calculateLearningSequencePriority(concept) {
  const { masteryState, isPrerequisite, priorityScore } = concept;

  // Mastered concepts are excluded from routine scheduling
  if (masteryState === "mastered") return 0;

  // Needs verification — wait for confirmation before scheduling study time
  if (masteryState === "needs_verification") return 1;

  // Base tier: prerequisites get a scheduling boost
  let tier = isPrerequisite ? 3 : 2;

  // Needs reinforcement returns to the learning queue
  if (masteryState === "needs_reinforcement") tier = 3;

  // Combine tier with diagnostic priority for fine ordering within tier
  // Tier dominates; priorityScore breaks ties within tier
  return tier + priorityScore / 1000;
}

/* ------------------------------------------------------------ Data validation */

/**
 * Validate diagnostic results structure.
 * Returns { valid: boolean, errors: string[] }.
 */
function validateDiagnosticResults(results) {
  const errors = [];

  if (!results) {
    errors.push("No diagnostic results found.");
    return { valid: false, errors };
  }

  if (!Array.isArray(results)) {
    errors.push("Diagnostic results is not an array.");
    return { valid: false, errors };
  }

  if (results.length === 0) {
    errors.push("Diagnostic results array is empty.");
    return { valid: false, errors };
  }

  const requiredFields = ["question", "correctAnswer", "studentAnswer", "skipped"];

  for (let i = 0; i < results.length; i++) {
    const entry = results[i];
    if (!entry || typeof entry !== "object") {
      errors.push(`Entry ${i} is not a valid object.`);
      continue;
    }

    for (const field of requiredFields) {
      if (!(field in entry)) {
        errors.push(`Entry ${i} missing required field: ${field}`);
      }
    }

    if (entry.question !== undefined && (typeof entry.question !== "number" || entry.question < 1 || entry.question > 20)) {
      errors.push(`Entry ${i} has invalid question number: ${entry.question}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check whether stored diagnostic data is current enough to use.
 */
function isDiagnosticDataOutdated(results, maxAgeDays = 30) {
  if (!results || results.length === 0) return true;

  const latest = Math.max(...results.map((r) => new Date(r.answeredAt || 0).getTime()));
  if (!latest || latest === 0) return true;

  const ageDays = (Date.now() - latest) / (1000 * 60 * 60 * 24);
  return ageDays > maxAgeDays;
}

/* ------------------------------------------------------------ Concept mapping */

/**
 * Map diagnostic results to per-concept mastery states.
 *
 * Returns a map of conceptId -> concept mastery entry.
 * Questions with multiple concepts (e.g., Q20 splits into quadrant + midpoint)
 * are handled by splitting the result across concepts.
 */
function mapDiagnosticToConcepts(results) {
  const validation = validateDiagnosticResults(results);
  if (!validation.valid) {
    throw new Error(`Invalid diagnostic results: ${validation.errors.join(", ")}`);
  }

  // Index results by question number for fast lookup
  const resultsByQuestion = new Map();
  for (const result of results) {
    resultsByQuestion.set(result.question, result);
  }

  const concepts = {};

  for (const [conceptId, concept] of Object.entries(CONCEPTS)) {
    const questionResults = concept.diagnosticQuestions
      .map((q) => resultsByQuestion.get(q))
      .filter(Boolean);

    if (questionResults.length === 0) {
      // Concept not covered by any diagnostic question
      concepts[conceptId] = {
        ...concept,
        masteryState: "not_started",
        priorityScore: 0,
        priorityReason: "Not assessed in diagnostic",
        assessmentRequired: false,
        studyTimeAllocated: false,
        evidence: [],
      };
      continue;
    }

    // For concepts with one diagnostic question, use that result directly.
    // For Q20 split concepts, we need to interpret the single result across
    // two concepts based on answer content.
    if (conceptId === "coordinates-quadrant") {
      const q20 = questionResults[0];
      const mastery = assignInitialMastery(q20);

      // If the student correctly identified the quadrant, mark quadrant as mastered.
      // The answer "2nd quadrant" or "quadrant ii" indicates quadrant understanding.
      const studentAns = normalizeAnswer(q20.studentAnswer);
      const quadrantCorrect =
        !q20.skipped &&
        q20.studentAnswer !== null &&
        (studentAns.includes("2nd quadrant") || studentAns.includes("quadrant ii") || studentAns.includes("quadrant 2"));

      let finalState;
      let finalReason;
      if (q20.skipped) {
        finalState = "needs_verification";
        finalReason = "Skipped in diagnostic";
      } else if (quadrantCorrect) {
        finalState = "mastered";
        finalReason = "Correct quadrant identification in diagnostic";
      } else {
        finalState = mastery.state;
        finalReason = mastery.reason;
      }

      const priorityScore = calculatePriorityScore(finalState, concept.unitWeightage);

      concepts[conceptId] = {
        ...concept,
        masteryState: finalState,
        priorityScore,
        priorityReason: finalReason,
        assessmentRequired: finalState === "needs_verification",
        studyTimeAllocated: finalState === "learning",
        evidence: [{ question: 20, result: q20 }],
      };
    } else if (conceptId === "coordinates-midpoint") {
      const q20 = questionResults[0];

      // Midpoint was not addressed if the student only mentioned quadrant
      const studentAns = normalizeAnswer(q20.studentAnswer);
      const onlyQuadrant =
        !q20.skipped &&
        q20.studentAnswer !== null &&
        (studentAns.includes("2nd quadrant") || studentAns.includes("quadrant ii") || studentAns.includes("quadrant 2")) &&
        !studentAns.includes("midpoint");

      let finalState;
      let finalReason;
      if (q20.skipped) {
        finalState = "needs_verification";
        finalReason = "Skipped in diagnostic";
      } else if (onlyQuadrant) {
        finalState = "needs_verification";
        finalReason = "Midpoint not addressed in diagnostic answer";
      } else {
        const mastery = assignInitialMastery(q20);
        finalState = mastery.state;
        finalReason = mastery.reason;
      }

      const priorityScore = calculatePriorityScore(finalState, concept.unitWeightage);

      concepts[conceptId] = {
        ...concept,
        masteryState: finalState,
        priorityScore,
        priorityReason: finalReason,
        assessmentRequired: finalState === "needs_verification",
        studyTimeAllocated: finalState === "learning",
        evidence: [{ question: 20, result: q20 }],
      };
    } else {
      const result = questionResults[0];
      const mastery = assignInitialMastery(result);
      const priorityScore = calculatePriorityScore(mastery.state, concept.unitWeightage);

      concepts[conceptId] = {
        ...concept,
        masteryState: mastery.state,
        priorityScore,
        priorityReason: mastery.reason,
        assessmentRequired: mastery.state === "needs_verification",
        studyTimeAllocated: mastery.state === "learning",
        evidence: [{ question: result.question, result }],
      };
    }
  }

  return concepts;
}

/* ------------------------------------------------------------ Plan data generation */

/**
 * Generate the full structured plan data model from diagnostic results.
 *
 * Returns an object with metadata, concepts, and a daily plan skeleton.
 * The daily plan is generated in Milestone 4; this milestone produces
 * the concept data and priority ordering.
 */
function generatePlanData(results) {
  const concepts = mapDiagnosticToConcepts(results);

  // Apply confirmation results: override mastery states based on
  // confirmation assessment outcomes (wrong → learning, correct → not_started).
  // This ensures skipped questions that were confirmed as weak get study time.
  try {
    const confirmationResults = readConfirmationResults();
    const confirmedConceptIds = new Set();
    for (const r of confirmationResults) {
      if (r.conceptId && concepts[r.conceptId]) {
        confirmedConceptIds.add(r.conceptId);
        if (r.isCorrect) {
          // Confirmed correct → not_started (no remedial lesson needed)
          concepts[r.conceptId].masteryState = "not_started";
          concepts[r.conceptId].priorityScore = 0;
          concepts[r.conceptId].priorityReason = "Confirmed correct in quick check";
          concepts[r.conceptId].studyTimeAllocated = false;
          concepts[r.conceptId].assessmentRequired = false;
        } else {
          // Confirmed incorrect → learning (study time needed)
          concepts[r.conceptId].masteryState = "learning";
          concepts[r.conceptId].studyTimeAllocated = true;
          concepts[r.conceptId].assessmentRequired = false;
          concepts[r.conceptId].priorityReason =
            "Incorrect in confirmation assessment";
        }
      }
    }

    // Recompute learning sequence priority after mastery state changes
    for (const concept of Object.values(concepts)) {
      concept.learningSequencePriority = calculateLearningSequencePriority(concept);
    }
  } catch {
    /* confirmation results unavailable — proceed with diagnostic-only states */
  }

  // Compute learning sequence priority for each concept (separate from diagnostic priority)
  for (const concept of Object.values(concepts)) {
    concept.learningSequencePriority = calculateLearningSequencePriority(concept);
  }

  // Sort by learning sequence priority (WHEN to study), then diagnostic priority (HOW MUCH attention)
  // Mastered concepts (sequence priority 0) sort last and are excluded from routine scheduling.
  const sortedConcepts = Object.values(concepts).sort((a, b) => {
    if (b.learningSequencePriority !== a.learningSequencePriority) {
      return b.learningSequencePriority - a.learningSequencePriority;
    }
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    if (b.isPrerequisite !== a.isPrerequisite) return b.isPrerequisite ? 1 : -1;
    return a.id.localeCompare(b.id);
  });

  return {
    planVersion: PLAN_VERSION,
    generatedAt: new Date().toISOString(),
    diagnosticVersion: DIAGNOSTIC_VERSION,
    curriculumVersion: CURRICULUM_VERSION,
    studentId: "local-device-only",
    totalQuestions: results.length,
    concepts,
    sortedConceptIds: sortedConcepts.map((c) => c.id),
    summary: {
      totalConcepts: Object.keys(concepts).length,
      mastered: Object.values(concepts).filter((c) => c.masteryState === "mastered").length,
      learning: Object.values(concepts).filter((c) => c.masteryState === "learning").length,
      needsVerification: Object.values(concepts).filter((c) => c.masteryState === "needs_verification").length,
      notStarted: Object.values(concepts).filter((c) => c.masteryState === "not_started").length,
    },
  };
}

/* ------------------------------------------------------------ Persistence */

/**
 * Save the generated plan data to localStorage.
 */
function savePlanData(planData) {
  try {
    localStorage.setItem(ADAPTIVE_PLAN_KEY, JSON.stringify(planData));
  } catch {
    /* storage may be full or blocked */
  }
}

/**
 * Read the saved plan data from localStorage.
 */
function readPlanData() {
  try {
    const stored = localStorage.getItem(ADAPTIVE_PLAN_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.planVersion) return parsed;
    }
  } catch {
    /* corrupt or unavailable storage */
  }
  return null;
}

/**
 * Clear saved plan data.
 */
function clearPlanData() {
  try {
    localStorage.removeItem(ADAPTIVE_PLAN_KEY);
  } catch {
    /* storage blocked */
  }
}

/* ------------------------------------------------------------ CBSE Syllabus Registry */

/**
 * Complete CBSE Class 9 Mathematics syllabus coverage.
 *
 * This registry is independent of diagnostic results — it defines ALL
 * prescribed topics regardless of whether a student was assessed on them.
 * Diagnostic results personalise the learning experience but do not determine
 * which syllabus topics exist.
 *
 * Unit weightages from CBSE Class IX Mathematics Curriculum 2026–27:
 *   Number Systems: 7, Algebra: 20, Coordinate Geometry: 4,
 *   Geometry: 25, Mensuration: 14, Statistics & Probability: 10 (Total: 80)
 */
const SYLLABUS_CONCEPTS = {
  // ---- Number Systems (7 marks) ----
  "ns-real-numbers": {
    id: "ns-real-numbers",
    topic: "Real Numbers",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "number-system",
    isPrerequisite: true,
    estimatedMinutes: 30,
  },
  "ns-irrational-numbers": {
    id: "ns-irrational-numbers",
    topic: "Irrational Numbers",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "number-system",
    isPrerequisite: true,
    estimatedMinutes: 30,
  },
  "ns-representing-real-numbers": {
    id: "ns-representing-real-numbers",
    topic: "Representing Real Numbers on Number Line",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "number-system",
    isPrerequisite: false,
    estimatedMinutes: 25,
  },
  "ns-operations-real-numbers": {
    id: "ns-operations-real-numbers",
    topic: "Operations on Real Numbers",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "number-system",
    isPrerequisite: false,
    estimatedMinutes: 35,
  },
  "ns-laws-exponents": {
    id: "ns-laws-exponents",
    topic: "Laws of Exponents for Real Numbers",
    unit: "Number Systems",
    unitWeightage: 7,
    classification: "number-system",
    isPrerequisite: false,
    estimatedMinutes: 35,
  },

  // ---- Algebra (20 marks) ----
  "alg-polynomials": {
    id: "alg-polynomials",
    topic: "Polynomials in One Variable",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: true,
    estimatedMinutes: 40,
  },
  "alg-zeroes-polynomial": {
    id: "alg-zeroes-polynomial",
    topic: "Zeroes of a Polynomial",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    estimatedMinutes: 40,
  },
  "alg-remainder-factor": {
    id: "alg-remainder-factor",
    topic: "Remainder and Factor Theorems",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    estimatedMinutes: 45,
  },
  "alg-factorisation": {
    id: "alg-factorisation",
    topic: "Factorisation of Polynomials",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    estimatedMinutes: 45,
  },
  "alg-algebraic-identities": {
    id: "alg-algebraic-identities",
    topic: "Algebraic Identities",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    estimatedMinutes: 45,
  },
  "alg-linear-eqns-2vars": {
    id: "alg-linear-eqns-2vars",
    topic: "Linear Equations in Two Variables",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    estimatedMinutes: 45,
  },
  "alg-graph-linear-eqns": {
    id: "alg-graph-linear-eqns",
    topic: "Graph of a Linear Equation in Two Variables",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    estimatedMinutes: 40,
  },
  "alg-equations-lines-parallel-axes": {
    id: "alg-equations-lines-parallel-axes",
    topic: "Equations of Lines Parallel to x-axis and y-axis",
    unit: "Algebra",
    unitWeightage: 20,
    classification: "algebra",
    isPrerequisite: false,
    estimatedMinutes: 25,
  },

  // ---- Coordinate Geometry (4 marks) ----
  "cg-cartesian-system": {
    id: "cg-cartesian-system",
    topic: "Cartesian System",
    unit: "Coordinate Geometry",
    unitWeightage: 4,
    classification: "coordinate-geometry",
    isPrerequisite: true,
    estimatedMinutes: 30,
  },
  "cg-plotting-points": {
    id: "cg-plotting-points",
    topic: "Plotting Points in the Plane",
    unit: "Coordinate Geometry",
    unitWeightage: 4,
    classification: "coordinate-geometry",
    isPrerequisite: false,
    estimatedMinutes: 30,
  },

  // ---- Geometry (25 marks) ----
  "geo-euclid-geometry": {
    id: "geo-euclid-geometry",
    topic: "Introduction to Euclid's Geometry",
    unit: "Geometry",
    unitWeightage: 25,
    classification: "geometry-prerequisite",
    isPrerequisite: true,
    estimatedMinutes: 35,
  },
  "geo-lines-angles": {
    id: "geo-lines-angles",
    topic: "Lines and Angles",
    unit: "Geometry",
    unitWeightage: 25,
    classification: "geometry-prerequisite",
    isPrerequisite: true,
    estimatedMinutes: 40,
  },
  "geo-triangles": {
    id: "geo-triangles",
    topic: "Triangles",
    unit: "Geometry",
    unitWeightage: 25,
    classification: "geometry-prerequisite",
    isPrerequisite: true,
    estimatedMinutes: 50,
  },
  "geo-congruence": {
    id: "geo-congruence",
    topic: "Congruence of Triangles",
    unit: "Geometry",
    unitWeightage: 25,
    classification: "geometry-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 50,
  },
  "geo-quadrilaterals": {
    id: "geo-quadrilaterals",
    topic: "Quadrilaterals",
    unit: "Geometry",
    unitWeightage: 25,
    classification: "geometry-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 45,
  },
  "geo-areas-parallelograms": {
    id: "geo-areas-parallelograms",
    topic: "Areas of Parallelograms and Triangles",
    unit: "Geometry",
    unitWeightage: 25,
    classification: "geometry-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 40,
  },
  "geo-circles": {
    id: "geo-circles",
    topic: "Circles",
    unit: "Geometry",
    unitWeightage: 25,
    classification: "geometry-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 50,
  },
  "geo-constructions": {
    id: "geo-constructions",
    topic: "Constructions",
    unit: "Geometry",
    unitWeightage: 25,
    classification: "geometry-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 40,
  },
  "geo-herons-formula": {
    id: "geo-herons-formula",
    topic: "Heron's Formula",
    unit: "Geometry",
    unitWeightage: 25,
    classification: "geometry-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 35,
  },

  // ---- Mensuration (14 marks) ----
  "mens-surface-areas": {
    id: "mens-surface-areas",
    topic: "Surface Areas of Cuboids and Cubes",
    unit: "Mensuration",
    unitWeightage: 14,
    classification: "mensuration-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 40,
  },
  "mens-surface-areas-cylinders": {
    id: "mens-surface-areas-cylinders",
    topic: "Surface Area of a Right Circular Cylinder",
    unit: "Mensuration",
    unitWeightage: 14,
    classification: "mensuration-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 35,
  },
  "mens-surface-areas-cone": {
    id: "mens-surface-areas-cone",
    topic: "Surface Area of a Right Circular Cone",
    unit: "Mensuration",
    unitWeightage: 14,
    classification: "mensuration-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 35,
  },
  "mens-surface-areas-sphere": {
    id: "mens-surface-areas-sphere",
    topic: "Surface Area of a Sphere",
    unit: "Mensuration",
    unitWeightage: 14,
    classification: "mensuration-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 30,
  },
  "mens-volumes-cuboid-cube": {
    id: "mens-volumes-cuboid-cube",
    topic: "Volume of a Cuboid and Cube",
    unit: "Mensuration",
    unitWeightage: 14,
    classification: "mensuration-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 40,
  },
  "mens-volume-cylinder": {
    id: "mens-volume-cylinder",
    topic: "Volume of a Cylinder",
    unit: "Mensuration",
    unitWeightage: 14,
    classification: "mensuration-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 35,
  },
  "mens-volume-cone": {
    id: "mens-volume-cone",
    topic: "Volume of a Cone",
    unit: "Mensuration",
    unitWeightage: 14,
    classification: "mensuration-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 35,
  },
  "mens-volume-sphere": {
    id: "mens-volume-sphere",
    topic: "Volume of a Sphere",
    unit: "Mensuration",
    unitWeightage: 14,
    classification: "mensuration-prerequisite",
    isPrerequisite: false,
    estimatedMinutes: 30,
  },

  // ---- Statistics & Probability (10 marks) ----
  "stat-data-collection": {
    id: "stat-data-collection",
    topic: "Collection of Data",
    unit: "Statistics and Probability",
    unitWeightage: 10,
    classification: "statistics",
    isPrerequisite: true,
    estimatedMinutes: 30,
  },
  "stat-presentation": {
    id: "stat-presentation",
    topic: "Presentation of Data",
    unit: "Statistics and Probability",
    unitWeightage: 10,
    classification: "statistics",
    isPrerequisite: false,
    estimatedMinutes: 40,
  },
  "stat-graphical-representation": {
    id: "stat-graphical-representation",
    topic: "Graphical Representation of Data",
    unit: "Statistics and Probability",
    unitWeightage: 10,
    classification: "statistics",
    isPrerequisite: false,
    estimatedMinutes: 45,
  },
  "stat-measures-central-tendency": {
    id: "stat-measures-central-tendency",
    topic: "Measures of Central Tendency",
    unit: "Statistics and Probability",
    unitWeightage: 10,
    classification: "statistics",
    isPrerequisite: false,
    estimatedMinutes: 45,
  },
  "stat-probability": {
    id: "stat-probability",
    topic: "Probability",
    unit: "Statistics and Probability",
    unitWeightage: 10,
    classification: "statistics",
    isPrerequisite: false,
    estimatedMinutes: 40,
  },
  "stat-frequency-distribution": {
    id: "stat-frequency-distribution",
    topic: "Frequency Distribution",
    unit: "Statistics and Probability",
    unitWeightage: 10,
    classification: "statistics",
    isPrerequisite: false,
    estimatedMinutes: 40,
  },
  "stat-cumulative-frequency": {
    id: "stat-cumulative-frequency",
    topic: "Cumulative Frequency",
    unit: "Statistics and Probability",
    unitWeightage: 10,
    classification: "statistics",
    isPrerequisite: false,
    estimatedMinutes: 35,
  },
};

const SYLLABUS_CONCEPT_BY_ID = Object.fromEntries(
  Object.values(SYLLABUS_CONCEPTS).map((c) => [c.id, c])
);

/* ------------------------------------------------------------ Lesson slug map */

/**
 * Map concept IDs to the closest available lesson (chapter) slug so that
 * plan tasks can link directly to the reader. Concepts without a matching
 * chapter are omitted — they render as text without a direct lesson link.
 */
const LESSON_SLUG_BY_CONCEPT = {
  // ---- Diagnostic concepts (CONCEPTS) ----
  "numbers-division": "foundation-1-numbers-and-signs",
  "numbers-integer-ops": "foundation-1-numbers-and-signs",
  "numbers-fraction-addition": "foundation-2-fractions-decimals-percentages",
  "numbers-decimal-multiplication": "foundation-2-fractions-decimals-percentages",
  "numbers-percentage": "foundation-2-fractions-decimals-percentages",
  "numbers-ratio-proportion": "foundation-3-ratio-and-proportion",
  "numbers-hcf-lcm": "foundation-1-numbers-and-signs",
  "numbers-exponents": "foundation-4-powers-and-roots",
  "algebra-like-terms": "foundation-5-basic-algebra",
  "algebra-linear-equation": "foundation-5-basic-algebra",
  "geometry-triangle-angle": "foundation-7-geometry-vocabulary",
  "mensuration-rectangle-area": "geometry-basics",
  "mixed-sign-rules": "foundation-1-numbers-and-signs",
  "mixed-fraction-division": "foundation-2-fractions-decimals-percentages",
  "mixed-decimal-fraction": "foundation-2-fractions-decimals-percentages",
  "algebra-expanding-brackets": "foundation-6-algebraic-operations",
  "algebra-equation-fraction": "foundation-5-basic-algebra",
  "mixed-rounding-placevalue": "foundation-1-numbers-and-signs",
  "mensuration-perimeter": "geometry-basics",
  "coordinates-quadrant": "geometry-basics",
  "coordinates-midpoint": "geometry-basics",
  // ---- Syllabus concepts: Number Systems ----
  "ns-real-numbers": "number-systems",
  "ns-irrational-numbers": "number-systems",
  "ns-representing-real-numbers": "number-systems",
  "ns-operations-real-numbers": "number-systems",
  "ns-laws-exponents": "number-systems",
  // ---- Syllabus concepts: Algebra / Polynomials ----
  "alg-polynomials": "polynomials",
  "alg-zeroes-polynomial": "polynomials",
  "alg-remainder-factor": "polynomials",
  "alg-factorisation": "polynomials",
  "alg-algebraic-identities": "polynomials",
  // ---- Syllabus concepts: Algebra / Linear Equations ----
  "alg-linear-eqns-2vars": "linear-equations",
  "alg-graph-linear-eqns": "linear-equations",
  "alg-equations-lines-parallel-axes": "linear-equations",
  // ---- Syllabus concepts: Coordinate Geometry ----
  "cg-cartesian-system": "geometry-basics",
  "cg-plotting-points": "geometry-basics",
  // ---- Syllabus concepts: Geometry ----
  "geo-euclid-geometry": "geometry-basics",
  "geo-lines-angles": "geometry-basics",
  "geo-triangles": "geometry-basics",
  "geo-congruence": "geometry-basics",
  "geo-quadrilaterals": "geometry-basics",
  "geo-areas-parallelograms": "geometry-basics",
  "geo-circles": "geometry-basics",
  "geo-constructions": "geometry-basics",
  "geo-herons-formula": "geometry-basics",
  // ---- Syllabus concepts: Mensuration ----
  "mens-surface-areas": "geometry-basics",
  "mens-surface-areas-cylinders": "geometry-basics",
  "mens-surface-areas-cone": "geometry-basics",
  "mens-surface-areas-sphere": "geometry-basics",
  "mens-volumes-cuboid-cube": "geometry-basics",
  "mens-volume-cylinder": "geometry-basics",
  "mens-volume-cone": "geometry-basics",
  "mens-volume-sphere": "geometry-basics",
  // ---- Syllabus concepts: Statistics & Probability ----
  "stat-data-collection": "geometry-basics",
  "stat-presentation": "geometry-basics",
  "stat-graphical-representation": "geometry-basics",
  "stat-measures-central-tendency": "geometry-basics",
  "stat-probability": "geometry-basics",
  "stat-frequency-distribution": "geometry-basics",
  "stat-cumulative-frequency": "geometry-basics",
};

function lessonSlugForConcept(conceptId) {
  return LESSON_SLUG_BY_CONCEPT[conceptId] || null;
}

/* ------------------------------------------------------------ Lesson → question concept map */

/**
 * Map reader lesson slugs to question bank conceptIds. Question bank conceptIds
 * use simpler names (e.g. "expanding-brackets") that don't match syllabus
 * concept IDs (e.g. "alg-polynomials"), so this bridge is needed for practice.
 */
const LESSON_SLUG_TO_QUESTION_CONCEPT = {
  // ---- Number Systems ----
  "number-systems": "real-numbers",
  "foundation-1-numbers-and-signs": "real-numbers",
  "foundation-2-fractions-decimals-percentages": "fractions-decimals",
  "foundation-4-powers-and-roots": "laws-exponents",
  // ---- Algebra ----
  "polynomials": "expanding-brackets",
  "foundation-5-basic-algebra": "expanding-brackets",
  "foundation-6-algebraic-operations": "expanding-brackets",
  "linear-equations": "linear-equations-one-var",
  // ---- Coordinate Geometry ----
  "geometry-basics": "midpoint",
  // ---- Mensuration / Geometry ----
  "area-rectangle": "area-rectangle",
  "perimeter": "perimeter",
};

function questionConceptIdForLessonSlug(slug) {
  return LESSON_SLUG_TO_QUESTION_CONCEPT[slug] || null;
}

/**
 * Get all concept IDs that map to a given lesson slug. Used by the reader
 * to sync lesson completion back to the study plan tasks.
 */
function conceptIdsForLessonSlug(slug) {
  return Object.entries(LESSON_SLUG_BY_CONCEPT)
    .filter(([, lessonSlug]) => lessonSlug === slug)
    .map(([conceptId]) => conceptId);
}

/* ------------------------------------------------------------ Time Allocation */

/**
 * Suggested study time per concept based on mastery state and priority.
 * These are initial estimates; actual time adapts to performance.
 */
function allocateStudyTime(concept) {
  const { masteryState, priorityScore, isPrerequisite } = concept;

  if (masteryState === "mastered") return 0;

  if (masteryState === "needs_verification") return 0; // Confirmation only, no study

  if (masteryState === "learning") {
    if (priorityScore >= 0.5) return 35; // Confirmed weakness, high priority
    if (priorityScore >= 0.25) return 25; // Confirmed weakness, medium priority
    return 20; // Confirmed weakness, lower priority
  }

  if (masteryState === "needs_reinforcement") return 25;

  // not_started — foundational prerequisite gets time, others get lighter introduction
  if (isPrerequisite) return 20;
  return 15;
}

/**
 * Distribute available minutes across concepts for a single day.
 * Respects per-concept time allocations and does not exceed daily limit.
 */
function distributeDailyMinutes(concepts, dailyLimit) {
  const plan = [];
  let remaining = dailyLimit;

  // Sort by learning sequence priority (prerequisites first)
  const sorted = [...concepts].sort((a, b) => b.learningSequencePriority - a.learningSequencePriority);

  for (const concept of sorted) {
    if (remaining <= 0) break;
    if (concept.masteryState === "mastered") continue;
    if (concept.masteryState === "needs_verification") continue; // No study time

    const allocated = Math.min(allocateStudyTime(concept), remaining);
    if (allocated > 0) {
      plan.push({
        conceptId: concept.id,
        topic: concept.topic,
        unit: concept.unit,
        minutes: allocated,
        masteryState: concept.masteryState,
        priorityScore: concept.priorityScore,
        learningSequencePriority: concept.learningSequencePriority,
      });
      remaining -= allocated;
    }
  }

  return { plan, remaining };
}

/* ------------------------------------------------------------ 45-Day Plan Generator */

/**
 * Study mode configurations.
 */
const STUDY_MODES = {
  normal: { dailyMinutes: 90, label: "Normal day" },
  busy: { dailyMinutes: 30, label: "Busy day" },
  veryBusy: { dailyMinutes: 15, label: "Very busy day" },
};

/**
 * Phase definitions for the 45-day plan.
 */
const PHASES = {
  foundationRepair: { start: 1, end: 10, label: "Foundation Repair" },
  syllabusDevelopment: { start: 11, end: 38, label: "Syllabus Development" },
  revisionPerformance: { start: 39, end: 45, label: "Revision & Performance" },
};

/**
 * Get the phase for a given day number.
 */
function getPhaseForDay(day) {
  if (day >= PHASES.foundationRepair.start && day <= PHASES.foundationRepair.end) {
    return PHASES.foundationRepair;
  }
  if (day >= PHASES.syllabusDevelopment.start && day <= PHASES.syllabusDevelopment.end) {
    return PHASES.syllabusDevelopment;
  }
  return PHASES.revisionPerformance;
}

/**
 * Generate a 45-day study plan.
 *
 * @param {Object} planData - Output from generatePlanData() with concept mastery states
 * @param {string} studyMode - "normal" | "busy" | "veryBusy"
 * @param {Object} completedWork - { [conceptId]: boolean } tracking completed concepts
 * @param {number} currentDay - Day to resume from (1-45), defaults to 1
 * @returns {Object} Complete 45-day plan with day-by-day assignments
 */
/**
 * Generate a 45-day study plan.
 *
 * @param {Object} planData - Output from generatePlanData() with concept mastery states
 * @param {string} studyMode - "normal" | "busy" | "veryBusy"
 * @param {Object} completedWork - { [conceptId]: boolean } tracking completed concepts
 * @param {number} currentDay - Day to resume from (1-45), defaults to 1
 * @returns {Object} Complete 45-day plan with day-by-day assignments
 */
function generate45DayPlan(planData, studyMode = "normal", completedWork = {}, currentDay = 1) {
  const mode = STUDY_MODES[studyMode] || STUDY_MODES.normal;
  const dailyLimit = mode.dailyMinutes;

  /* ---------------------------------------------------------------
   * Step 1: Build the canonical concept registry.
   * All syllabus concepts start as not_started. Diagnostic results
   * are mapped through CANONICAL_REGISTRY so confirmed weaknesses
   * carry into syllabus scheduling.
   * --------------------------------------------------------------- */
  const allConcepts = {};

  for (const [id, concept] of Object.entries(SYLLABUS_CONCEPTS)) {
    allConcepts[id] = {
      ...concept,
      masteryState: "not_started",
      priorityScore: 0,
      learningSequencePriority: 0,
      assessmentRequired: false,
      studyTimeAllocated: false,
      evidence: [],
    };
  }

  // Override syllabus concepts with diagnostic-based mastery states,
  // resolving diagnostic concept IDs through the canonical registry.
  if (planData && planData.concepts) {
    for (const [diagId, entry] of Object.entries(planData.concepts)) {
      const canonId = resolveCanonicalId(diagId);
      if (canonId && allConcepts[canonId]) {
        // Diagnostic result maps to a syllabus concept — apply mastery state
        allConcepts[canonId] = {
          ...allConcepts[canonId],
          masteryState: entry.masteryState,
          priorityScore: entry.priorityScore,
          learningSequencePriority: entry.learningSequencePriority,
          assessmentRequired: entry.assessmentRequired,
          studyTimeAllocated: entry.studyTimeAllocated,
          evidence: entry.evidence,
        };
      } else if (!canonId) {
        // Diagnostic concept not in syllabus registry — add as-is
        allConcepts[diagId] = entry;
      }
    }
  }

  // Compute learning sequence priority for all concepts
  for (const concept of Object.values(allConcepts)) {
    concept.learningSequencePriority = calculateLearningSequencePriority(concept);
  }

  /* ---------------------------------------------------------------
   * Step 2: Separate concepts into groups for scheduling.
   * --------------------------------------------------------------- */
  const needsLearning = Object.values(allConcepts).filter(
    (c) => c.masteryState === "learning" || c.masteryState === "needs_reinforcement"
  );
  const needsVerification = Object.values(allConcepts).filter(
    (c) => c.masteryState === "needs_verification"
  );
  const notStarted = Object.values(allConcepts).filter(
    (c) => c.masteryState === "not_started"
  );
  const mastered = Object.values(allConcepts).filter(
    (c) => c.masteryState === "mastered"
  );

  const sortConcepts = (a, b) => {
    if (b.learningSequencePriority !== a.learningSequencePriority) return b.learningSequencePriority - a.learningSequencePriority;
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return a.id.localeCompare(b.id);
  };

  needsLearning.sort(sortConcepts);
  needsVerification.sort(sortConcepts);
  notStarted.sort(sortConcepts);

  /* ---------------------------------------------------------------
   * Step 3: Build day-by-day plan with deduplication across phases.
   * taughtConcepts tracks concepts taught as new lessons to prevent
   * re-teaching in later phases. Revision in Phase 3 is intentional
   * and allowed.
   * --------------------------------------------------------------- */
  const dailyPlan = [];
  const taughtConcepts = new Set(); // Concepts taught as new lessons
  let day = currentDay;

  // Helper: allocate concepts for a single day, respecting daily limit
  const allocateDay = (conceptPool, remaining, phaseLabel, isRevision = false) => {
    const dayConcepts = [];
    const sorted = [...conceptPool].sort(sortConcepts);

    for (const concept of sorted) {
      if (remaining <= 0) break;
      if (concept.masteryState === "mastered") continue;
      if (!isRevision && taughtConcepts.has(concept.id)) continue; // Already taught as new lesson
      if (completedWork[concept.id]) continue;

      const baseTime = isRevision ? Math.ceil(allocateStudyTime(concept) * 0.7) : allocateStudyTime(concept);
      const allocated = Math.min(baseTime, remaining);

      if (allocated > 0) {
        dayConcepts.push({
          conceptId: concept.id,
          lessonSlug: lessonSlugForConcept(concept.id),
          topic: concept.topic,
          unit: concept.unit,
          minutes: allocated,
          masteryState: concept.masteryState,
          priorityScore: concept.priorityScore,
          phase: phaseLabel,
          isPrerequisite: concept.isPrerequisite,
          isRevision,
          isNewLesson: !isRevision && !taughtConcepts.has(concept.id),
        });
        remaining -= allocated;

        // Mark concept as taught if it's a new lesson
        if (!isRevision && !taughtConcepts.has(concept.id)) {
          taughtConcepts.add(concept.id);
        }
      }
    }

    // Fill remaining time with revision activity (no new concept)
    if (remaining > 0 && dayConcepts.length > 0) {
      dayConcepts.push({
        conceptId: "revision-practice",
        topic: "Revision and practice",
        unit: "Review",
        minutes: remaining,
        masteryState: "review",
        priorityScore: 0,
        phase: phaseLabel,
        isPrerequisite: false,
        isRevision: true,
        isNewLesson: false,
      });
    }

    return { dayConcepts, remaining };
  };

  // Phase 1: Foundation Repair (Days 1-10)
  // Focus on confirmed weaknesses (learning) and prerequisites.
  let conceptQueue = [...needsLearning, ...notStarted].sort(sortConcepts);

  for (; day <= PHASES.foundationRepair.end && day <= 45; day++) {
    const phase = getPhaseForDay(day);
    const { dayConcepts, remaining } = allocateDay(conceptQueue, dailyLimit, phase.label);

    if (dayConcepts.length > 0) {
      dailyPlan.push({
        day,
        phase: phase.label,
        dayType: studyMode,
        dailyLimit,
        concepts: dayConcepts,
        totalMinutes: dayConcepts.reduce((sum, c) => sum + c.minutes, 0),
      });
    }

    // Remove completed concepts from queue
    conceptQueue = conceptQueue.filter((c) => !completedWork[c.id]);
  }

  // Phase 2: Syllabus Development (Days 11-38)
  // Cover remaining syllabus concepts not yet taught as new lessons.
  const phase2Queue = Object.values(allConcepts).filter(
    (c) => c.masteryState !== "mastered" && !taughtConcepts.has(c.id) && !completedWork[c.id]
  ).sort(sortConcepts);

  for (; day <= PHASES.syllabusDevelopment.end && day <= 45; day++) {
    const phase = getPhaseForDay(day);
    const { dayConcepts, remaining } = allocateDay(phase2Queue, dailyLimit, phase.label);

    if (dayConcepts.length > 0) {
      dailyPlan.push({
        day,
        phase: phase.label,
        dayType: studyMode,
        dailyLimit,
        concepts: dayConcepts,
        totalMinutes: dayConcepts.reduce((sum, c) => sum + c.minutes, 0),
      });
    }

    // Remove taught concepts from queue for next day
    const taughtToday = new Set();
    for (const c of phase2Queue) {
      if (taughtConcepts.has(c.id)) taughtToday.add(c.id);
    }
    // phase2Queue is rebuilt each day from allConcepts, so we just continue
    // The taughtConcepts set prevents re-teaching
  }

  // Phase 3: Revision & Performance (Days 39-45)
  // Review previously taught concepts. Intentional revision is allowed.
  const revisionQueue = [...needsLearning, ...notStarted].filter(
    (c) => taughtConcepts.has(c.id) || c.masteryState === "needs_reinforcement"
  ).sort(sortConcepts);

  for (; day <= PHASES.revisionPerformance.end && day <= 45; day++) {
    const phase = getPhaseForDay(day);
    const { dayConcepts, remaining } = allocateDay(revisionQueue, dailyLimit, phase.label, true);

    if (dayConcepts.length > 0) {
      dailyPlan.push({
        day,
        phase: phase.label,
        dayType: studyMode,
        dailyLimit,
        concepts: dayConcepts,
        totalMinutes: dayConcepts.reduce((sum, c) => sum + c.minutes, 0),
      });
    }
  }

  /* ---------------------------------------------------------------
   * Step 4: Calculate coverage statistics.
   * --------------------------------------------------------------- */
  const allSyllabusConceptIds = Object.keys(SYLLABUS_CONCEPTS);
  const taughtConceptIds = new Set();
  for (const dayEntry of dailyPlan) {
    for (const c of dayEntry.concepts) {
      if (c.conceptId !== "revision-practice") taughtConceptIds.add(c.conceptId);
    }
  }

  const coveragePercent = Math.round((taughtConceptIds.size / allSyllabusConceptIds.length) * 100);

  return {
    planVersion: PLAN_VERSION,
    generatedAt: new Date().toISOString(),
    studyMode,
    dailyLimit,
    totalDays: dailyPlan.length,
    phases: {
      foundationRepair: PHASES.foundationRepair,
      syllabusDevelopment: PHASES.syllabusDevelopment,
      revisionPerformance: PHASES.revisionPerformance,
    },
    dailyPlan,
    coverage: {
      totalSyllabusConcepts: allSyllabusConceptIds.length,
      coveredConcepts: taughtConceptIds.size,
      coveragePercent,
    },
    summary: {
      totalMinutesPlanned: dailyPlan.reduce((sum, d) => sum + d.totalMinutes, 0),
      averageMinutesPerDay: dailyPlan.length > 0
        ? Math.round(dailyPlan.reduce((sum, d) => sum + d.totalMinutes, 0) / dailyPlan.length)
        : 0,
      conceptsNeedingLearning: needsLearning.length,
      conceptsNeedingVerification: needsVerification.length,
      conceptsMastered: mastered.length,
      conceptsTaught: taughtConceptIds.size,
    },
  };
}

/**
 * Reschedule unfinished work after a missed day.
 *
 * Moves incomplete concepts from missed days forward while preserving
 * completed work and the original learning sequence.
 */
function rescheduleAfterMissedDay(existingPlan, completedWork, resumeDay, studyMode = "normal", planData = null) {
  // Collect unfinished concept IDs from days >= resumeDay
  const unfinishedConceptIds = new Set();

  for (const dayEntry of existingPlan.dailyPlan) {
    if (dayEntry.day < resumeDay) continue;

    for (const concept of dayEntry.concepts) {
      if (concept.conceptId === "revision-practice") continue;
      if (completedWork[concept.conceptId]) continue;
      unfinishedConceptIds.add(concept.conceptId);
    }
  }

  // Build minimal planData from existing plan's concepts for regeneration
  if (!planData && existingPlan.dailyPlan.length > 0) {
    const concepts = {};
    for (const dayEntry of existingPlan.dailyPlan) {
      for (const concept of dayEntry.concepts) {
        if (concept.conceptId === "revision-practice") continue;
        concepts[concept.conceptId] = {
          id: concept.conceptId,
          topic: concept.topic,
          unit: concept.unit,
          unitWeightage: 0,
          classification: "",
          isPrerequisite: false,
          masteryState: concept.masteryState,
          priorityScore: concept.priorityScore,
          learningSequencePriority: 0,
          assessmentRequired: false,
          studyTimeAllocated: false,
          evidence: [],
        };
      }
    }
    planData = {
      planVersion: PLAN_VERSION,
      generatedAt: new Date().toISOString(),
      diagnosticVersion: 1,
      curriculumVersion: CURRICULUM_VERSION,
      studentId: "local-device-only",
      totalQuestions: 0,
      concepts,
      sortedConceptIds: Object.keys(concepts),
      summary: {
        totalConcepts: Object.keys(concepts).length,
        mastered: 0,
        learning: 0,
        needsVerification: 0,
        notStarted: 0,
      },
    };
  }

  // Regenerate plan from resume day onward
  const newPlan = generate45DayPlan(planData || existingPlan, studyMode, completedWork, resumeDay);

  return newPlan;
}

/* ------------------------------------------------------------ Exports */

export {
  CONCEPTS,
  CONCEPT_BY_ID,
  SYLLABUS_CONCEPTS,
  SYLLABUS_CONCEPT_BY_ID,
  CANONICAL_REGISTRY,
  CANONICAL_TO_DIAGNOSTIC,
  resolveCanonicalId,
  DIAGNOSTIC_RESULTS_KEY,
  ADAPTIVE_PLAN_KEY,
  normalizeAnswer,
  stripUnits,
  tryParseNumber,
  answersEquivalent,
  assignInitialMastery,
  calculatePriorityScore,
  calculateLearningSequencePriority,
  validateDiagnosticResults,
  isDiagnosticDataOutdated,
  mapDiagnosticToConcepts,
  generatePlanData,
  generate45DayPlan,
  rescheduleAfterMissedDay,
  STUDY_MODES,
  PHASES,
  savePlanData,
  readPlanData,
  clearPlanData,
  lessonSlugForConcept,
  conceptIdsForLessonSlug,
  questionConceptIdForLessonSlug,
};
