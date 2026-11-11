import "katex/dist/katex.min.css";
import { chapters, STAGES, lessonHref } from "./curriculum.js";
import { extractTables } from "./formulas.js";
import { renderMarkdown } from "./markdown.js";
import "../css/site.css";

const groups = document.querySelector("#vault-groups");
const countEl = document.querySelector("#vault-count");
const emptyEl = document.querySelector("#vault-empty");
const queryEl = document.querySelector("#vault-query");

let totalRows = 0;
const searchable = [];

STAGES.forEach((stage) => {
  const stageLessons = chapters.filter((chapter) => chapter.stage === stage.id);
  const withTables = stageLessons
    .map((chapter) => ({ chapter, tables: extractTables(chapter) }))
    .filter((entry) => entry.tables.length > 0);
  if (!withTables.length) return;

  const section = document.createElement("section");
  section.className = "vault-stage";
  section.innerHTML = `<p class="eyebrow">${stage.kicker}</p><h2>${stage.title}</h2>`;

  withTables.forEach(({ chapter, tables }) => {
    const details = document.createElement("details");
    details.className = "vault-group";
    const rowTotal = tables.reduce((sum, table) => sum + table.rows.length, 0);
    totalRows += rowTotal;

    const body = document.createElement("div");
    body.className = "vault-group-body";

    tables.forEach((table) => {
      const wrapper = document.createElement("div");
      wrapper.className = "vault-table";
      if (table.heading) {
        const heading = document.createElement("h4");
        heading.textContent = table.heading;
        wrapper.appendChild(heading);
      }
      const rendered = document.createElement("div");
      rendered.className = "document-content";
      rendered.innerHTML = renderMarkdown(table.markdown);
      wrapper.appendChild(rendered);
      body.appendChild(wrapper);
    });

    details.innerHTML = `
      <summary>
        <span>${chapter.title}</span>
        <span class="vault-group-meta">${rowTotal} rule${rowTotal === 1 ? "" : "s"}</span>
      </summary>
    `;
    details.appendChild(body);
    details.insertAdjacentHTML(
      "beforeend",
      `<a class="vault-lesson-link" href="${lessonHref(chapter.slug)}">Read the lesson →</a>`
    );

    section.appendChild(details);
    searchable.push({ details, body, title: chapter.title });
  });

  groups.appendChild(section);
});

countEl.textContent = `${totalRows} rules`;

if (totalRows === 0) {
  emptyEl.hidden = false;
}

/* --------------------------------------------------------------- Search */

let searchTimer;
queryEl.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => applyFilter(queryEl.value.trim()), 140);
});

function applyFilter(query) {
  const needle = query.toLowerCase();
  let matches = 0;

  searchable.forEach(({ details, body, title }) => {
    const rows = [...body.querySelectorAll("tbody tr")];
    // A search for "heron" should find the chapter even if the word never
    // appears inside a formula row, so chapter titles and table headings
    // count as matches for the whole group.
    const groupMatch =
      needle.length > 0 &&
      (title.toLowerCase().includes(needle) ||
        [...body.querySelectorAll("h4")].some((heading) =>
          heading.textContent.toLowerCase().includes(needle)
        ));
    let visibleInGroup = 0;

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const match = !needle || groupMatch || text.includes(needle);
      row.hidden = !match;
      if (match) visibleInGroup += 1;
    });

    details.hidden = needle ? visibleInGroup === 0 : false;
    if (needle) details.open = visibleInGroup > 0;
    matches += visibleInGroup;
  });

  // Hide an entire stage when all of its groups are filtered out.
  document.querySelectorAll(".vault-stage").forEach((section) => {
    const anyVisible = [...section.querySelectorAll("details")].some((details) => !details.hidden);
    section.hidden = !anyVisible;
  });

  emptyEl.hidden = matches > 0;
  countEl.textContent = needle
    ? `${matches} match${matches === 1 ? "" : "es"}`
    : `${totalRows} rules`;
}

document.querySelector("#vault-print").addEventListener("click", () => {
  document.querySelectorAll(".vault-group").forEach((details) => {
    details.open = true;
  });
  window.print();
});
