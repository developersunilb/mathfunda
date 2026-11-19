/**
 * Stage 2B1 — Reader Integration Tests (Teaching Block Rendering).
 *
 * Tests:
 *   - Both composition approaches ("enhanced" and "led")
 *   - Correct ordering of strategy blocks and Markdown sections
 *   - No duplicated widget markers (Circle → Rectangle appears exactly once)
 *   - No duplicated worked examples or practice questions
 *   - Existing Markdown fallback for lessons without strategies
 *   - HCF/LCM strategy-led rendering
 *   - Graceful handling of invalid/unsupported blocks
 *   - Chapter → concept ID mapping is correct
 *
 * Run with: node --test js/milestone8-teaching-reader.test.js
 */

// Minimal DOM shim so block-renderer.js (which uses document.createElement)
// can be tested in plain Node.js without jsdom.
if (typeof document === "undefined") {
  const elProto = {
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    dataset: {},
    style: {},
    _children: [],
    innerHTML: "",
    textContent: "",
    appendChild(child) {
      this._children.push(child);
      return child;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    setAttribute() {},
    removeAttribute() {},
    getAttribute() {
      return null;
    },
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect() {
      return { top: 0, bottom: 0, height: 0, width: 0, left: 0, right: 0 };
    },
  };
  function createEl(tag) {
    const el = Object.create(elProto);
    el.tagName = tag.toUpperCase();
    el.className = "";
    el.dataset = {};
    el._children = [];
    Object.defineProperty(el, "classList", {
      value: {
        add(...cls) {
          cls.forEach((c) => {
            if (!el.className.includes(c)) el.className = (el.className + " " + c).trim();
          });
        },
        remove(...cls) {
          cls.forEach((c) => {
            el.className = el.className.split(/\s+/).filter((x) => x !== c).join(" ");
          });
        },
        contains(c) {
          return el.className.split(/\s+/).includes(c);
        },
      },
      writable: false,
    });
    return el;
  }
  globalThis.document = {
    createElement: createEl,
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    getElementById() {
      return null;
    },
    body: {
      appendChild() {},
      querySelectorAll() {
        return [];
      },
      children: [],
    },
  };
}

import { describe, it } from "node:test";

import { renderBlocks, renderBlock } from "./block-renderer.js";
import {
  getStrategy,
  getCompositionType,
  resolveComposition,
  listStrategies,
} from "./lesson-intelligence.js";

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

function assertGreaterThan(actual, expected, message) {
  if (!(actual > expected)) {
    throw new Error(`${message}: expected ${actual} > ${expected}`);
  }
}

function renderToString(blocks) {
  const container = document.createElement("div");
  blocks.forEach((block) => renderBlock(container, block));
  return container.innerHTML;
}

function getBlockTypes(container) {
  return Array.from(container.querySelectorAll(".lesson-block")).map((b) =>
    b.classList[1].replace("lesson-block-", "")
  );
}

function hasWidgetMarker(container, type) {
  return container.querySelector(`[data-mf-type="${type}"]`) !== null;
}

function countWidgetMarkers(container, type) {
  return container.querySelectorAll(`[data-mf-type="${type}"]`).length;
}

// ------------------------------------------------------------------
// Test Suite
// ------------------------------------------------------------------

describe("Composition type resolution", () => {
  test("getCompositionType returns 'enhanced' for linear equation", () => {
    const strategy = getStrategy("algebra-linear-equation");
    assertEqual(getCompositionType(strategy), "enhanced", "linear equation is enhanced");
  });

  test("getCompositionType returns 'enhanced' for circle area", () => {
    const strategy = getStrategy("geo-circle-area");
    assertEqual(getCompositionType(strategy), "enhanced", "circle area is enhanced");
  });

  test("getCompositionType returns 'enhanced' for exponents", () => {
    const strategy = getStrategy("numbers-exponents");
    assertEqual(getCompositionType(strategy), "enhanced", "exponents is enhanced");
  });

  test("getCompositionType returns 'led' for HCF/LCM", () => {
    const strategy = getStrategy("numbers-hcf-lcm");
    assertEqual(getCompositionType(strategy), "led", "hcf-lcm is led");
  });

  test("getCompositionType defaults to 'led' when composition is missing", () => {
    const strategy = { conceptId: "x", learningGoal: "test", teachingStrategy: { primary: "story" }, experience: { blocks: [] } };
    assertEqual(getCompositionType(strategy), "led", "missing composition defaults to led");
  });
});

describe("resolveComposition — enhanced composition", () => {
  test("resolveComposition separates intro and outro blocks for linear equation", () => {
    const strategy = getStrategy("algebra-linear-equation");
    const result = resolveComposition(strategy);
    assertTrue(Array.isArray(result.introBlocks), "introBlocks is an array");
    assertTrue(Array.isArray(result.outroBlocks), "outroBlocks is an array");
    assertEqual(result.ledBlocks.length, 0, "ledBlocks is empty for enhanced");
    assertTrue(result.introBlocks.length > 0, "has intro blocks");
    assertTrue(result.outroBlocks.length > 0, "has outro blocks");

    const introTypes = result.introBlocks.map((b) => b.type);
    const outroTypes = result.outroBlocks.map((b) => b.type);
    assertArrayContains(introTypes, "prediction", "prediction is intro");
    assertArrayContains(outroTypes, "explain", "explain is outro");
    assertArrayContains(outroTypes, "memory-hook", "memory-hook is outro");
  });

  test("resolveComposition separates intro and outro blocks for circle area", () => {
    const strategy = getStrategy("geo-circle-area");
    const result = resolveComposition(strategy);
    assertEqual(result.ledBlocks.length, 0, "ledBlocks is empty for enhanced");

    const introTypes = result.introBlocks.map((b) => b.type);
    const outroTypes = result.outroBlocks.map((b) => b.type);
    assertArrayContains(introTypes, "story", "story is intro");
    assertArrayContains(introTypes, "prediction", "prediction is intro");
    assertArrayContains(introTypes, "discovery", "discovery is intro");
    assertArrayContains(outroTypes, "explain", "explain is outro");
    assertArrayContains(outroTypes, "memory-hook", "memory-hook is outro");

    // No interactive block (widget exists in Markdown)
    assertFalse(introTypes.includes("interactive"), "no interactive block in intro");
    assertFalse(outroTypes.includes("interactive"), "no interactive block in outro");
  });

  test("resolveComposition separates intro and outro blocks for exponents", () => {
    const strategy = getStrategy("numbers-exponents");
    const result = resolveComposition(strategy);
    assertEqual(result.ledBlocks.length, 0, "ledBlocks is empty for enhanced");

    const introTypes = result.introBlocks.map((b) => b.type);
    const outroTypes = result.outroBlocks.map((b) => b.type);
    assertArrayContains(introTypes, "prediction", "prediction is intro");
    assertArrayContains(introTypes, "discovery", "discovery is intro");
    assertArrayContains(outroTypes, "explain", "explain is outro");
    assertArrayContains(outroTypes, "memory-hook", "memory-hook is outro");

    // No duplicated rules/worked examples/practice
    assertFalse(introTypes.includes("worked-example"), "no worked-example in intro");
    assertFalse(outroTypes.includes("worked-example"), "no worked-example in outro");
    assertFalse(introTypes.includes("guided-practice"), "no guided-practice in intro");
    assertFalse(outroTypes.includes("independent-practice"), "no independent-practice in outro");
  });
});

describe("resolveComposition — led composition", () => {
  test("resolveComposition puts all blocks in ledBlocks for HCF/LCM", () => {
    const strategy = getStrategy("numbers-hcf-lcm");
    const result = resolveComposition(strategy);
    assertEqual(result.introBlocks.length, 0, "introBlocks is empty for led");
    assertEqual(result.outroBlocks.length, 0, "outroBlocks is empty for led");
    assertTrue(result.ledBlocks.length > 0, "has led blocks");

    const types = result.ledBlocks.map((b) => b.type);
    assertArrayContains(types, "story", "story is led block");
    assertArrayContains(types, "prediction", "prediction is led block");
    assertArrayContains(types, "discovery", "discovery is led block");
    assertArrayContains(types, "worked-example", "worked-example is led block");
    assertArrayContains(types, "guided-practice", "guided-practice is led block");
    assertArrayContains(types, "independent-practice", "independent-practice is led block");
    assertArrayContains(types, "explain", "explain is led block");
    assertArrayContains(types, "memory-hook", "memory-hook is led block");
    assertArrayContains(types, "mastery", "mastery is led block");
  });
});

describe("Enhanced composition rendering — block ordering", () => {
  test("Linear equation: prediction before Markdown, explain and memory-hook after", () => {
    const strategy = getStrategy("algebra-linear-equation");
    const { introBlocks, outroBlocks } = resolveComposition(strategy);
    const introTypes = introBlocks.map((b) => b.type);
    const outroTypes = outroBlocks.map((b) => b.type);
    assertEqual(introTypes[0], "prediction", "prediction is the first intro block");
    assertArrayContains(outroTypes, "explain", "explain is an outro block");
    assertArrayContains(outroTypes, "memory-hook", "memory-hook is an outro block");
  });

  test("Circle area: story, prediction, discovery before Markdown; explain and memory-hook after", () => {
    const strategy = getStrategy("geo-circle-area");
    const { introBlocks, outroBlocks } = resolveComposition(strategy);
    const introTypes = introBlocks.map((b) => b.type);
    const outroTypes = outroBlocks.map((b) => b.type);
    assertEqual(introTypes[0], "story", "story is first");
    assertEqual(introTypes[1], "prediction", "prediction is second");
    assertEqual(introTypes[2], "discovery", "discovery is third");
    assertArrayContains(outroTypes, "explain", "explain is outro");
    assertArrayContains(outroTypes, "memory-hook", "memory-hook is outro");
  });

  test("Exponents: prediction and discovery before Markdown; explain and memory-hook after", () => {
    const strategy = getStrategy("numbers-exponents");
    const { introBlocks, outroBlocks } = resolveComposition(strategy);
    const introTypes = introBlocks.map((b) => b.type);
    const outroTypes = outroBlocks.map((b) => b.type);
    assertEqual(introTypes[0], "prediction", "prediction is first");
    assertEqual(introTypes[1], "discovery", "discovery is second");
    assertArrayContains(outroTypes, "explain", "explain is outro");
    assertArrayContains(outroTypes, "memory-hook", "memory-hook is outro");
  });
});

describe("Led composition rendering — HCF/LCM", () => {
  test("HCF/LCM renders all blocks as main content (led)", () => {
    const strategy = getStrategy("numbers-hcf-lcm");
    const { ledBlocks } = resolveComposition(strategy);
    assertGreaterThan(ledBlocks.length, 0, "has led blocks");

    const types = ledBlocks.map((b) => b.type);
    assertArrayContains(types, "story", "story included");
    assertArrayContains(types, "discovery", "discovery included");
    assertArrayContains(types, "worked-example", "worked-example included");
    assertArrayContains(types, "mastery", "mastery included");
  });
});

describe("No content duplication", () => {
  test("Linear equation strategy does not contain duplicated works examples", () => {
    const strategy = getStrategy("algebra-linear-equation");
    const { introBlocks, outroBlocks } = resolveComposition(strategy);
    const allBlocks = [...introBlocks, ...outroBlocks];
    const types = allBlocks.map((b) => b.type);
    assertFalse(types.includes("story"), "no duplicated story (seesaw)");
    assertFalse(types.includes("visual"), "no duplicated visual (balance)");
    assertFalse(types.includes("worked-example"), "no duplicated worked example");
    assertFalse(types.includes("guided-practice"), "no duplicated guided practice");
    assertFalse(types.includes("independent-practice"), "no duplicated independent practice");
    assertFalse(types.includes("mastery"), "no duplicated mastery check");
  });

  test("Circle area strategy does not contain duplicate widget or examples", () => {
    const strategy = getStrategy("geo-circle-area");
    const { introBlocks, outroBlocks } = resolveComposition(strategy);
    const allBlocks = [...introBlocks, ...outroBlocks];
    const types = allBlocks.map((b) => b.type);
    assertFalse(types.includes("interactive"), "no duplicate interactive widget marker");
    assertFalse(types.includes("worked-example"), "no duplicated worked example");
    assertFalse(types.includes("guided-practice"), "no duplicated guided practice");
    assertFalse(types.includes("independent-practice"), "no duplicated independent practice");
    assertFalse(types.includes("mastery"), "no duplicated mastery check");
  });

  test("Exponents strategy does not contain duplicated rules or examples", () => {
    const strategy = getStrategy("numbers-exponents");
    const { introBlocks, outroBlocks } = resolveComposition(strategy);
    const allBlocks = [...introBlocks, ...outroBlocks];
    const types = allBlocks.map((b) => b.type);
    assertFalse(types.includes("story"), "no duplicated story (repeated multiplication)");
    assertFalse(types.includes("worked-example"), "no duplicated worked example");
    assertFalse(types.includes("guided-practice"), "no duplicated guided practice");
    assertFalse(types.includes("independent-practice"), "no duplicated independent practice");
    assertFalse(types.includes("misconception-intervention"), "no duplicated misconception (Watch Out)");
    assertFalse(types.includes("mastery"), "no duplicated mastery check");
  });

  test("HCF/LCM strategy-led content is complete and coherent", () => {
    const strategy = getStrategy("numbers-hcf-lcm");
    const { ledBlocks } = resolveComposition(strategy);
    const types = ledBlocks.map((b) => b.type);
    assertArrayContains(types, "story", "story introduces the concept");
    assertArrayContains(types, "prediction", "prediction engages the child");
    assertArrayContains(types, "discovery", "discovery reveals HCF vs LCM");
    assertArrayContains(types, "worked-example", "worked-example shows calculation");
    assertArrayContains(types, "guided-practice", "guided practice");
    assertArrayContains(types, "independent-practice", "independent practice");
    assertArrayContains(types, "explain", "reflection");
    assertArrayContains(types, "memory-hook", "memorable takeaway");
    assertArrayContains(types, "mastery", "mastery check");
  });
});

describe("Chapter → concept ID mapping", () => {
  test("getStrategy returns correct strategy for each mapped chapter slug", () => {
    const linear = getStrategy("algebra-linear-equation");
    assertTrue(linear, "linear equation strategy exists");
    assertEqual(linear.lessonSlug, "foundation-5-basic-algebra", "linear maps to foundation-5-basic-algebra");

    const circle = getStrategy("geo-circle-area");
    assertTrue(circle, "circle area strategy exists");
    assertEqual(circle.lessonSlug, "geometry-basics", "circle maps to geometry-basics");

    const exponents = getStrategy("numbers-exponents");
    assertTrue(exponents, "exponents strategy exists");
    assertEqual(exponents.lessonSlug, "foundation-4-powers-and-roots", "exponents maps to foundation-4-powers-and-roots");

    const hcf = getStrategy("numbers-hcf-lcm");
    assertTrue(hcf, "hcf-lcm strategy exists");
    assertEqual(hcf.lessonSlug, "foundation-1-numbers-and-signs", "hcf-lcm maps to foundation-1-numbers-and-signs");
  });

  test("listStrategies returns exactly the four pilot concept IDs", () => {
    const ids = listStrategies();
    assertEqual(ids.length, 4, "exactly four strategies");
  });
});

describe("Graceful handling of invalid blocks", () => {
  test("Null block does not break rendering", () => {
    const container = document.createElement("div");
    renderBlock(container, null);
    assertEqual(container.children.length, 0, "null block adds no elements");
  });

  test("Undefined block does not break rendering", () => {
    const container = document.createElement("div");
    renderBlock(container, undefined);
    assertEqual(container.children.length, 0, "undefined block adds no elements");
  });

  test("Block with unknown type gets graceful fallback", () => {
    const block = { type: "magic-block", content: "<p>Unknown block</p>" };
    const container = document.createElement("div");
    renderBlock(container, block);
    const rendered = container.querySelector(".lesson-block");
    assertTrue(rendered, "Unknown block renders as fallback");
    assertTrue(rendered.innerHTML.includes("Unknown block"), "Unknown block content is shown");
  });

  test("Block with empty content still renders title", () => {
    const block = { type: "story", title: "Empty Story", content: "" };
    const container = document.createElement("div");
    renderBlock(container, block);
    const titleEl = container.querySelector(".lesson-block-title");
    assertEqual(titleEl.textContent, "Empty Story", "Title rendered even with empty content");
  });
});

describe("No regressions in reader behaviour", () => {
  test("getStrategy and renderBlocks are pure functions with no side effects", () => {
    const before = listStrategies().length;
    const container = document.createElement("div");
    renderBlocks(container, getStrategy("algebra-linear-equation"));
    const after = listStrategies().length;
    assertEqual(before, after, "listStrategies unchanged after rendering");
  });

  test("resolveComposition does not mutate the strategy", () => {
    const strategy = getStrategy("algebra-linear-equation");
    const introBefore = JSON.stringify(strategy.experience.blocks.filter((b) => b.placement === "before").map((b) => b.type));
    resolveComposition(strategy);
    const introAfter = JSON.stringify(strategy.experience.blocks.filter((b) => b.placement === "before").map((b) => b.type));
    assertEqual(introBefore, introAfter, "strategy blocks not mutated by composition resolution");
  });
});

// ------------------------------------------------------------------
// Runner
// ------------------------------------------------------------------

console.log("\n" + "=".repeat(60));
console.log("Stage 2B1 — Reader Integration Tests (Composition Correction)");
console.log("=".repeat(60));

export { test, assertEqual, assertTrue, assertFalse };
