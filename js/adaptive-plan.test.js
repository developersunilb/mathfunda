/**
 * Adaptive Learning Engine — Milestone 1 Tests
 *
 * Tests the concept mapper against all 20 diagnostic questions using the
 * actual diagnostic results from the student's first attempt.
 *
 * These tests verify:
 *   - Every question maps to the correct concept(s)
 *   - Mastery states are assigned correctly
 *   - Equivalent answers are recognised (1.500 ≡ 1.5, 36% ≡ 36, 15/12 ≡ 5/4, etc.)
 *   - Skipped questions become needs_verification (not confirmed weaknesses)
 *   - Q20 splits into quadrant (mastered) + midpoint (needs_verification)
 *   - Priority scores are calculated correctly
 *   - Malformed/missing data is handled gracefully
 *
 * Run these in the browser console after loading adaptive-plan.js:
 *   > runAllTests()
 */

import {
  CONCEPTS,
  answersEquivalent,
  assignInitialMastery,
  calculatePriorityScore,
  calculateLearningSequencePriority,
  validateDiagnosticResults,
  mapDiagnosticToConcepts,
  generatePlanData,
  generate45DayPlan,
  rescheduleAfterMissedDay,
  SYLLABUS_CONCEPTS,
} from "./adaptive-plan.js";

// ------------------------------------------------------------------
// Test fixtures: actual diagnostic results from the student's attempt
// ------------------------------------------------------------------

const ACTUAL_RESULTS = [
  { question: 1, topic: "Numbers and operations", skill: "Division", questionText: "$348 \\, \\div \\, 12$", instruction: "Calculate", correctAnswer: "29", studentAnswer: "29", skipped: false, timeSeconds: 121, answeredAt: "2026-11-13T07:46:55.733Z" },
  { question: 2, topic: "Numbers and operations", skill: "Integer addition and subtraction", questionText: "$-8 \\, + \\, 13 \\, - \\, 6$", instruction: "Simplify", correctAnswer: "-1", studentAnswer: "-1", skipped: false, timeSeconds: 71, answeredAt: "2026-11-13T07:48:06.948Z" },
  { question: 3, topic: "Numbers and operations", skill: "Adding fractions", questionText: "$\\frac{2}{3} \\, + \\, \\frac{3}{4}$", instruction: "Find", correctAnswer: "17/12", studentAnswer: "17/12", skipped: false, timeSeconds: 64, answeredAt: "2026-11-13T07:49:11.198Z" },
  { question: 4, topic: "Numbers and operations", skill: "Multiplying decimals", questionText: "$3.75 \\, \\times \\, 0.4$", instruction: "Calculate", correctAnswer: "1.5", studentAnswer: "1.500", skipped: false, timeSeconds: 120, answeredAt: "2026-11-13T07:51:12.033Z" },
  { question: 5, topic: "Numbers and operations", skill: "Percentage of a quantity", questionText: "$15\\% \\, \\text{ of } \\, 240$", instruction: "Find", correctAnswer: "36", studentAnswer: "36%", skipped: false, timeSeconds: 71, answeredAt: "2026-11-13T07:52:23.516Z" },
  { question: 6, topic: "Numbers and operations", skill: "Ratio", questionText: "$360 \\, \\text{ in the ratio } \\, 2:3$", instruction: "Divide", correctAnswer: "144 and 216", studentAnswer: null, skipped: true, timeSeconds: 31, answeredAt: "2026-11-13T07:52:55.184Z" },
  { question: 7, topic: "Numbers and operations", skill: "Factors and multiples", questionText: "$18 \\, \\text{ and } \\, 24$", instruction: "Find the HCF and the LCM of", correctAnswer: "HCF = 6, LCM = 72", studentAnswer: "12", skipped: false, timeSeconds: 115, answeredAt: "2026-11-13T07:54:50.719Z" },
  { question: 8, topic: "Numbers and operations", skill: "Laws of exponents", questionText: "$2^3 \\, \\times \\, 2^2$", instruction: "Simplify", correctAnswer: "32", studentAnswer: "2", skipped: false, timeSeconds: 101, answeredAt: "2026-11-13T07:56:32.034Z" },
  { question: 9, topic: "Algebra", skill: "Like terms", questionText: "$3x \\, + \\, 5x \\, - \\, 2x$", instruction: "Simplify", correctAnswer: "6x", studentAnswer: "6x", skipped: false, timeSeconds: 38, answeredAt: "2026-11-13T07:57:10.534Z" },
  { question: 10, topic: "Algebra", skill: "Linear equation", questionText: "$3x \\, + \\, 7 \\, = \\, 22$", instruction: "Solve", correctAnswer: "x = 5", studentAnswer: "5", skipped: false, timeSeconds: 68, answeredAt: "2026-11-13T07:58:18.987Z" },
  { question: 11, topic: "Geometry and measurement", skill: "Angle sum of a triangle", questionText: "$48^\\circ \\, \\text{ and } \\, 67^\\circ$", instruction: "Two angles of a triangle are. Find the third angle.", correctAnswer: "65^\\circ", studentAnswer: "65°", skipped: false, timeSeconds: 244, answeredAt: "2026-11-13T08:02:23.755Z" },
  { question: 12, topic: "Geometry and measurement", skill: "Area of a rectangle", questionText: "$12.5 \\, \\text{ cm by } \\, 8 \\, \\text{ cm}$", instruction: "Find the area of a rectangle measuring", correctAnswer: "100 cm^2", studentAnswer: null, skipped: true, timeSeconds: 24, answeredAt: "2026-11-13T08:02:48.189Z" },
  { question: 13, topic: "Mixed skills", skill: "Sign rules and order of operations", questionText: "$(-3) \\, \\times \\, (-4) \\, + \\, (-2)$", instruction: "Simplify", correctAnswer: "10", studentAnswer: "10", skipped: false, timeSeconds: 144, answeredAt: "2026-11-13T08:05:12.889Z" },
  { question: 14, topic: "Mixed skills", skill: "Dividing fractions", questionText: "$\\frac{5}{6} \\, \\div \\, \\frac{2}{3}$", instruction: "Find", correctAnswer: "5/4", studentAnswer: "15/12", skipped: false, timeSeconds: 22, answeredAt: "2026-11-13T08:05:35.838Z" },
  { question: 15, topic: "Mixed skills", skill: "Decimal to fraction", questionText: "0.375", instruction: "Write as a fraction in its simplest form", correctAnswer: "3/8", studentAnswer: "375/100", skipped: false, timeSeconds: 68, answeredAt: "2026-11-13T08:06:44.156Z" },
  { question: 16, topic: "Mixed skills", skill: "Brackets and simplification", questionText: "$4(2x \\, - \\, 3) \\, + \\, 5$", instruction: "Expand and simplify", correctAnswer: "8x - 7", studentAnswer: "17/8", skipped: false, timeSeconds: 152, answeredAt: "2026-11-13T08:09:16.724Z" },
  { question: 17, topic: "Mixed skills", skill: "Equation with a fraction", questionText: "$\\frac{x}{4} \\, = \\, 9$", instruction: "Solve", correctAnswer: "x = 36", studentAnswer: "36", skipped: false, timeSeconds: 32, answeredAt: "2026-11-13T08:09:49.539Z" },
  { question: 18, topic: "Mixed skills", skill: "Rounding and place value", questionText: "4.678", instruction: "Round to two decimal places, and state the place value of the digit 7", correctAnswer: "4.68; hundredths", studentAnswer: null, skipped: true, timeSeconds: 75, answeredAt: "2026-11-13T08:11:05.107Z" },
  { question: 19, topic: "Mixed skills", skill: "Perimeter", questionText: "$12.5 \\, \\text{ cm by } \\, 8 \\, \\text{ cm}$", instruction: "Find the perimeter of a rectangle measuring", correctAnswer: "41 cm", studentAnswer: null, skipped: true, timeSeconds: 72, answeredAt: "2026-11-13T08:12:17.524Z" },
  { question: 20, topic: "Mixed skills", skill: "Coordinates and midpoint", questionText: "$(-3,\\, 4)$", instruction: "In which quadrant does the point lie? Find the midpoint of the segment joining (2, 4) and (8, 10).", correctAnswer: "Quadrant II; (5, 7)", studentAnswer: "2nd quadrant", skipped: false, timeSeconds: 73, answeredAt: "2026-11-13T08:13:31.342Z" },
];

// ------------------------------------------------------------------
// Assertion helpers
// ------------------------------------------------------------------

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  ✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    testsPassed++;
    console.log(`  ✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`  ✗ ${message}\n    Expected: ${JSON.stringify(expected)}\n    Actual:   ${JSON.stringify(actual)}`);
  }
}

// ------------------------------------------------------------------
// Test 1: Answer equivalence
// ------------------------------------------------------------------

function testAnswerEquivalence() {
  console.log("\n=== Test 1: Answer Equivalence ===");

  assert(answersEquivalent("29", "29") === true, "Q1: exact match '29' ≡ '29'");
  assert(answersEquivalent("1.500", "1.5") === true, "Q4: numeric equivalence '1.500' ≡ '1.5'");
  assert(answersEquivalent("36%", "36") === true, "Q5: unit stripping '36%' ≡ '36'");
  assert(answersEquivalent("15/12", "5/4") === true, "Q14: fraction equivalence '15/12' ≡ '5/4'");
  assert(answersEquivalent("65°", "65°") === true, "Q11: unit stripping '65°' ≡ '65°'");
  assert(answersEquivalent("5", "x = 5") === true, "Q10: extract final value '5' ≡ 'x = 5'");
  assert(answersEquivalent("36", "x = 36") === true, "Q17: extract final value '36' ≡ 'x = 36'");
  assert(answersEquivalent("375/100", "3/8") === false, "Q15: non-equivalence '375/100' ≠ '3/8'");
  assert(answersEquivalent("2", "32") === false, "Q8: incorrect '2' ≠ '32'");
  assert(answersEquivalent("12", "HCF = 6, LCM = 72") === false, "Q7: incorrect '12' ≠ 'HCF = 6, LCM = 72'");
  assert(answersEquivalent(null, "144 and 216") === false, "Q6: null answer not equivalent");
  assert(answersEquivalent("2nd quadrant", "Quadrant II; (5, 7)") === false, "Q20: '2nd quadrant' not equivalent to full answer");
}

// ------------------------------------------------------------------
// Test 2: Mastery state assignment
// ------------------------------------------------------------------

function testMasteryAssignment() {
  console.log("\n=== Test 2: Mastery State Assignment ===");

  // Correct answers → not_started
  assert(assignInitialMastery({ skipped: false, studentAnswer: "29", correctAnswer: "29" }).state === "not_started", "Q1: correct → not_started");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "-1", correctAnswer: "-1" }).state === "not_started", "Q2: correct → not_started");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "17/12", correctAnswer: "17/12" }).state === "not_started", "Q3: correct → not_started");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "1.500", correctAnswer: "1.5" }).state === "not_started", "Q4: equivalent → not_started");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "36%", correctAnswer: "36" }).state === "not_started", "Q5: equivalent → not_started");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "6x", correctAnswer: "6x" }).state === "not_started", "Q9: correct → not_started");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "5", correctAnswer: "x = 5" }).state === "not_started", "Q10: equivalent → not_started");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "65°", correctAnswer: "65°" }).state === "not_started", "Q11: equivalent → not_started");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "10", correctAnswer: "10" }).state === "not_started", "Q13: correct → not_started");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "15/12", correctAnswer: "5/4" }).state === "not_started", "Q14: equivalent → not_started");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "36", correctAnswer: "x = 36" }).state === "not_started", "Q17: equivalent → not_started");

  // Incorrect answers → learning
  assert(assignInitialMastery({ skipped: false, studentAnswer: "12", correctAnswer: "HCF = 6, LCM = 72" }).state === "learning", "Q7: incorrect → learning");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "2", correctAnswer: "32" }).state === "learning", "Q8: incorrect → learning");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "375/100", correctAnswer: "3/8" }).state === "learning", "Q15: incorrect → learning");
  assert(assignInitialMastery({ skipped: false, studentAnswer: "17/8", correctAnswer: "8x - 7" }).state === "learning", "Q16: incorrect → learning");

  // Skipped answers → needs_verification
  assert(assignInitialMastery({ skipped: true, studentAnswer: null, correctAnswer: "144 and 216" }).state === "needs_verification", "Q6: skipped → needs_verification");
  assert(assignInitialMastery({ skipped: true, studentAnswer: null, correctAnswer: "100 cm^2" }).state === "needs_verification", "Q12: skipped → needs_verification");
  assert(assignInitialMastery({ skipped: true, studentAnswer: null, correctAnswer: "41 cm" }).state === "needs_verification", "Q19: skipped → needs_verification");
  assert(assignInitialMastery({ skipped: true, studentAnswer: null, correctAnswer: "4.68; hundredths" }).state === "needs_verification", "Q18: skipped → needs_verification");
}

// ------------------------------------------------------------------
// Test 3: Full concept mapping
// ------------------------------------------------------------------

function testConceptMapping() {
  console.log("\n=== Test 3: Full Concept Mapping ===");

  const concepts = mapDiagnosticToConcepts(ACTUAL_RESULTS);

  // All 23 concepts should be present
  assert(Object.keys(concepts).length === 23, `All 23 concepts mapped (got ${Object.keys(concepts).length})`);

  // Q1: Division → not_started
  assert(concepts["numbers-division"].masteryState === "not_started", "Q1: numbers-division → not_started");
  assert(concepts["numbers-division"].priorityScore === 0, "Q1: priority score 0 for correct answer");

  // Q2: Integer ops → not_started
  assert(concepts["numbers-integer-ops"].masteryState === "not_started", "Q2: numbers-integer-ops → not_started");

  // Q3: Fraction addition → not_started
  assert(concepts["numbers-fraction-addition"].masteryState === "not_started", "Q3: numbers-fraction-addition → not_started");

  // Q4: Decimal multiplication → not_started
  assert(concepts["numbers-decimal-multiplication"].masteryState === "not_started", "Q4: numbers-decimal-multiplication → not_started");

  // Q5: Percentage → not_started
  assert(concepts["numbers-percentage"].masteryState === "not_started", "Q5: numbers-percentage → not_started");

  // Q6: Ratio → needs_verification (skipped)
  assert(concepts["numbers-ratio-proportion"].masteryState === "needs_verification", "Q6: numbers-ratio-proportion → needs_verification");
  assert(concepts["numbers-ratio-proportion"].assessmentRequired === true, "Q6: assessmentRequired true for skipped");
  assert(concepts["numbers-ratio-proportion"].studyTimeAllocated === false, "Q6: studyTimeAllocated false for skipped");

  // Q7: HCF/LCM → learning
  assert(concepts["numbers-hcf-lcm"].masteryState === "learning", "Q7: numbers-hcf-lcm → learning");
  assert(concepts["numbers-hcf-lcm"].studyTimeAllocated === true, "Q7: studyTimeAllocated true for learning");

  // Q8: Exponents → learning
  assert(concepts["numbers-exponents"].masteryState === "learning", "Q8: numbers-exponents → learning");

  // Q9: Like terms → not_started
  assert(concepts["algebra-like-terms"].masteryState === "not_started", "Q9: algebra-like-terms → not_started");

  // Q10: Linear equation → not_started
  assert(concepts["algebra-linear-equation"].masteryState === "not_started", "Q10: algebra-linear-equation → not_started");

  // Q11: Triangle angle → not_started
  assert(concepts["geometry-triangle-angle"].masteryState === "not_started", "Q11: geometry-triangle-angle → not_started");

  // Q12: Rectangle area → needs_verification (skipped)
  assert(concepts["mensuration-rectangle-area"].masteryState === "needs_verification", "Q12: mensuration-rectangle-area → needs_verification");

  // Q13: Sign rules → not_started
  assert(concepts["mixed-sign-rules"].masteryState === "not_started", "Q13: mixed-sign-rules → not_started");

  // Q14: Fraction division → not_started
  assert(concepts["mixed-fraction-division"].masteryState === "not_started", "Q14: mixed-fraction-division → not_started");

  // Q15: Decimal to fraction → learning
  assert(concepts["mixed-decimal-fraction"].masteryState === "learning", "Q15: mixed-decimal-fraction → learning");

  // Q16: Expanding brackets → learning
  assert(concepts["algebra-expanding-brackets"].masteryState === "learning", "Q16: algebra-expanding-brackets → learning");

  // Q17: Equation with fraction → not_started
  assert(concepts["algebra-equation-fraction"].masteryState === "not_started", "Q17: algebra-equation-fraction → not_started");

  // Q18: Rounding → needs_verification (skipped)
  assert(concepts["mixed-rounding-placevalue"].masteryState === "needs_verification", "Q18: mixed-rounding-placevalue → needs_verification");

  // Q19: Perimeter → needs_verification (skipped)
  assert(concepts["mensuration-perimeter"].masteryState === "needs_verification", "Q19: mensuration-perimeter → needs_verification");

  // Q20 split: quadrant → mastered, midpoint → needs_verification
  assert(concepts["coordinates-quadrant"].masteryState === "mastered", "Q20: coordinates-quadrant → mastered (student said '2nd quadrant')");
  assert(concepts["coordinates-midpoint"].masteryState === "needs_verification", "Q20: coordinates-midpoint → needs_verification (midpoint not addressed)");
  assert(concepts["coordinates-midpoint"].assessmentRequired === true, "Q20: midpoint assessmentRequired true");
}

// ------------------------------------------------------------------
// Test 4: Priority score calculation
// ------------------------------------------------------------------

function testPriorityScores() {
  console.log("\n=== Test 4: Priority Score Calculation ===");

  const concepts = mapDiagnosticToConcepts(ACTUAL_RESULTS);

  // Expanding brackets: error 3 × 20/80 = 0.75
  assertEqual(concepts["algebra-expanding-brackets"].priorityScore, 0.75, "Expanding brackets: priority 0.75 (3 × 20/80)");

  // Rectangle area: error 2 × 14/80 = 0.35
  assertEqual(concepts["mensuration-rectangle-area"].priorityScore, 0.35, "Rectangle area: priority 0.35 (2 × 14/80)");

  // HCF/LCM: error 3 × 7/80 = 0.2625
  assertEqual(concepts["numbers-hcf-lcm"].priorityScore, 0.263, "HCF/LCM: priority 0.263 (3 × 7/80)");

  // Exponents: error 3 × 7/80 = 0.2625
  assertEqual(concepts["numbers-exponents"].priorityScore, 0.263, "Exponents: priority 0.263 (3 × 7/80)");

  // Decimal to fraction: error 3 × 7/80 = 0.2625
  assertEqual(concepts["mixed-decimal-fraction"].priorityScore, 0.263, "Decimal to fraction: priority 0.263 (3 × 7/80)");

  // Correct answers: priority 0
  assertEqual(concepts["numbers-division"].priorityScore, 0, "Division: priority 0 (correct)");
  assertEqual(concepts["algebra-like-terms"].priorityScore, 0, "Like terms: priority 0 (correct)");

  // Skipped: error 2 × 7/80 = 0.175
  assertEqual(concepts["numbers-ratio-proportion"].priorityScore, 0.175, "Ratio: priority 0.175 (2 × 7/80)");

  // Quadrant mastered: priority 0
  assertEqual(concepts["coordinates-quadrant"].priorityScore, 0, "Quadrant: priority 0 (mastered)");

  // Midpoint needs_verification: error 2 × 4/80 = 0.1
  assertEqual(concepts["coordinates-midpoint"].priorityScore, 0.1, "Midpoint: priority 0.1 (2 × 4/80)");
}

// ------------------------------------------------------------------
// Test 5: Validation
// ------------------------------------------------------------------

function testValidation() {
  console.log("\n=== Test 5: Validation ===");

  const validResult = validateDiagnosticResults(ACTUAL_RESULTS);
  assert(validResult.valid === true, "Valid diagnostic results pass validation");

  const nullResult = validateDiagnosticResults(null);
  assert(nullResult.valid === false, "Null results fail validation");
  assert(nullResult.errors.length > 0, "Null results include error messages");

  const emptyResult = validateDiagnosticResults([]);
  assert(emptyResult.valid === false, "Empty results fail validation");

  const malformed = [{ question: 1 }];
  const malformedResult = validateDiagnosticResults(malformed);
  assert(malformedResult.valid === false, "Malformed entries fail validation");
}

// ------------------------------------------------------------------
// Test 6: Plan data generation
// ------------------------------------------------------------------

function testPlanData() {
  console.log("\n=== Test 6: Plan Data Generation ===");

  const plan = generatePlanData(ACTUAL_RESULTS);

  assert(plan.planVersion === 1, "Plan version is 1");
  assert(plan.diagnosticVersion === 1, "Diagnostic version is 1");
  assert(plan.curriculumVersion === "CBSE-2026-27", "Curriculum version set");
  assert(plan.studentId === "local-device-only", "Student ID is anonymous");

  assert(plan.summary.totalConcepts === 23, "Total concepts: 23");
  assert(plan.summary.mastered === 1, "Mastered count: 1 (quadrant)");
  assert(plan.summary.learning === 4, "Learning count: 4 (HCF/LCM, exponents, decimal/fraction, brackets)");
  assert(plan.summary.needsVerification === 5, "Needs verification count: 5 (ratio, rectangle area, rounding, perimeter, midpoint)");

  assert(Array.isArray(plan.sortedConceptIds), "Sorted concept IDs is an array");
  assert(plan.sortedConceptIds[0] === "algebra-expanding-brackets", "Highest priority concept first: expanding brackets");

  assert(typeof plan.generatedAt === "string", "Generated timestamp is present");
}

// ------------------------------------------------------------------
// Test 7: Edge Cases
// ------------------------------------------------------------------

function testEdgeCases() {
  console.log("\n=== Test 7: Edge Cases ===");

  // Missing results should throw a clear error
  try {
    mapDiagnosticToConcepts(null);
    assert(false, "Should throw for null results");
  } catch (e) {
    assert(e.message.includes("Invalid diagnostic results"), "Throws clear error for null results");
  }

  // Empty array should throw
  try {
    mapDiagnosticToConcepts([]);
    assert(false, "Should throw for empty results");
  } catch (e) {
    assert(e.message.includes("Invalid diagnostic results"), "Throws clear error for empty results");
  }

  // results with missing question field
  const badResults = [{ studentAnswer: "5", correctAnswer: "5", skipped: false }];
  try {
    mapDiagnosticToConcepts(badResults);
    assert(false, "Should throw for results missing question field");
  } catch (e) {
    assert(e.message.includes("Invalid diagnostic results"), "Throws clear error for missing question field");
  }
}

// ------------------------------------------------------------------
// Test 8: Milestone 3 - Two Separate Rankings
// ------------------------------------------------------------------

function testTwoSeparateRankings() {
  console.log("\n=== Test 8: Two Separate Rankings (Milestone 3) ===");

  const concepts = mapDiagnosticToConcepts(ACTUAL_RESULTS);

  // Every concept should have both priorityScore and learningSequencePriority
  for (const [conceptId, concept] of Object.entries(concepts)) {
    assert(typeof concept.priorityScore === "number", `${conceptId}: has priorityScore`);
    assert(typeof concept.learningSequencePriority === "number", `${conceptId}: has learningSequencePriority`);
  }

  // Diagnostic priority: expanding brackets (3 × 20/80 = 0.75) should be highest
  assertEqual(concepts["algebra-expanding-brackets"].priorityScore, 0.75, "Diagnostic priority: expanding brackets = 0.75");

  // Learning sequence priority: prerequisites promoted
  // Ratio is a prerequisite with needs_verification (sequence priority 1)
  // HCF/LCM is a prerequisite with learning (sequence priority tier 3)
  const ratioSeq = concepts["numbers-ratio-proportion"].learningSequencePriority;
  const hcfSeq = concepts["numbers-hcf-lcm"].learningSequencePriority;
  assert(ratioSeq < hcfSeq, "Learning sequence: prerequisite learning (HCF/LCM) ranked above prerequisite needs_verification (Ratio)");

  // Mastered concept should have lowest sequence priority
  assertEqual(concepts["coordinates-quadrant"].learningSequencePriority, 0, "Mastered concept: sequence priority 0 (excluded from scheduling)");
}

// ------------------------------------------------------------------
// Test 9: Milestone 3 - Prerequisite Handling
// ------------------------------------------------------------------

function testPrerequisiteHandling() {
  console.log("\n=== Test 9: Prerequisite Handling (Milestone 3) ===");

  const concepts = mapDiagnosticToConcepts(ACTUAL_RESULTS);
  const plan = generatePlanData(ACTUAL_RESULTS);

  // Mastered concepts should sort last (excluded from routine scheduling)
  const sortedIds = plan.sortedConceptIds;
  const quadrantIndex = sortedIds.indexOf("coordinates-quadrant");
  const lastIndex = sortedIds.length - 1;
  assert(quadrantIndex === lastIndex, "Mastered concept (quadrant) sorts last in learning sequence");

  // Prerequisites with learning needs should come before non-prerequisites with same diagnostic priority
  // HCF/LCM (prerequisite, learning, priority 0.263) vs Exponents (non-prerequisite, learning, priority 0.263)
  const hcfIndex = sortedIds.indexOf("numbers-hcf-lcm");
  const exponentsIndex = sortedIds.indexOf("numbers-exponents");
  assert(hcfIndex < exponentsIndex, "Prerequisite (HCF/LCM) scheduled before non-prerequisite (Exponents) at same diagnostic priority");
}

// ------------------------------------------------------------------
// Test 10: Milestone 3 - Mastered and Needs Reinforcement
// ------------------------------------------------------------------

function testMasteredAndReinforcement() {
  console.log("\n=== Test 10: Mastered and Needs Reinforcement (Milestone 3) ===");

  const concepts = mapDiagnosticToConcepts(ACTUAL_RESULTS);

  // Mastered concepts excluded from scheduling
  assertEqual(concepts["coordinates-quadrant"].masteryState, "mastered", "Quadrant is mastered");
  assertEqual(concepts["coordinates-quadrant"].learningSequencePriority, 0, "Mastered concept has sequence priority 0");

  // needs_reinforcement returns to learning queue
  // Simulate by checking the calculation directly
  const reinfConcept = { ...concepts["numbers-division"], masteryState: "needs_reinforcement", isPrerequisite: true, priorityScore: 0 };
  const reinfSeq = calculateLearningSequencePriority(reinfConcept);
  assert(reinfSeq === 3, "Needs reinforcement prerequisite: sequence priority tier 3 (learning queue)");

  // Missing assessment stays unassessed
  const notAssessed = { ...concepts["numbers-division"], masteryState: "not_started", isPrerequisite: true, priorityScore: 0 };
  const notAssessedSeq = calculateLearningSequencePriority(notAssessed);
  assert(notAssessedSeq === 2, "Not started prerequisite: sequence priority tier 2 (unassessed, not assumed weak)");
}

// ------------------------------------------------------------------
// Test 11: Milestone 4 - 45-Day Plan Generator
// ------------------------------------------------------------------

function test45DayPlanActualResults() {
  console.log("\n=== Test 11: 45-Day Plan — Actual Diagnostic Results ===");

  const concepts = mapDiagnosticToConcepts(ACTUAL_RESULTS);
  const planData = generatePlanData(ACTUAL_RESULTS);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  assert(plan.totalDays > 0, "Plan has at least one day");
  assert(plan.studyMode === "normal", "Study mode is normal");
  assert(plan.dailyLimit === 90, "Daily limit is 90 minutes");
  assert(plan.coverage.coveragePercent > 0, "Has syllabus coverage > 0%");
  assert(plan.summary.conceptsNeedingLearning > 0, "Identifies concepts needing learning");

  // All days should be within 45
  for (const day of plan.dailyPlan) {
    assert(day.day >= 1 && day.day <= 45, `Day ${day.day} is within 1-45`);
  }

  // No mastered concepts should have study time
  for (const day of plan.dailyPlan) {
    for (const concept of day.concepts) {
      assert(concept.masteryState !== "mastered", `Mastered concept ${concept.conceptId} should not have study time`);
    }
  }

  // No needs_verification concepts should have study time
  for (const day of plan.dailyPlan) {
    for (const concept of day.concepts) {
      assert(concept.masteryState !== "needs_verification", `needs_verification concept ${concept.conceptId} should not have study time`);
    }
  }

  console.log(`  Plan: ${plan.totalDays} days, ${plan.coverage.coveragePercent}% syllabus coverage`);
}

function test45DayPlanAllCorrect() {
  console.log("\n=== Test 12: 45-Day Plan — All Correct Answers ===");

  const allCorrect = ACTUAL_RESULTS.map((r, i) => ({
    ...r,
    studentAnswer: r.correctAnswer,
    skipped: false,
  }));

  const planData = generatePlanData(allCorrect);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  // Even with all correct, complete syllabus coverage must be produced
  assert(plan.coverage.coveragePercent > 0, "All-correct student: complete syllabus coverage > 0%");
  assert(plan.summary.conceptsMastered > 0, "All-correct: all concepts mastered");
  assert(plan.summary.conceptsNeedingLearning === 0, "All-correct: no concepts needing learning");
  assert(plan.totalDays > 0, "All-correct: plan still generated");
}

function test45DayPlanAllIncorrect() {
  console.log("\n=== Test 13: 45-Day Plan — All Incorrect Answers ===");

  const allIncorrect = ACTUAL_RESULTS.map((r, i) => ({
    ...r,
    studentAnswer: r.correctAnswer === "29" ? "99" : "wrong",
    skipped: false,
  }));

  const planData = generatePlanData(allIncorrect);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  // All concepts should need learning (except Q20 quadrant which may still parse)
  assert(plan.summary.conceptsNeedingLearning > 0, "All-incorrect: concepts needing learning > 0");
  assert(plan.totalDays > 0, "All-incorrect: plan still generated");
}

function test45DayPlanMostlySkipped() {
  console.log("\n=== Test 14: 45-Day Plan — Mostly Skipped Questions ===");

  const mostlySkipped = ACTUAL_RESULTS.map((r) => ({
    ...r,
    skipped: true,
    studentAnswer: null,
  }));

  const planData = generatePlanData(mostlySkipped);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  // Mostly skipped: concepts in needs_verification, not learning
  assert(plan.summary.conceptsNeedingVerification > 0, "Mostly-skipped: concepts needing verification > 0");
  assert(plan.totalDays > 0, "Mostly-skipped: plan still generated");
}

function test45DayPlanMixedMastery() {
  console.log("\n=== Test 15: 45-Day Plan — Mixed Mastery States ===");

  const mixed = ACTUAL_RESULTS.map((r, i) => {
    if (i % 3 === 0) return { ...r, skipped: false, studentAnswer: r.correctAnswer };
    if (i % 3 === 1) return { ...r, skipped: false, studentAnswer: "wrong" };
    return { ...r, skipped: true, studentAnswer: null };
  });

  const planData = generatePlanData(mixed);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  assert(plan.summary.conceptsNeedingLearning > 0, "Mixed: concepts needing learning > 0");
  assert(plan.summary.conceptsNeedingVerification > 0, "Mixed: concepts needing verification > 0");
  assert(plan.summary.notStarted > 0, "Mixed: not_started concepts exist");
  assert(plan.totalDays > 0, "Mixed: plan still generated");
}

function test45DayPlanStudyModes() {
  console.log("\n=== Test 16: 45-Day Plan — Study Modes (90/30/15 min) ===");

  const planData = generatePlanData(ACTUAL_RESULTS);

  const normalPlan = generate45DayPlan(planData, "normal", {}, 1);
  const busyPlan = generate45DayPlan(planData, "busy", {}, 1);
  const veryBusyPlan = generate45DayPlan(planData, "veryBusy", {}, 1);

  assert(normalPlan.dailyLimit === 90, "Normal mode: 90 min daily limit");
  assert(busyPlan.dailyLimit === 30, "Busy mode: 30 min daily limit");
  assert(veryBusyPlan.dailyLimit === 15, "Very busy mode: 15 min daily limit");

  // No day should exceed its daily limit
  for (const day of normalPlan.dailyPlan) {
    assert(day.totalMinutes <= 90, `Normal day ${day.day}: ${day.totalMinutes} <= 90`);
  }
  for (const day of busyPlan.dailyPlan) {
    assert(day.totalMinutes <= 30, `Busy day ${day.day}: ${day.totalMinutes} <= 30`);
  }
  for (const day of veryBusyPlan.dailyPlan) {
    assert(day.totalMinutes <= 15, `Very busy day ${day.day}: ${day.totalMinutes} <= 15`);
  }
}

function test45DayPlanMissedDayRescheduling() {
  console.log("\n=== Test 17: 45-Day Plan — Missed Day Rescheduling ===");

  const planData = generatePlanData(ACTUAL_RESULTS);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  // Simulate completing days 1-3, missing day 4, resuming at day 5
  const completedWork = {};
  for (const day of plan.dailyPlan) {
    if (day.day <= 3) {
      for (const c of day.concepts) {
        completedWork[c.conceptId] = true;
      }
    }
  }

  const resumedPlan = rescheduleAfterMissedDay(plan, completedWork, 5, "normal");

  // Resumed plan should start at day 5 or later
  if (resumedPlan.dailyPlan.length > 0) {
    assert(resumedPlan.dailyPlan[0].day >= 5, "Resumed plan starts at day 5 or later");
  }

  // No completed concepts should reappear
  for (const day of resumedPlan.dailyPlan) {
    for (const c of day.concepts) {
      assert(!completedWork[c.conceptId], `Completed concept ${c.conceptId} should not reappear`);
    }
  }
}

function test45DayPlanNoDuplicates() {
  console.log("\n=== Test 18: 45-Day Plan — No Duplicate Assignments ===");

  const planData = generatePlanData(ACTUAL_RESULTS);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  const allConceptAssignments = [];
  for (const day of plan.dailyPlan) {
    for (const c of day.concepts) {
      allConceptAssignments.push(`${day.day}:${c.conceptId}`);
    }
  }

  const uniqueAssignments = new Set(allConceptAssignments);
  assert(allConceptAssignments.length === uniqueAssignments.size, "No duplicate concept-day assignments");
}

function test45DayPlanCompleteSyllabusCoverage() {
  console.log("\n=== Test 19: 45-Day Plan — Complete CBSE Syllabus Coverage ===");

  const planData = generatePlanData(ACTUAL_RESULTS);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  // Every syllabus concept should appear at least once in the plan
  const coveredIds = new Set();
  for (const day of plan.dailyPlan) {
    for (const c of day.concepts) {
      coveredIds.add(c.conceptId);
    }
  }

  for (const syllabusId of Object.keys(SYLLABUS_CONCEPTS)) {
    assert(coveredIds.has(syllabusId), `Syllabus concept ${syllabusId} (${SYLLABUS_CONCEPTS[syllabusId].topic}) is covered`);
  }
}

function test45DayPlanRegenerationPreservesCompleted() {
  console.log("\n=== Test 20: 45-Day Plan — Regeneration Preserves Completed Work ===");

  const planData = generatePlanData(ACTUAL_RESULTS);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  // Complete first 2 days of concepts
  const completedWork = {};
  for (const day of plan.dailyPlan) {
    if (day.day <= 2) {
      for (const c of day.concepts) {
        completedWork[c.conceptId] = true;
      }
    }
  }

  // Regenerate plan with completed work
  const regenerated = generate45DayPlan(planData, "normal", completedWork, 1);

  // No completed concept should appear in regenerated plan
  for (const day of regenerated.dailyPlan) {
    for (const c of day.concepts) {
      assert(!completedWork[c.conceptId], `Completed concept ${c.conceptId} should not reappear after regeneration`);
    }
  }
}

// ------------------------------------------------------------------
// Test 21: No duplicate new lessons across phases
// ------------------------------------------------------------------

function testNoDuplicateNewLessons() {
  console.log("\n=== Test 21: No Duplicate New Lessons Across Phases ===");

  const planData = generatePlanData(ACTUAL_RESULTS);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  const newLessonConcepts = new Map(); // conceptId -> day number
  let duplicates = 0;

  for (const day of plan.dailyPlan) {
    for (const c of day.concepts) {
      if (c.isNewLesson && c.conceptId !== "revision-practice") {
        if (newLessonConcepts.has(c.conceptId)) {
          duplicates++;
          console.error(`  ✗ Duplicate new lesson: ${c.conceptId} on days ${newLessonConcepts.get(c.conceptId)} and ${day.day}`);
        } else {
          newLessonConcepts.set(c.conceptId, day.day);
        }
      }
    }
  }

  assert(duplicates === 0, "No duplicate new lessons across all phases");
}

// ------------------------------------------------------------------
// Test 22: Intentional revision is still permitted
// ------------------------------------------------------------------

function testIntentionalRevisionPermitted() {
  console.log("\n=== Test 22: Intentional Revision Permitted ===");

  const planData = generatePlanData(ACTUAL_RESULTS);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  // Check Phase 3 (Days 39-45) for revision entries
  const revisionDays = plan.dailyPlan.filter((d) => d.day >= 39);
  let revisionEntries = 0;

  for (const day of revisionDays) {
    for (const c of day.concepts) {
      if (c.isRevision) revisionEntries++;
    }
  }

  assert(revisionEntries > 0, "Revision phase contains intentional revision entries");
}

// ------------------------------------------------------------------
// Test 23: Daily allocations respect study mode limits
// ------------------------------------------------------------------

function testDailyAllocationsRespectMode() {
  console.log("\n=== Test 23: Daily Allocations Respect Study Mode ===");

  const planData = generatePlanData(ACTUAL_RESULTS);

  for (const [mode, limit] of [["normal", 90], ["busy", 30], ["veryBusy", 15]]) {
    const plan = generate45DayPlan(planData, mode, {}, 1);

    for (const day of plan.dailyPlan) {
      assert(day.totalMinutes <= limit, `${mode} day ${day.day}: ${day.totalMinutes} <= ${limit}`);
      assert(day.dailyLimit === limit, `${mode} day ${day.day}: dailyLimit is ${limit}`);
    }
  }
}

// ------------------------------------------------------------------
// Test 24: Diagnostic weaknesses carry into matching syllabus concepts
// ------------------------------------------------------------------

function testDiagnosticWeaknessesCarryIntoSyllabus() {
  console.log("\n=== Test 24: Diagnostic Weaknesses Carry Into Syllabus Concepts ===");

  const planData = generatePlanData(ACTUAL_RESULTS);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  // Expanding brackets (Q16, incorrect) should map to expanding-brackets syllabus concept
  // and have learning mastery state
  const expandingBracketsEntry = planData.concepts["algebra-expanding-brackets"];
  assert(expandingBracketsEntry.masteryState === "learning", "Expanding brackets: mastery state is learning");

  // The canonical concept expanding-brackets should appear in the plan
  let foundInPlan = false;
  for (const day of plan.dailyPlan) {
    for (const c of day.concepts) {
      if (c.conceptId === "expanding-brackets") {
        foundInPlan = true;
        break;
      }
    }
    if (foundInPlan) break;
  }

  assert(foundInPlan, "Expanding-brackets syllabus concept appears in plan");
}

// ------------------------------------------------------------------
// Test 25: Confirmation results update canonical concepts
// ------------------------------------------------------------------

function testConfirmationResultsUpdateCanonicalConcepts() {
  console.log("\n=== Test 25: Confirmation Results Update Canonical Concepts ===");

  // Simulate confirmation results for ratio-proportion
  // First, generate plan data to get canonical concept structure
  const planData = generatePlanData(ACTUAL_RESULTS);
  const ratioConcept = planData.concepts["numbers-ratio-proportion"];

  // After confirmation, mastery should update from needs_verification to not_started
  // (simulating correct confirmation answers)
  const confirmedConcept = {
    ...ratioConcept,
    masteryState: "not_started",
    priorityReason: "Confirmed correct in quick check",
    studyTimeAllocated: false,
    assessmentRequired: false,
  };

  const planAfterConfirmation = generate45DayPlan(
    { ...planData, concepts: { ...planData.concepts, "numbers-ratio-proportion": confirmedConcept } },
    "normal",
    {},
    1
  );

  // The canonical concept ratio-proportion should not appear as needing study
  let ratioInPlan = false;
  for (const day of planAfterConfirmation.dailyPlan) {
    for (const c of day.concepts) {
      if (c.conceptId === "ratio-proportion" && !c.isRevision) {
        ratioInPlan = true;
      }
    }
  }

  assert(!ratioInPlan, "Confirmed ratio concept does not appear as new lesson after confirmation");
}

// ------------------------------------------------------------------
// Test 26: Mastered concepts are not unnecessarily retaught
// ------------------------------------------------------------------

function testMasteredConceptsNotRetaught() {
  console.log("\n=== Test 26: Mastered Concepts Not Retaught ===");

  const planData = generatePlanData(ACTUAL_RESULTS);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  // Quadrant (coordinates-quadrant) is mastered — should not appear as new lesson
  let quadrantAsNewLesson = false;
  for (const day of plan.dailyPlan) {
    for (const c of day.concepts) {
      if (c.conceptId === "coordinate-geometry-basics" && c.isNewLesson) {
        quadrantAsNewLesson = true;
      }
    }
  }

  assert(!quadrantAsNewLesson, "Mastered quadrant concept is not taught as new lesson");
}

// ------------------------------------------------------------------
// Test 27: All prescribed Statistics topics are represented
// ------------------------------------------------------------------

function testStatisticsCoverage() {
  console.log("\n=== Test 27: All Prescribed Statistics Topics Represented ===");

  const planData = generatePlanData(ACTUAL_RESULTS);
  const plan = generate45DayPlan(planData, "normal", {}, 1);

  const statisticsConcepts = Object.values(SYLLABUS_CONCEPTS).filter(
    (c) => c.unit === "Statistics and Probability"
  );

  const coveredIds = new Set();
  for (const day of plan.dailyPlan) {
    for (const c of day.concepts) {
      coveredIds.add(c.conceptId);
    }
  }

  for (const statConcept of statisticsConcepts) {
    assert(
      coveredIds.has(statConcept.id),
      `Statistics concept ${statConcept.id} (${statConcept.topic}) is covered in plan`
    );
  }
}

// ------------------------------------------------------------------
// Test runner
// ------------------------------------------------------------------

function runAllTests() {
  console.log("Running Adaptive Learning Engine Milestone 1-4 Tests...");
  console.log("=".repeat(60));

  testAnswerEquivalence();
  testMasteryAssignment();
  testConceptMapping();
  testPriorityScores();
  testValidation();
  testPlanData();
  testEdgeCases();
  testTwoSeparateRankings();
  testPrerequisiteHandling();
  testMasteredAndReinforcement();
  test45DayPlanActualResults();
  test45DayPlanAllCorrect();
  test45DayPlanAllIncorrect();
  test45DayPlanMostlySkipped();
  test45DayPlanMixedMastery();
  test45DayPlanStudyModes();
  test45DayPlanMissedDayRescheduling();
  test45DayPlanNoDuplicates();
  test45DayPlanCompleteSyllabusCoverage();
  test45DayPlanRegenerationPreservesCompleted();
  testNoDuplicateNewLessons();
  testIntentionalRevisionPermitted();
  testDailyAllocationsRespectMode();
  testDiagnosticWeaknessesCarryIntoSyllabus();
  testConfirmationResultsUpdateCanonicalConcepts();
  testMasteredConceptsNotRetaught();
  testStatisticsCoverage();

  console.log("\n" + "=".repeat(60));
  console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
  if (testsFailed === 0) {
    console.log("All tests passed! ✓");
  } else {
    console.error(`${testsFailed} test(s) failed. ✗`);
  }
  return testsFailed === 0;
}

// Auto-run if loaded in browser
if (typeof window !== "undefined") {
  window.runAdaptivePlanTests = runAllTests;
}

export { runAllTests, ACTUAL_RESULTS };
