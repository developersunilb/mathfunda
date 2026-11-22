import "katex/dist/katex.min.css";
import katex from "katex";
import "../css/site.css";
import { renderMarkdown } from "./markdown.js";
import { lessonHref } from "./curriculum.js";
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
} from "./vocabulary-data.js";

const listEl = document.querySelector("#vocab-list");
const countEl = document.querySelector("#vocab-count");
const emptyEl = document.querySelector("#vocab-empty");
const queryEl = document.querySelector("#vocab-query");
const categoryChipsEl = document.querySelector("#vocab-category-chips");
const levelChipsEl = document.querySelector("#vocab-level-chips");
const azEl = document.querySelector("#vocab-az");
const symbolStripEl = document.querySelector("#vocab-symbol-strip");

const entries = sortVocabulary();
const idByTerm = new Map(entries.map((entry) => [entry.term, vocabId(entry.term)]));
const state = { query: "", category: "all", level: "all" };

const categoryCounts = Object.fromEntries(
  VOCAB_CATEGORIES.map((category) => [
    category.id,
    entries.filter((entry) => entry.category === category.id).length,
  ])
);
const levelCounts = Object.fromEntries(
  VOCAB_LEVELS.map((level) => [
    level.id,
    entries.filter((entry) => entry.level === level.id).length,
  ])
);

/* ----------------------------------------------------------- Rendering */

function renderMath(source) {
  try {
    return katex.renderToString(source, {
      throwOnError: false,
      strict: "ignore",
      trust: false,
      displayMode: false,
    });
  } catch {
    return source;
  }
}

function makeChip({ label, count, pressed, onClick }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "vocab-chip";
  button.setAttribute("aria-pressed", String(pressed));
  button.innerHTML = `<span>${label}</span><span class="vocab-chip-count">${count}</span>`;
  button.addEventListener("click", onClick);
  return button;
}

function buildChips() {
  categoryChipsEl.appendChild(
    makeChip({
      label: "All topics",
      count: entries.length,
      pressed: true,
      onClick: () => {
        state.category = "all";
        syncChips();
        applyFilter();
      },
    })
  );
  VOCAB_CATEGORIES.forEach((category) => {
    categoryChipsEl.appendChild(
      makeChip({
        label: category.label,
        count: categoryCounts[category.id],
        pressed: false,
        onClick: () => {
          state.category = category.id;
          syncChips();
          applyFilter();
        },
      })
    );
  });

  levelChipsEl.appendChild(
    makeChip({
      label: "All levels",
      count: entries.length,
      pressed: true,
      onClick: () => {
        state.level = "all";
        syncChips();
        applyFilter();
      },
    })
  );
  VOCAB_LEVELS.forEach((level) => {
    levelChipsEl.appendChild(
      makeChip({
        label: level.label,
        count: levelCounts[level.id],
        pressed: false,
        onClick: () => {
          state.level = level.id;
          syncChips();
          applyFilter();
        },
      })
    );
  });
}

function syncChips() {
  categoryChipsEl.querySelectorAll(".vocab-chip").forEach((chip, index) => {
    const id = index === 0 ? "all" : VOCAB_CATEGORIES[index - 1].id;
    chip.setAttribute("aria-pressed", String(state.category === id));
  });
  levelChipsEl.querySelectorAll(".vocab-chip").forEach((chip, index) => {
    const id = index === 0 ? "all" : VOCAB_LEVELS[index - 1].id;
    chip.setAttribute("aria-pressed", String(state.level === id));
  });
}

function buildCard(entry) {
  const card = document.createElement("article");
  card.className = "vocab-card";
  card.id = vocabId(entry.term);
  card.dataset.search = vocabSearchText(entry);
  card.dataset.category = entry.category;
  card.dataset.level = entry.level;

  const top = document.createElement("div");
  top.className = "vocab-card-top";

  const titleWrap = document.createElement("div");
  titleWrap.className = "vocab-card-title";

  const title = document.createElement("h3");
  title.textContent = entry.term;

  const badges = document.createElement("div");
  badges.className = "vocab-badges";
  const level = VOCAB_LEVEL_BY_ID[entry.level];
  const levelBadge = document.createElement("span");
  levelBadge.className = `vocab-badge vocab-level-${entry.level}`;
  levelBadge.textContent = level.label;
  levelBadge.title = level.hint;
  const category = VOCAB_CATEGORY_BY_ID[entry.category];
  const categoryBadge = document.createElement("span");
  categoryBadge.className = "vocab-badge vocab-category-badge";
  categoryBadge.textContent = category.label;
  badges.append(levelBadge, categoryBadge);

  titleWrap.append(title, badges);

  if (entry.symbol) {
    const symbol = document.createElement("span");
    symbol.className = "vocab-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.innerHTML = renderMath(entry.symbol);
    top.append(titleWrap, symbol);
  } else {
    top.append(titleWrap);
  }
  card.appendChild(top);

  const simple = document.createElement("div");
  simple.className = "vocab-simple";
  simple.innerHTML = renderMarkdown(entry.simple);
  card.appendChild(simple);

  const formal = document.createElement("div");
  formal.className = "vocab-formal";
  formal.innerHTML = `<span class="vocab-formal-label">Formally</span>${renderMarkdown(
    entry.formal
  )}`;
  card.appendChild(formal);

  if (entry.example) {
    const details = document.createElement("details");
    details.className = "vocab-example";
    const summary = document.createElement("summary");
    summary.textContent = "Example";
    const body = document.createElement("div");
    body.className = "vocab-example-body";
    body.innerHTML = renderMarkdown(entry.example);
    details.append(summary, body);
    card.appendChild(details);
  }

  if (entry.links?.length) {
    const links = document.createElement("div");
    links.className = "vocab-links";
    entry.links.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = lessonHref(link.slug);
      anchor.textContent = link.label;
      links.appendChild(anchor);
    });
    card.appendChild(links);
  }

  if (entry.seeAlso?.length) {
    const seeAlso = document.createElement("p");
    seeAlso.className = "vocab-see-also";
    const label = document.createElement("span");
    label.textContent = "See also: ";
    seeAlso.appendChild(label);
    entry.seeAlso.forEach((name, index) => {
      const targetId = idByTerm.get(name);
      if (!targetId) return;
      if (index > 0) seeAlso.appendChild(document.createTextNode(" · "));
      const anchor = document.createElement("a");
      anchor.href = `#${targetId}`;
      anchor.textContent = name;
      seeAlso.appendChild(anchor);
    });
    card.appendChild(seeAlso);
  }

  return card;
}

const groupsByLetter = new Map();

function buildList() {
  let currentLetter = "";
  let group = null;
  let grid = null;

  entries.forEach((entry) => {
    const letter = entry.term.charAt(0).toUpperCase();
    if (letter !== currentLetter) {
      currentLetter = letter;
      group = document.createElement("section");
      group.className = "vocab-letter-group";
      group.dataset.letter = letter;
      group.id = `vocab-letter-${letter.toLowerCase()}`;
      const head = document.createElement("div");
      head.className = "vocab-letter-head";
      head.innerHTML = `<h2>${letter}</h2><span class="vocab-letter-count"></span>`;
      grid = document.createElement("div");
      grid.className = "vocab-grid";
      group.append(head, grid);
      listEl.appendChild(group);
      groupsByLetter.set(letter, group);
    }
    grid.appendChild(buildCard(entry));
  });
}

function buildAz() {
  VOCAB_LETTERS.forEach((letter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vocab-az-letter";
    button.textContent = letter;
    button.dataset.letter = letter;
    button.addEventListener("click", () => {
      const group = groupsByLetter.get(letter);
      if (group && !group.hidden) {
        group.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    azEl.appendChild(button);
  });
}

function buildSymbolStrip() {
  const withSymbols = entries.filter((entry) => entry.symbol);
  withSymbols.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vocab-symbol-chip";
    button.setAttribute("aria-label", `Show the entry for ${entry.term}`);
    const glyph = document.createElement("span");
    glyph.className = "vocab-symbol-glyph";
    glyph.setAttribute("aria-hidden", "true");
    glyph.innerHTML = renderMath(entry.symbol);
    const name = document.createElement("span");
    name.className = "vocab-symbol-name";
    name.textContent = entry.term.replace(/\s*\(.*?\)\s*/g, "");
    button.append(glyph, name);
    button.addEventListener("click", () => revealEntry(entry.term));
    symbolStripEl.appendChild(button);
  });
}

/* ------------------------------------------------------------- Filtering */

function applyFilter() {
  const needle = state.query.trim().toLowerCase();
  let visible = 0;

  listEl.querySelectorAll(".vocab-card").forEach((card) => {
    const matchesSearch = !needle || card.dataset.search.includes(needle);
    const matchesCategory =
      state.category === "all" || card.dataset.category === state.category;
    const matchesLevel = state.level === "all" || card.dataset.level === state.level;
    const show = matchesSearch && matchesCategory && matchesLevel;
    card.hidden = !show;
    if (show) visible += 1;
  });

  groupsByLetter.forEach((group, letter) => {
    const cards = [...group.querySelectorAll(".vocab-card")];
    const shown = cards.filter((card) => !card.hidden).length;
    group.hidden = shown === 0;
    const count = group.querySelector(".vocab-letter-count");
    const isFiltered = Boolean(needle) || state.category !== "all" || state.level !== "all";
    count.textContent = isFiltered
      ? `${shown} of ${cards.length}`
      : `${cards.length} term${cards.length === 1 ? "" : "s"}`;
    const letterButton = azEl.querySelector(`[data-letter="${letter}"]`);
    if (letterButton) letterButton.disabled = shown === 0;
  });

  const isFiltered = Boolean(needle) || state.category !== "all" || state.level !== "all";
  countEl.textContent = isFiltered ? `${visible} of ${entries.length} terms` : `${entries.length} terms`;
  emptyEl.hidden = visible > 0;
}

function resetFilters() {
  state.query = "";
  state.category = "all";
  state.level = "all";
  queryEl.value = "";
  syncChips();
  applyFilter();
}

function revealEntry(term) {
  const id = idByTerm.get(term);
  if (!id) return;
  resetFilters();
  const card = document.getElementById(id);
  if (!card) return;
  card.querySelectorAll("details").forEach((details) => {
    details.open = true;
  });
  card.classList.add("is-target");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => card.classList.remove("is-target"), 2600);
}

function revealHash() {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!raw) return;
  const card = document.getElementById(raw);
  if (!card || !card.classList.contains("vocab-card")) return;
  card.querySelectorAll("details").forEach((details) => {
    details.open = true;
  });
  card.classList.add("is-target");
  card.scrollIntoView({ block: "center" });
  window.setTimeout(() => card.classList.remove("is-target"), 2600);
}

/* --------------------------------------------------------------- Wiring */

buildChips();
buildList();
buildAz();
buildSymbolStrip();
applyFilter();

let searchTimer;
queryEl.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.query = queryEl.value;
    applyFilter();
  }, 130);
});

const initialQuery = new URLSearchParams(window.location.search).get("q");
if (initialQuery) {
  state.query = initialQuery;
  queryEl.value = initialQuery;
  applyFilter();
}

window.addEventListener("hashchange", revealHash);
revealHash();

document.addEventListener("keydown", (event) => {
  if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) {
    return;
  }
  event.preventDefault();
  queryEl.focus();
});

document.querySelector("#vocab-print").addEventListener("click", () => {
  listEl.querySelectorAll("details").forEach((details) => {
    details.open = true;
  });
  window.print();
});
