/**
 * Stage 3C — Pilot Events Tests.
 *
 * Tests the minimal event emitter for the Stage 3 learning study:
 *   - Event emission and storage
 *   - Event retrieval
 *   - Event deduplication (no double-counting)
 *   - Event listener subscription/unsubscription
 *   - All 12 event types emit correctly
 *   - Clear functionality
 *
 * Run with: node --test js/pilot-events.test.js
 */

// Minimal DOM shim so pilot-events.js (which uses localStorage) can be tested
// in plain Node.js without jsdom.
if (typeof localStorage === "undefined") {
  const store = {};
  globalThis.localStorage = {
    getItem(key) {
      return store[key] ?? null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };
}

import { describe, it } from "node:test";

import {
  onPilotEvent,
  getPilotEvents,
  clearPilotEvents,
  emitLessonStarted,
  emitPracticeStarted,
  emitPracticeAnswered,
  emitMisconceptionInterventionShown,
  emitMisconceptionInterventionCompleted,
  emitPracticeCompleted,
  emitMasteryAssessed,
  emitMemoryJourneyStarted,
  emitMemoryRecallShown,
  emitMemoryRevealUsed,
  emitMemoryJourneyCompleted,
  emitMemoryJourneyExited,
} from "./pilot-events.js";

// ------------------------------------------------------------------
// Helpers
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

// ------------------------------------------------------------------
// Test Suite
// ------------------------------------------------------------------

describe("Event storage and retrieval", () => {
  test("clearPilotEvents clears all stored events", () => {
    clearPilotEvents();
    emitLessonStarted("test-concept");
    const before = getPilotEvents().length;
    assertTrue(before > 0, "event was stored");
    clearPilotEvents();
    assertEqual(getPilotEvents().length, 0, "events cleared");
  });

  test("Events persist with timestamp and type", () => {
    clearPilotEvents();
    const event = emitLessonStarted("test-concept");
    const events = getPilotEvents();
    assertEqual(events.length, 1, "one event stored");
    assertEqual(events[0].type, "lesson_started", "correct type");
    assertEqual(events[0].conceptId, "test-concept", "conceptId captured");
    assertTrue(typeof events[0].timestamp === "number", "timestamp is a number");
    assertTrue(typeof events[0].id === "string" && events[0].id.length > 0, "id is a string");
  });
});

describe("All 12 event types emit correctly", () => {
  test("lesson_started", () => {
    clearPilotEvents();
    const event = emitLessonStarted("alg-linear-equation");
    assertEqual(event.type, "lesson_started");
    assertEqual(event.conceptId, "alg-linear-equation");
  });

  test("practice_started", () => {
    clearPilotEvents();
    const event = emitPracticeStarted("alg-linear-equation", 5);
    assertEqual(event.type, "practice_started");
    assertEqual(event.conceptId, "alg-linear-equation");
    assertEqual(event.questionCount, 5);
  });

  test("practice_answered", () => {
    clearPilotEvents();
    const event = emitPracticeAnswered("q-eq-1", true, null, "alg-linear-equation");
    assertEqual(event.type, "practice_answered");
    assertEqual(event.questionId, "q-eq-1");
    assertTrue(event.isCorrect);
    assertEqual(event.conceptId, "alg-linear-equation");
  });

  test("practice_answered with error", () => {
    clearPilotEvents();
    const event = emitPracticeAnswered("q-eq-1", false, "conceptual", "alg-linear-equation");
    assertFalse(event.isCorrect);
    assertEqual(event.errorCategory, "conceptual");
  });

  test("misconception_intervention_shown", () => {
    clearPilotEvents();
    const event = emitMisconceptionInterventionShown(
      "numbers-exponents",
      "Multiplies exponents instead of adding them",
      2
    );
    assertEqual(event.type, "misconception_intervention_shown");
    assertEqual(event.conceptId, "numbers-exponents");
    assertEqual(event.originalQuestionIndex, 2);
  });

  test("misconception_intervention_completed", () => {
    clearPilotEvents();
    const event = emitMisconceptionInterventionCompleted("numbers-exponents", 2);
    assertEqual(event.type, "misconception_intervention_completed");
    assertEqual(event.correctiveQuestionsCount, 2);
  });

  test("practice_completed", () => {
    clearPilotEvents();
    const event = emitPracticeCompleted("alg-linear-equation", 0.8, 5, true, true);
    assertEqual(event.type, "practice_completed");
    assertEqual(event.accuracy, 0.8);
    assertEqual(event.totalQuestions, 5);
    assertTrue(event.masteryAssessed);
    assertTrue(event.masteryPassed);
  });

  test("practice_completed without mastery assessment", () => {
    clearPilotEvents();
    const event = emitPracticeCompleted("alg-linear-equation", 0.6, 5, true, false);
    assertEqual(event.masteryAssessed, true);
    assertEqual(event.masteryPassed, false);
  });

  test("practice_completed without mastery assessed", () => {
    clearPilotEvents();
    const event = emitPracticeCompleted("alg-linear-equation", 0.5, 5, false, null);
    assertEqual(event.masteryAssessed, false);
    assertEqual(event.masteryPassed, null);
  });

  test("mastery_assessed", () => {
    clearPilotEvents();
    const event = emitMasteryAssessed("numbers-exponents", true, 0.9, 0.8);
    assertEqual(event.type, "mastery_assessed");
    assertTrue(event.passed);
    assertEqual(event.accuracy, 0.9);
    assertEqual(event.threshold, 0.8);
  });

  test("memory_journey_started", () => {
    clearPilotEvents();
    const event = emitMemoryJourneyStarted("geo-circle-area", 6);
    assertEqual(event.type, "memory_journey_started");
    assertEqual(event.elementCount, 6);
  });

  test("memory_recall_shown", () => {
    clearPilotEvents();
    const event = emitMemoryRecallShown("numbers-exponents", 0, "question", true);
    assertEqual(event.type, "memory_recall_shown");
    assertEqual(event.elementIndex, 0);
    assertEqual(event.elementType, "question");
    assertTrue(event.hasRecallPrompt);
  });

  test("memory_recall_shown without prompt", () => {
    clearPilotEvents();
    const event = emitMemoryRecallShown("numbers-exponents", 1, "discovery", false);
    assertFalse(event.hasRecallPrompt);
  });

  test("memory_reveal_used", () => {
    clearPilotEvents();
    const event = emitMemoryRevealUsed("geo-circle-area", 3, "rule");
    assertEqual(event.type, "memory_reveal_used");
    assertEqual(event.elementIndex, 3);
    assertEqual(event.elementType, "rule");
  });

  test("memory_journey_completed", () => {
    clearPilotEvents();
    const event = emitMemoryJourneyCompleted("alg-linear-equation", 6, 4, 2);
    assertEqual(event.type, "memory_journey_completed");
    assertEqual(event.elementsViewed, 6);
    assertEqual(event.recallsShown, 4);
    assertEqual(event.revealsUsed, 2);
  });

  test("memory_journey_exited", () => {
    clearPilotEvents();
    const event = emitMemoryJourneyExited("numbers-hcf-lcm", 2, 3, 1, 0);
    assertEqual(event.type, "memory_journey_exited");
    assertEqual(event.elementIndex, 2);
    assertEqual(event.elementsViewed, 3);
    assertEqual(event.recallsShown, 1);
    assertEqual(event.revealsUsed, 0);
  });
});

describe("Event listener subscription", () => {
  test("Listener receives events", () => {
    clearPilotEvents();
    let received = null;
    const unsubscribe = onPilotEvent((event) => {
      received = event;
    });
    emitLessonStarted("test-concept");
    assertTrue(received !== null, "listener received event");
    assertEqual(received.type, "lesson_started");
    unsubscribe();
    emitLessonStarted("test-concept-2");
    assertEqual(received.type, "lesson_started", "listener unsubscribed, no new events");
    assertEqual(received.conceptId, "test-concept", "conceptId unchanged after unsubscribe");
  });

  test("Multiple listeners receive events", () => {
    clearPilotEvents();
    let count1 = 0;
    let count2 = 0;
    onPilotEvent(() => { count1 += 1; });
    onPilotEvent(() => { count2 += 1; });
    emitLessonStarted("test-concept");
    assertEqual(count1, 1, "first listener called");
    assertEqual(count2, 1, "second listener called");
  });
});

describe("Event deduplication", () => {
  test("Each emission creates a distinct event", () => {
    clearPilotEvents();
    emitLessonStarted("test-concept");
    emitLessonStarted("test-concept");
    emitLessonStarted("test-concept");
    assertEqual(getPilotEvents().length, 3, "three distinct events stored");
    const ids = getPilotEvents().map((e) => e.id);
    assertEqual(new Set(ids).size, 3, "all IDs are unique");
  });
});

// ------------------------------------------------------------------
// Runner
// ------------------------------------------------------------------

console.log("\n" + "=".repeat(60));
console.log("Stage 3C — Pilot Events Tests");
console.log("=".repeat(60));

export { test, assertEqual, assertTrue, assertFalse };
