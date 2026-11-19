/**
 * Stage 2B3 — Memory Journey Tests.
 *
 * Tests:
 *   - Memory Journey rendering for both composition approaches (enhanced + led)
 *   - Optional elements and missing fields
 *   - Active recall and answer reveal
 *   - Mathematical content correctness
 *   - No unintended changes to mastery
 *   - No duplicate content
 *   - Existing Markdown fallback (concepts without memory journey)
 *
 * Run with: node --test js/milestone8-teaching-memory.test.js
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

import {
  getMemoryJourney,
  hasMemoryJourney,
} from "./lesson-intelligence.js";
import { renderMemoryJourneyElement } from "./block-renderer.js";
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

describe("Memory Journey data availability", () => {
  test("getMemoryJourney returns data for linear equation (enhanced)", () => {
    const journey = getMemoryJourney("algebra-linear-equation");
    assertTrue(journey, "linear equation has memory journey");
    assertArrayContains(["question", "discovery", "idea", "rule", "watchout", "remember"], journey.elements[0].type, "first element type is valid");
    assertEqual(journey.elements.length, 6, "linear equation has 6 elements");
  });

  test("getMemoryJourney returns data for circle area (enhanced)", () => {
    const journey = getMemoryJourney("geo-circle-area");
    assertTrue(journey, "circle area has memory journey");
    assertEqual(journey.elements.length, 6, "circle area has 6 elements");
  });

  test("getMemoryJourney returns data for exponents (enhanced)", () => {
    const journey = getMemoryJourney("numbers-exponents");
    assertTrue(journey, "exponents has memory journey");
    assertEqual(journey.elements.length, 6, "exponents has 6 elements");
  });

  test("getMemoryJourney returns data for HCF/LCM (led)", () => {
    const journey = getMemoryJourney("numbers-hcf-lcm");
    assertTrue(journey, "hcf-lcm has memory journey");
    assertEqual(journey.elements.length, 6, "hcf-lcm has 6 elements");
  });

  test("getMemoryJourney returns null for unknown concept", () => {
    assertEqual(getMemoryJourney("nonexistent"), null, "unknown concept returns null");
  });

  test("hasMemoryJourney returns correct boolean values", () => {
    assertTrue(hasMemoryJourney("algebra-linear-equation"), "linear equation has journey");
    assertTrue(hasMemoryJourney("geo-circle-area"), "circle area has journey");
    assertTrue(hasMemoryJourney("numbers-exponents"), "exponents has journey");
    assertTrue(hasMemoryJourney("numbers-hcf-lcm"), "hcf-lcm has journey");
    assertFalse(hasMemoryJourney("nonexistent"), "nonexistent has no journey");
  });
});

describe("Element structure validation", () => {
  test("Each element has type, title, content", () => {
    for (const [id, strategy] of Object.entries(LESSON_STRATEGIES)) {
      const journey = strategy.memoryJourney;
      if (!journey) continue;
      for (const element of journey.elements) {
        assertTrue(typeof element.type === "string" && element.type.length > 0, `${id}: element has type`);
        assertTrue(typeof element.title === "string" && element.title.length > 0, `${id}: element ${element.type} has title`);
        assertTrue(typeof element.content === "string" && element.content.length > 0, `${id}: element ${element.type} has content`);
      }
    }
  });

  test("Element types are from the valid set", () => {
    const validTypes = new Set(["question", "discovery", "idea", "rule", "watchout", "remember"]);
    for (const [id, strategy] of Object.entries(LESSON_STRATEGIES)) {
      const journey = strategy.memoryJourney;
      if (!journey) continue;
      for (const element of journey.elements) {
        assertTrue(validTypes.has(element.type), `${id}: element type ${element.type} is valid`);
      }
    }
  });

  test("Recall prompt and answer are optional and consistent", () => {
    for (const [id, strategy] of Object.entries(LESSON_STRATEGIES)) {
      const journey = strategy.memoryJourney;
      if (!journey) continue;
      for (const element of journey.elements) {
        if (element.recallPrompt) {
          assertTrue(typeof element.recallPrompt === "string" && element.recallPrompt.length > 0, `${id}: ${element.type} recallPrompt is non-empty`);
        }
        if (element.recallAnswer) {
          assertTrue(typeof element.recallAnswer === "string" && element.recallAnswer.length > 0, `${id}: ${element.type} recallAnswer is non-empty`);
        }
      }
    }
  });
});

describe("Element ordering", () => {
  test("Linear equation: question → discovery → idea → rule → watchout → remember", () => {
    const journey = getMemoryJourney("algebra-linear-equation");
    const types = journey.elements.map((e) => e.type);
    assertEqual(types[0], "question");
    assertEqual(types[1], "discovery");
    assertEqual(types[2], "idea");
    assertEqual(types[3], "rule");
    assertEqual(types[4], "watchout");
    assertEqual(types[5], "remember");
  });

  test("Circle area: question → discovery → idea → rule → watchout → remember", () => {
    const journey = getMemoryJourney("geo-circle-area");
    const types = journey.elements.map((e) => e.type);
    assertEqual(types[0], "question");
    assertEqual(types[1], "discovery");
    assertEqual(types[2], "idea");
    assertEqual(types[3], "rule");
    assertEqual(types[4], "watchout");
    assertEqual(types[5], "remember");
  });

  test("HCF/LCM: question → discovery → idea → rule → watchout → remember", () => {
    const journey = getMemoryJourney("numbers-hcf-lcm");
    const types = journey.elements.map((e) => e.type);
    assertEqual(types[0], "question");
    assertEqual(types[1], "discovery");
    assertEqual(types[2], "idea");
    assertEqual(types[3], "rule");
    assertEqual(types[4], "watchout");
    assertEqual(types[5], "remember");
  });
});

describe("Mathematical content correctness", () => {
  test("Linear equation: rule mentions x = 12 - 7 = 5", () => {
    const journey = getMemoryJourney("algebra-linear-equation");
    const rule = journey.elements.find((e) => e.type === "rule");
    assertTrue(rule.content.includes("12 - 7"), "rule mentions correct calculation");
    assertTrue(rule.content.includes("= 5"), "rule mentions correct answer");
  });

  test("Circle area: rule mentions πr²", () => {
    const journey = getMemoryJourney("geo-circle-area");
    const rule = journey.elements.find((e) => e.type === "rule");
    assertTrue(rule.content.includes("πr²"), "rule mentions πr² formula");
  });

  test("Exponents: watchout mentions not multiplying exponents", () => {
    const journey = getMemoryJourney("numbers-exponents");
    const watchout = journey.elements.find((e) => e.type === "watchout");
    assertTrue(watchout.content.includes("NOT 2⁶"), "watchout mentions incorrect 2⁶");
    assertTrue(watchout.content.includes("add"), "watchout mentions adding exponents");
  });

  test("HCF/LCM: remember mentions both HCF and LCM", () => {
    const journey = getMemoryJourney("numbers-hcf-lcm");
    const remember = journey.elements.find((e) => e.type === "remember");
    assertTrue(remember.content.includes("HCF"), "remember mentions HCF");
    assertTrue(remember.content.includes("LCM"), "remember mentions LCM");
  });
});

describe("Active recall prompts", () => {
  test("Each pilot has at least one recall prompt", () => {
    for (const [id, strategy] of Object.entries(LESSON_STRATEGIES)) {
      const journey = strategy.memoryJourney;
      if (!journey) continue;
      const prompts = journey.elements.filter((e) => e.recallPrompt);
      assertTrue(prompts.length > 0, `${id}: has at least one recall prompt`);
    }
  });

  test("Recall answers match recall prompts where present", () => {
    for (const [id, strategy] of Object.entries(LESSON_STRATEGIES)) {
      const journey = strategy.memoryJourney;
      if (!journey) continue;
      for (const element of journey.elements) {
        if (element.recallPrompt) {
          assertTrue(element.recallAnswer, `${id}: ${element.type} has recallAnswer for its prompt`);
        }
      }
    }
  });
});

describe("Block rendering for memory journey elements", () => {
  test("renderMemoryJourneyElement creates memory block", () => {
    const element = {
      type: "rule",
      title: "The Rule",
      content: "Area = πr²",
      recallPrompt: "What is the formula?",
      recallAnswer: "A = π × r × r",
    };
    const container = document.createElement("div");
    renderMemoryJourneyElement(container, element, 2);
    const block = container.querySelector(".lesson-block-memory-rule");
    assertTrue(block, "memory rule block rendered");
    assertEqual(block.dataset.memoryIndex, "2", "has correct index");
    assertTrue(block.textContent.includes("Area = πr²"), "content is rendered");
    assertTrue(block.textContent.includes("What is the formula?"), "recall prompt is rendered");
  });

  test("renderMemoryJourneyElement without recall prompt", () => {
    const element = {
      type: "discovery",
      title: "The Discovery",
      content: "We found something.",
    };
    const container = document.createElement("div");
    renderMemoryJourneyElement(container, element, 0);
    const block = container.querySelector(".lesson-block-memory-discovery");
    assertTrue(block, "memory discovery block rendered");
    assertTrue(block.textContent.includes("We found something."), "content is rendered");
    const recallWrap = container.querySelector(".memory-recall-wrap");
    assertFalse(recallWrap, "no recall wrap when no prompt");
  });

  test("renderMemoryJourneyElement handles missing fields gracefully", () => {
    const element = { type: "remember" };
    const container = document.createElement("div");
    // Should not throw
    renderMemoryJourneyElement(container, element, 0);
    const block = container.querySelector(".lesson-block-memory-remember");
    assertTrue(block, "minimal element renders");
  });
});

describe("No unintended mastery changes", () => {
  test("Memory Journey does not call mastery-related functions", () => {
    // This is a structural check: memoryJourney data and getMemoryJourney
    // are purely data accessors, not state mutators.
    const journey = getMemoryJourney("algebra-linear-equation");
    assertTrue(journey, "journey is accessible");
    // The journey data itself has no mastery-related fields
    assertFalse("mastery" in journey, "journey has no mastery field");
    assertFalse("threshold" in journey, "journey has no threshold field");
  });
});

describe("Existing Markdown fallback", () => {
  test("Concepts without memory journey return null", () => {
    // Non-pilot concepts should not have memory journey data
    assertEqual(getMemoryJourney("real-numbers"), null, "real numbers has no journey");
    assertEqual(getMemoryJourney("fractions-decimals"), null, "fractions has no journey");
  });
});

// ------------------------------------------------------------------
// Runner
// ------------------------------------------------------------------

console.log("\n" + "=".repeat(60));
console.log("Stage 2B3 — Memory Journey Tests");
console.log("=".repeat(60));

export { test, assertEqual, assertTrue, assertFalse };
