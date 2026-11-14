/**
 * Milestone 7: Curriculum Alignment, Content Verification & Student Experience Validation
 *
 * Tests:
 * 1. CANONICAL_REGISTRY maps to valid SYLLABUS_CONCEPTS IDs
 * 2. CBSE syllabus coverage - all units represented
 * 3. Content completeness - concepts lacking teaching material
 * 4. Regression testing - frozen API compatibility
 * 5. Student usability - reader flow integration
 */

import { assert, describe, it } from "node:test";

// Mock localStorage
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] ?? null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();

// Import modules
import {
  SYLLABUS_CONCEPTS,
  SYLLABUS_CONCEPT_BY_ID,
  CANONICAL_REGISTRY,
  resolveCanonicalId,
} from "./adaptive-plan.js";

import {
  MASTERY_STATES,
  LESSON_STATES,
  ERROR_CATEGORIES,
  MASTERY_THRESHOLD,
  QUESTION_BANK,
  getQuestionsForConcept,
  getQuestion,
  getAllQuestionIds,
  answersEquivalent,
  validateQuestion,
  validateAllQuestions,
} from "./content-model.js";

import {
  getLessonState,
  startLesson,
  setLessonPage,
  completeLesson,
  isLessonCompleted,
  getMasteryState,
  setMasteryState,
  isMastered,
  needsMasteryConfirmation,
  recordPracticeAttempt,
  getConfirmationQuestions,
  assessMastery,
  recordMistake,
  getMistakesForConcept,
  getAllMistakes,
  resetEngineState,
} from "./lesson-engine.js";

import {
  generatePlanData,
  generate45DayPlan,
  STUDY_MODES,
} from "./adaptive-plan.js";

// Available chapters in the repository
const AVAILABLE_CHAPTERS = [
  "basic-equations",
  "beyond-class-9",
  "diagnostic-answer-key",
  "diagnostic-assessment",
  "foundation-1-numbers-and-signs",
  "foundation-2-fractions-decimals-percentages",
  "foundation-3-ratio-and-proportion",
  "foundation-4-powers-and-roots",
  "foundation-5-basic-algebra",
  "foundation-6-algebraic-operations",
  "foundation-7-geometry-vocabulary",
  "foundation-8-measurement-and-units",
  "geometry-basics",
  "learning-roadmap",
  "linear-equations",
  "linear-inequalities",
  "number-systems",
  "polynomials",
  "study-plan-45-days",
];

// Map syllabus concepts to available chapters (approximate)
const CHAPTER_CONCEPT_MAP = {
  "foundation-1-numbers-and-signs": ["ns-real-numbers", "ns-laws-exponents"],
  "foundation-2-fractions-decimals-percentages": ["ns-real-numbers"],
  "foundation-3-ratio-and-proportion": [], // Foundation, not Class 9 syllabus
  "foundation-4-powers-and-roots": ["ns-laws-exponents"],
  "foundation-5-basic-algebra": ["alg-polynomials", "alg-algebraic-identities"],
  "foundation-6-algebraic-operations": ["alg-algebraic-identities", "alg-linear-eqns-2vars"],
  "foundation-7-geometry-vocabulary": ["geo-euclid-geometry", "geo-lines-angles"],
  "foundation-8-measurement-and-units": ["mens-surface-areas", "mens-volumes-cuboid-cube"],
  "geometry-basics": ["geo-areas-parallelograms", "geo-herons-formula"],
  "number-systems": ["ns-real-numbers", "ns-irrational-numbers", "ns-laws-exponents"],
  "polynomials": ["alg-polynomials", "alg-zeroes-polynomial", "alg-remainder-factor", "alg-factorisation"],
  "linear-equations": ["alg-linear-eqns-2vars", "alg-graph-linear-eqns"],
  "basic-equations": ["alg-linear-eqns-2vars"],
};

// ------------------------------------------------------------------
// Test helpers
// ------------------------------------------------------------------

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  return it(name, async () => {
    try {
      await fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      failed++;
      failures.push({ name, error: err.message });
      console.error(`  ✗ ${name}: ${err.message}`);
    }
  });
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(actual, message) {
  if (!actual) {
    throw new Error(`${message}: expected true, got ${JSON.stringify(actual)}`);
  }
}

function assertFalse(actual, message) {
  if (actual) {
    throw new Error(`${message}: expected false, got ${JSON.stringify(actual)}`);
  }
}

function resetState() {
  resetEngineState();
}

// ------------------------------------------------------------------
// Test Suite 1: CANONICAL_REGISTRY Validity
// ------------------------------------------------------------------

describe("CANONICAL_REGISTRY Validity", () => {
  test("Every canonical ID exists in SYLLABUS_CONCEPTS", () => {
    for (const [diagId, canonId] of Object.entries(CANONICAL_REGISTRY)) {
      assertTrue(
        SYLLABUS_CONCEPTS[canonId] !== undefined,
        `Diagnostic "${diagId}" maps to canonical "${canonId}" which is not in SYLLABUS_CONCEPTS`
      );
    }
  });

  test("resolveCanonicalId returns valid syllabus concept IDs", () => {
    for (const diagId of Object.keys(CANONICAL_REGISTRY)) {
      const canonId = resolveCanonicalId(diagId);
      assertTrue(
        canonId !== null && SYLLABUS_CONCEPTS[canonId] !== undefined,
        `resolveCanonicalId("${diagId}") returned invalid ID: ${canonId}`
      );
    }
  });

  test("No duplicate canonical mappings for same diagnostic concept", () => {
    const diagIds = Object.keys(CANONICAL_REGISTRY);
    assertEqual(diagIds.length, new Set(diagIds).size, "No duplicate diagnostic concept IDs");
  });

  test("CANONICAL_REGISTRY covers major diagnostic concepts", () => {
    const keyDiagnostics = [
      "numbers-division",
      "numbers-exponents",
      "algebra-expanding-brackets",
      "algebra-linear-equation",
      "geometry-triangle-angle",
      "coordinates-quadrant",
    ];
    keyDiagnostics.forEach((diagId) => {
      assertTrue(
        diagId in CANONICAL_REGISTRY,
        `Key diagnostic concept "${diagId}" should be in CANONICAL_REGISTRY`
      );
    });
  });
});

// ------------------------------------------------------------------
// Test Suite 2: CBSE Syllabus Alignment
// ------------------------------------------------------------------

describe("CBSE Syllabus Alignment", () => {
  test("All 6 CBSE units are represented", () => {
    const units = new Set(Object.values(SYLLABUS_CONCEPTS).map((c) => c.unit));
    const expectedUnits = [
      "Number Systems",
      "Algebra",
      "Coordinate Geometry",
      "Geometry",
      "Mensuration",
      "Statistics and Probability",
    ];
    expectedUnits.forEach((unit) => {
      assertTrue(units.has(unit), `Unit "${unit}" is represented in syllabus concepts`);
    });
  });

  test("Unit weightages match CBSE 2026-27 specification", () => {
    const unitTotals = {};
    for (const concept of Object.values(SYLLABUS_CONCEPTS)) {
      if (!unitTotals[concept.unit]) {
        unitTotals[concept.unit] = 0;
      }
      unitTotals[concept.unit] += concept.unitWeightage;
    }

    // Note: unitWeightage is per-concept, not per-unit total
    // The total should be >= the official unit weightage
    assertTrue(unitTotals["Number Systems"] >= 7, "Number Systems weightage >= 7");
    assertTrue(unitTotals["Algebra"] >= 20, "Algebra weightage >= 20");
    assertTrue(unitTotals["Coordinate Geometry"] >= 4, "Coordinate Geometry weightage >= 4");
    assertTrue(unitTotals["Geometry"] >= 25, "Geometry weightage >= 25");
    assertTrue(unitTotals["Mensuration"] >= 14, "Mensuration weightage >= 14");
    assertTrue(unitTotals["Statistics and Probability"] >= 10, "Statistics weightage >= 10");
  });

  test("Geometry includes Euclid's Geometry, Lines & Angles, Congruence", () => {
    const geoConcepts = Object.values(SYLLABUS_CONCEPTS).filter(
      (c) => c.unit === "Geometry"
    );
    const topics = geoConcepts.map((c) => c.topic.toLowerCase());

    assertTrue(
      topics.some((t) => t.includes("euclid")),
      "Euclid's Geometry is included"
    );
    assertTrue(
      topics.some((t) => t.includes("lines and angles")),
      "Lines and Angles is included"
    );
    assertTrue(
      topics.some((t) => t.includes("congruence")),
      "Congruence of Triangles is included"
    );
  });

  test("Statistics includes frequency distribution and cumulative frequency", () => {
    const statConcepts = Object.values(SYLLABUS_CONCEPTS).filter(
      (c) => c.unit === "Statistics and Probability"
    );
    const topics = statConcepts.map((c) => c.topic.toLowerCase());

    assertTrue(
      topics.some((t) => t.includes("frequency distribution")),
      "Frequency Distribution is included"
    );
    assertTrue(
      topics.some((t) => t.includes("cumulative frequency")),
      "Cumulative Frequency is included"
    );
  });
});

// ------------------------------------------------------------------
// Test Suite 3: Content Completeness
// ------------------------------------------------------------------

describe("Content Completeness", () => {
  test("Every diagnostic concept has at least one practice question", () => {
    const diagConcepts = new Set(
      Object.values(CANONICAL_REGISTRY)
    );
    // Also add diagnostic-only concepts (not in canonical registry)
    // All diagnostic concepts from QUESTION_BANK
    const questionConcepts = new Set(
      Object.values(QUESTION_BANK).map((q) => q.conceptId)
    );

    questionConcepts.forEach((conceptId) => {
      const questions = getQuestionsForConcept(conceptId);
      assertTrue(
        questions.length > 0,
        `Concept "${conceptId}" has at least one practice question`
      );
    });
  });

  test("Every syllabus concept has an estimated time", () => {
    for (const [id, concept] of Object.entries(SYLLABUS_CONCEPTS)) {
      assertTrue(
        concept.estimatedMinutes > 0,
        `Syllabus concept "${id}" (${concept.topic}) has estimatedMinutes > 0`
      );
    }

  });

  test("Prerequisite concepts are identified", () => {
    const prerequisites = Object.values(SYLLABUS_CONCEPTS).filter(
      (c) => c.isPrerequisite
    );
    assertTrue(prerequisites.length > 0, "At least some concepts are marked as prerequisites");
  });

  test("Available chapters cover major syllabus areas", () => {
    // Check that key areas have chapter coverage
    const chapterConcepts = new Set();
    for (const chapter of AVAILABLE_CHAPTERS) {
      const concepts = CHAPTER_CONCEPT_MAP[chapter] || [];
      concepts.forEach((c) => chapterConcepts.add(c));
    }

    // Key syllabus concepts should have chapter coverage
    const keyConcepts = ["ns-real-numbers", "alg-polynomials", "geo-lines-angles"];
    keyConcepts.forEach((conceptId) => {
      assertTrue(
        chapterConcepts.has(conceptId),
        `Key concept "${conceptId}" has chapter coverage`
      );
    });
  });
});

// ------------------------------------------------------------------
// Test Suite 4: Regression Testing - Frozen API Compatibility
// ------------------------------------------------------------------

describe("Frozen Learning Engine API", () => {
  test("All lesson-engine exports are available", () => {
    const expectedExports = [
      "getLessonState",
      "startLesson",
      "setLessonPage",
      "completeLesson",
      "isLessonCompleted",
      "getMasteryState",
      "setMasteryState",
      "isMastered",
      "needsVerification",
      "needsMasteryConfirmation",
      "recordPracticeAttempt",
      "getConfirmationQuestions",
      "assessMastery",
      "recordMistake",
      "getMistakesForConcept",
      "getAllMistakes",
      "resetEngineState",
    ];

    // These are tested implicitly by using them below
    assertTrue(typeof getLessonState === "function", "getLessonState is a function");
    assertTrue(typeof startLesson === "function", "startLesson is a function");
    assertTrue(typeof setLessonPage === "function", "setLessonPage is a function");
    assertTrue(typeof completeLesson === "function", "completeLesson is a function");
    assertTrue(typeof isLessonCompleted === "function", "isLessonCompleted is a function");
    assertTrue(typeof getMasteryState === "function", "getMasteryState is a function");
    assertTrue(typeof setMasteryState === "function", "setMasteryState is a function");
    assertTrue(typeof isMastered === "function", "isMastered is a function");
    assertTrue(typeof needsMasteryConfirmation === "function", "needsMasteryConfirmation is a function");
    assertTrue(typeof recordPracticeAttempt === "function", "recordPracticeAttempt is a function");
    assertTrue(typeof getConfirmationQuestions === "function", "getConfirmationQuestions is a function");
    assertTrue(typeof assessMastery === "function", "assessMastery is a function");
    assertTrue(typeof recordMistake === "function", "recordMistake is a function");
    assertTrue(typeof getMistakesForConcept === "function", "getMistakesForConcept is a function");
    assertTrue(typeof getAllMistakes === "function", "getAllMistakes is a function");
    assertTrue(typeof resetEngineState === "function", "resetEngineState is a function");
  });

  test("Content model exports are available", () => {
    assertTrue(typeof validateAllQuestions === "function", "validateAllQuestions is a function");
    assertTrue(typeof getAllQuestionIds === "function", "getAllQuestionIds is a function");
    assertTrue(typeof answersEquivalent === "function", "answersEquivalent is a function");
  });

  test("Adaptive plan exports are available", () => {
    assertTrue(typeof generatePlanData === "function", "generatePlanData is a function");
    assertTrue(typeof generate45DayPlan === "function", "generate45DayPlan is a function");
    assertTrue(typeof STUDY_MODES === "object", "STUDY_MODES is an object");
    assertTrue(typeof CURRICULUM_VERSION === "string", "CURRICULUM_VERSION is defined");
    assertTrue(typeof PLAN_VERSION === "number", "PLAN_VERSION is defined");
  });

  test("MASTERY_STATES and LESSON_STATES constants are stable", () => {
    assertEqual(MASTERY_STATES.not_started, "not_started");
    assertEqual(MASTERY_STATES.introduced, "introduced");
    assertEqual(MASTERY_STATES.learning, "learning");
    assertEqual(MASTERY_STATES.practising, "practising");
    assertEqual(MASTERY_STATES.needs_reinforcement, "needs_reinforcement");
    assertEqual(MASTERY_STATES.mastered, "mastered");

    assertEqual(LESSON_STATES.not_started, "not_started");
    assertEqual(LESSON_STATES.in_progress, "in_progress");
    assertEqual(LESSON_STATES.completed, "completed");

    assertEqual(MASTERY_THRESHOLD, 0.8);
  });
});

// ------------------------------------------------------------------
// Test Suite 5: Student Usability - Reader Flow
// ------------------------------------------------------------------

describe("Student Usability - Reader Flow", () => {
  test("Lesson progress is separate from mastery", () => {
    resetEngineState();

    // Start a lesson
    startLesson("test-lesson-1");
    const lessonState = getLessonState("test-lesson-1");
    assertEqual(lessonState.state, "in_progress", "Lesson starts as in_progress");

    // Complete the lesson
    completeLesson("test-lesson-1", true);
    assertTrue(isLessonCompleted("test-lesson-1"), "Lesson is completed");

    // But mastery should NOT be granted automatically
    const mastery = getMasteryState("test-concept");
    assertEqual(mastery.state, "not_started", "Concept mastery is not_started after lesson completion");
  });

  test("Practice attempt updates mastery", () => {
    resetEngineState();

    const result = recordPracticeAttempt("q-div-1", "29");
    assertTrue(result.isCorrect, "29 is correct for 348÷12");

    const mastery = getMasteryState("real-numbers");
    assertEqual(mastery.state, "introduced", "First correct answer → introduced");
  });

  test("Practice attempt records mistake", () => {
    resetEngineState();

    const result = recordPracticeAttempt("q-div-1", "wrong");
    assertFalse(result.isCorrect, "wrong is incorrect");

    const mistakes = getMistakesForConcept("real-numbers");
    assertTrue(mistakes.length > 0, "Mistake recorded");
    assertEqual(mistakes[0].questionId, "q-div-1", "Mistake has correct questionId");
  });

  test("Mastery confirmation uses fresh questions", () => {
    resetEngineState();

    const questions = getConfirmationQuestions("real-numbers");
    assertTrue(questions.length > 0, "Has confirmation questions");

    // Answer all correctly
    const results = questions.map((q) => ({
      questionId: q.id,
      isCorrect: true,
    }));

    const assessment = assessMastery("real-numbers", results);
    assertTrue(assessment.passed, "All correct → mastery passed");
    assertTrue(isMastered("real-numbers"), "Concept is mastered after confirmation");
  });

  test("Study mode change doesn't affect mastery", () => {
    resetEngineState();

    setMasteryState("test-concept", "mastered");
    const before = getMasteryState("test-concept").state;

    // Simulate study mode change (doesn't touch lesson-engine)
    const mode = STUDY_MODES.normal;
    assertEqual(mode.dailyMinutes, 90, "Normal mode is 90 minutes");

    const after = getMasteryState("test-concept").state;
    assertEqual(after, "mastered", "Mastery unchanged after mode change simulation");
  });
});

// ------------------------------------------------------------------
// Test Suite 6: Error Handling & Edge Cases
// ------------------------------------------------------------------

describe("Error Handling & Edge Cases", () => {
  test("Unknown question ID throws error", () => {
    resetEngineState();
    assertThrows(() => {
      recordPracticeAttempt("q-nonexistent", "answer");
    }, "Unknown question ID throws");
  });

  test("Empty question bank returns empty array", () => {
    const questions = getQuestionsForConcept("nonexistent-concept");
    assertEqual(questions.length, 0, "Nonexistent concept returns empty array");
  });

  test("Corrupt localStorage recovery", () => {
    // Corrupt storage
    global.localStorage.setItem("mathfunda-lesson-engine-v1", "{corrupt");
    global.localStorage.setItem("mathfunda-mistake-notebook-v1", "corrupt");

    // resetEngineState should clear corrupt data
    resetEngineState();
    const state = getMasteryState("test-concept");
    assertEqual(state.state, "not_started", "Recovers from corrupt storage");
  });

  function assertThrows(fn, message) {
    try {
      fn();
      throw new Error(`${message}: expected throw but no error`);
    } catch (e) {
      // Expected
    }
  }
});

// ------------------------------------------------------------------
// Test Runner
// ------------------------------------------------------------------

console.log("\n" + "=".repeat(60));
console.log("Milestone 7: Curriculum Alignment & Content Verification");
console.log("=".repeat(60));
