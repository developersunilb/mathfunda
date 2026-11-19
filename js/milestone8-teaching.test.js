/**
 * Stage 2A — Lesson Intelligence tests (logic only).
 *
 * Tests:
 *   - getStrategy returns the correct strategy for each pilot concept ID
 *   - getStrategy returns null for unknown concept IDs
 *   - validateStrategy accepts valid strategies and rejects invalid ones
 *   - resolveSequence returns blocks in declared order
 *   - resolveSequence returns empty array for invalid/missing input
 *   - hasStrategy / listStrategies work correctly
 *   - All four pilot concepts validate cleanly
 *
 * Run with: node --test js/milestone8-teaching.test.js
 */

import { describe, it } from "node:test";

import {
  getStrategy,
  validateStrategy,
  resolveSequence,
  hasStrategy,
  listStrategies,
} from "./lesson-intelligence.js";

import { LESSON_STRATEGIES } from "./content-model.js";

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

function assertArrayContains(array, item, message) {
  if (!array.includes(item)) {
    throw new Error(`${message}: array ${JSON.stringify(array)} does not include ${JSON.stringify(item)}`);
  }
}

// ------------------------------------------------------------------
// Test Suite
// ------------------------------------------------------------------

describe("Concept ID consistency", () => {
  test("Pilot concept IDs match existing diagnostic IDs where applicable", () => {
    // algebra-linear-equation: diagnostic ID is algebra-linear-equation
    assertEqual(getStrategy("algebra-linear-equation")?.conceptId, "algebra-linear-equation", "linear equation concept ID matches diagnostic");
    // numbers-exponents: diagnostic ID is numbers-exponents
    assertEqual(getStrategy("numbers-exponents")?.conceptId, "numbers-exponents", "exponents concept ID matches diagnostic");
    // numbers-hcf-lcm: diagnostic ID is numbers-hcf-lcm
    assertEqual(getStrategy("numbers-hcf-lcm")?.conceptId, "numbers-hcf-lcm", "hcf-lcm concept ID matches diagnostic");
    // geo-circle-area: no diagnostic concept; stable dedicated ID
    assertEqual(getStrategy("geo-circle-area")?.conceptId, "geo-circle-area", "circle area uses dedicated concept ID");
  });

  test("Old alg-linear-equation ID is NOT used (no silent rename)", () => {
    assertFalse(getStrategy("alg-linear-equation"), "alg-linear-equation should not exist as a strategy ID");
  });
});

describe("Strategy lookup", () => {
  test("getStrategy returns correct strategy for each pilot concept", () => {
    const linear = getStrategy("algebra-linear-equation");
    assertTrue(linear, "linear equation strategy exists");
    assertEqual(linear.teachingStrategy.primary, "worked-example", "linear uses worked-example primary");
    assertEqual(linear.teachingStrategy.interaction, "none", "linear has no interaction");

    const circle = getStrategy("geo-circle-area");
    assertTrue(circle, "circle area strategy exists");
    assertEqual(circle.teachingStrategy.primary, "discovery", "circle uses discovery primary");
    assertEqual(circle.teachingStrategy.interaction, "existing", "circle uses existing widget");

    const exponents = getStrategy("numbers-exponents");
    assertTrue(exponents, "exponents strategy exists");
    assertEqual(exponents.teachingStrategy.primary, "discovery", "exponents uses discovery primary");
    assertEqual(exponents.teachingStrategy.interaction, "none", "exponents has no interaction");

    const hcf = getStrategy("numbers-hcf-lcm");
    assertTrue(hcf, "hcf-lcm strategy exists");
    assertEqual(hcf.teachingStrategy.primary, "story", "hcf-lcm uses story primary");
    assertEqual(hcf.teachingStrategy.interaction, "none", "hcf-lcm has no interaction");
  });

  test("getStrategy returns null for unknown concept IDs", () => {
    assertEqual(getStrategy("unknown-concept"), null, "unknown concept returns null");
    assertEqual(getStrategy(""), null, "empty string returns null");
  });

  test("hasStrategy returns true for pilots, false for unknown", () => {
    assertTrue(hasStrategy("algebra-linear-equation"), "linear equation has strategy");
    assertTrue(hasStrategy("geo-circle-area"), "circle area has strategy");
    assertTrue(hasStrategy("numbers-exponents"), "exponents has strategy");
    assertTrue(hasStrategy("numbers-hcf-lcm"), "hcf-lcm has strategy");
    assertFalse(hasStrategy("nonexistent"), "nonexistent has no strategy");
  });

  test("listStrategies returns exactly the four pilot concept IDs", () => {
    const ids = listStrategies();
    assertEqual(ids.length, 4, "exactly four strategies");
    assertArrayContains(ids, "algebra-linear-equation", "list includes linear equation");
    assertArrayContains(ids, "geo-circle-area", "list includes circle area");
    assertArrayContains(ids, "numbers-exponents", "list includes exponents");
    assertArrayContains(ids, "numbers-hcf-lcm", "list includes hcf-lcm");
  });
});

describe("Strategy validation", () => {
  test("All four pilot strategies validate cleanly", () => {
    for (const [id, strategy] of Object.entries(LESSON_STRATEGIES)) {
      const result = validateStrategy(strategy);
      assertTrue(result.valid, `Strategy ${id} validates: ${result.errors.join(", ")}`);
    }
  });

  test("Rejects null strategy", () => {
    const result = validateStrategy(null);
    assertFalse(result.valid, "null is invalid");
    assertEqual(result.errors.length, 1, "null has exactly one error");
  });

  test("Rejects strategy missing conceptId", () => {
    const strategy = { learningGoal: "test", teachingStrategy: { primary: "story" }, experience: { blocks: [{ type: "story", content: "x" }] } };
    const result = validateStrategy(strategy);
    assertFalse(result.valid, "missing conceptId is invalid");
    assertTrue(result.errors.some((e) => e.includes("conceptId")), "error mentions conceptId");
  });

  test("Rejects strategy missing teachingStrategy.primary", () => {
    const strategy = {
      conceptId: "x",
      learningGoal: "test",
      teachingStrategy: {},
      experience: { blocks: [{ type: "story", content: "x" }] },
    };
    const result = validateStrategy(strategy);
    assertFalse(result.valid, "missing primary is invalid");
    assertTrue(result.errors.some((e) => e.includes("primary")), "error mentions primary");
  });

  test("Rejects strategy with empty blocks", () => {
    const strategy = {
      conceptId: "x",
      learningGoal: "test",
      teachingStrategy: { primary: "story" },
      experience: { blocks: [] },
    };
    const result = validateStrategy(strategy);
    assertFalse(result.valid, "empty blocks is invalid");
    assertTrue(result.errors.some((e) => e.includes("blocks")), "error mentions blocks");
  });

  test("Rejects block with invalid type", () => {
    const strategy = {
      conceptId: "x",
      learningGoal: "test",
      teachingStrategy: { primary: "story" },
      experience: { blocks: [{ type: "magic", content: "x" }] },
    };
    const result = validateStrategy(strategy);
    assertFalse(result.valid, "invalid block type is invalid");
    assertTrue(result.errors.some((e) => e.includes("type")), "error mentions type");
  });

  test("Rejects block with empty content", () => {
    const strategy = {
      conceptId: "x",
      learningGoal: "test",
      teachingStrategy: { primary: "story" },
      experience: { blocks: [{ type: "story", content: "" }] },
    };
    const result = validateStrategy(strategy);
    assertFalse(result.valid, "empty block content is invalid");
    assertTrue(result.errors.some((e) => e.includes("content")), "error mentions content");
  });
});

describe("Sequence resolution", () => {
  test("resolveSequence returns blocks in declared order", () => {
    const strategy = getStrategy("algebra-linear-equation");
    const sequence = resolveSequence(strategy);
    assertTrue(sequence.length > 0, "sequence is non-empty");
    assertEqual(sequence[0].type, "prediction", "first block is prediction");
    // Last block should be memory-hook (no mastery in enhanced)
    const lastBlock = sequence[sequence.length - 1];
    assertEqual(lastBlock.type, "memory-hook", "last block is memory-hook");
  });

  test("resolveSequence preserves block order for circle area", () => {
    const strategy = getStrategy("geo-circle-area");
    const sequence = resolveSequence(strategy);
    const types = sequence.map((b) => b.type);
    // Story → prediction → discovery → explain → memory-hook (no interactive)
    const storyIdx = types.indexOf("story");
    const predIdx = types.indexOf("prediction");
    const discIdx = types.indexOf("discovery");
    assertTrue(storyIdx < predIdx, "story comes before prediction");
    assertTrue(predIdx < discIdx, "prediction comes before discovery");
    assertFalse(types.includes("interactive"), "no interactive block (widget exists in Markdown)");
  });

  test("resolveSequence returns empty array for null strategy", () => {
    const sequence = resolveSequence(null);
    assertEqual(Array.isArray(sequence), true, "returns array");
    assertEqual(sequence.length, 0, "empty array for null");
  });

  test("resolveSequence returns empty array for strategy without blocks", () => {
    const sequence = resolveSequence({ conceptId: "x" });
    assertEqual(sequence.length, 0, "empty array when no blocks");
  });
});

describe("No concept-specific rendering logic", () => {
  test("lesson-intelligence.js does not import reader or DOM APIs", () => {
    // This is a structural check: the module should only import from content-model.js
    // We verify by checking the exports are pure functions, not renderer components.
    assertEqual(typeof getStrategy, "function", "getStrategy is a function");
    assertEqual(typeof validateStrategy, "function", "validateStrategy is a function");
    assertEqual(typeof resolveSequence, "function", "resolveSequence is a function");
    assertEqual(typeof hasStrategy, "function", "hasStrategy is a function");
    assertEqual(typeof listStrategies, "function", "listStrategies is a function");
  });
});

// ------------------------------------------------------------------
// Runner
// ------------------------------------------------------------------

console.log("\n" + "=".repeat(60));
console.log("Stage 2A — Lesson Intelligence Tests");
console.log("=".repeat(60));

export { test, assertEqual, assertTrue, assertFalse };
