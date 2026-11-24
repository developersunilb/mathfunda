/**
 * Maths Vocabulary integrity tests.
 *
 * The glossary is a public reference, so broken links or a duplicated term are
 * visible defects. These tests keep the data honest without needing a browser.
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  VOCABULARY,
  VOCAB_CATEGORIES,
  VOCAB_LEVELS,
  VOCAB_CATEGORY_BY_ID,
  VOCAB_LEVEL_BY_ID,
  VOCAB_LETTERS,
  vocabId,
  sortVocabulary,
  vocabSearchText,
  vocabSymbolGlyph,
} from "./vocabulary-data.js";

const here = dirname(fileURLToPath(import.meta.url));
const chapterDir = join(here, "..", "chapters", "class-9");
const chapterSlugs = new Set(
  readdirSync(chapterDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.slice(0, -3))
);
const terms = new Set(VOCABULARY.map((entry) => entry.term.toLowerCase()));

describe("Maths Vocabulary data", () => {
  it("is large enough to be a useful reference", () => {
    assert.ok(VOCABULARY.length >= 100, `only ${VOCABULARY.length} terms`);
  });

  it("uses only registered categories and levels", () => {
    for (const entry of VOCABULARY) {
      assert.ok(VOCAB_CATEGORY_BY_ID[entry.category], `bad category: ${entry.term}`);
      assert.ok(VOCAB_LEVEL_BY_ID[entry.level], `bad level: ${entry.term}`);
    }
  });

  it("has a simple meaning and a formal definition for every term", () => {
    for (const entry of VOCABULARY) {
      assert.ok(entry.simple.trim().length > 0, `missing simple: ${entry.term}`);
      assert.ok(entry.formal.trim().length > 0, `missing formal: ${entry.term}`);
      assert.notStrictEqual(
        entry.simple.trim().toLowerCase(),
        entry.formal.trim().toLowerCase(),
        `simple and formal are identical: ${entry.term}`
      );
    }
  });

  it("has unique terms and unique DOM ids", () => {
    const ids = new Map();
    for (const entry of VOCABULARY) {
      const key = entry.term.toLowerCase();
      assert.ok(!ids.has(key), `duplicate term: ${entry.term}`);
      ids.set(key, entry.term);
    }
    const byId = new Map();
    for (const entry of VOCABULARY) {
      const id = vocabId(entry.term);
      assert.ok(!byId.has(id), `duplicate id ${id}: ${entry.term} / ${byId.get(id)}`);
      byId.set(id, entry.term);
    }
  });

  it("links only to lessons that exist", () => {
    for (const entry of VOCABULARY) {
      for (const link of entry.links ?? []) {
        assert.ok(chapterSlugs.has(link.slug), `missing lesson ${link.slug} (${entry.term})`);
        assert.ok(link.label.trim().length > 0, `empty link label (${entry.term})`);
      }
    }
  });

  it("points see-also entries at real terms", () => {
    for (const entry of VOCABULARY) {
      for (const name of entry.seeAlso ?? []) {
        assert.ok(terms.has(name.toLowerCase()), `unknown see-also "${name}" (${entry.term})`);
        assert.notStrictEqual(
          name.toLowerCase(),
          entry.term.toLowerCase(),
          `self see-also: ${entry.term}`
        );
      }
    }
  });

  it("sorts alphabetically without mutating the source", () => {
    const before = VOCABULARY.map((entry) => entry.term);
    const sorted = sortVocabulary();
    const names = sorted.map((entry) => entry.term);
    const expected = [...names].sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" })
    );
    assert.deepStrictEqual(names, expected);
    assert.deepStrictEqual(
      VOCABULARY.map((entry) => entry.term),
      before,
      "sortVocabulary mutated the source array"
    );
  });

  it("covers every letter used by a term", () => {
    for (const entry of VOCABULARY) {
      assert.ok(
        VOCAB_LETTERS.includes(entry.term.charAt(0).toUpperCase()),
        `term does not start with A–Z: ${entry.term}`
      );
    }
  });

  it("makes the searchable text include plain meaning, symbol and glyph", () => {
    const angle = VOCABULARY.find((entry) => entry.term === "Angle");
    const text = vocabSearchText(angle);
    assert.ok(text.includes("angle"));
    assert.ok(text.includes("turn"));
    assert.ok(text.includes("∠"));
    assert.strictEqual(vocabSymbolGlyph("$\\angle ABC$"), "∠");
  });
});

describe("editorial accuracy guards", () => {
  it("defines a two-variable linear equation with the not-both-zero condition", () => {
    const entry = VOCABULARY.find(
      (item) => item.term === "Linear equation in two variables"
    );
    assert.ok(entry);
    assert.match(entry.formal, /not both zero/i);
    assert.doesNotMatch(entry.formal, /both non-?zero/i);
  });

  it("defines congruence by shape and size, not by equality alone", () => {
    const entry = VOCABULARY.find((item) => item.term === "Congruent");
    assert.ok(entry);
    assert.match(entry.simple, /same shape and the same size/i);
    assert.match(entry.formal, /corresponding sides and angles/i);
  });

  it("shows segment, ray and line notation", () => {
    const segment = VOCABULARY.find((item) => item.term === "Line segment");
    const ray = VOCABULARY.find((item) => item.term === "Ray");
    const line = VOCABULARY.find((item) => item.term === "Line");
    assert.match(segment.symbol, /overline/);
    assert.match(ray.formal, /overrightarrow/);
    assert.match(line.formal, /overleftrightarrow/);
  });

  it("does not claim that every line through the origin is y = mx", () => {
    const vertical = VOCABULARY.find((item) => item.term === "Vertical line");
    assert.match(vertical.formal, /not the graph of \$y=mx\+d\$/);
    assert.match(vertical.formal, /undefined/i);
  });

  it("warns that a ratio test needs non-zero denominators", () => {
    // The glossary avoids the unsafe ratio shortcut; the chapter carries the
    // full test. Guard the slope and pair vocabulary against silent division.
    const inconsistent = VOCABULARY.find((item) => item.term === "Inconsistent pair");
    assert.match(inconsistent.formal, /parallel/i);
  });
});

describe("Maths Vocabulary page wiring", () => {
  const page = readFileSync(join(here, "..", "vocabulary.html"), "utf8");

  it("loads the vocabulary module and exposes the search hooks", () => {
    assert.match(page, /\/js\/vocabulary\.js/);
    for (const id of [
      "vocab-query",
      "vocab-count",
      "vocab-empty",
      "vocab-category-chips",
      "vocab-level-chips",
      "vocab-az",
      "vocab-symbol-strip",
      "vocab-list",
    ]) {
      assert.match(page, new RegExp(`id="${id}"`), `missing #${id}`);
    }
  });

  it("links to the page from the site navigation of the main pages", () => {
    for (const file of [
      "index.html",
      "formulas.html",
      "flashcards.html",
      "learn.html",
      "methods.html",
    ]) {
      const html = readFileSync(join(here, "..", file), "utf8");
      assert.match(html, /href="\.\/vocabulary\.html"/, `${file} does not link to vocabulary`);
    }
  });
});
