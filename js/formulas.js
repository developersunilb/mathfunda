import { renderMarkdown } from "./markdown.js";

/**
 * Pull the reference tables out of a lesson's Markdown.
 * Only tables whose header looks like a rule bank are kept, so practice tables
 * and answer keys stay out of the formula vault.
 */

const HEADER_PATTERN = /formula|rule|idea|fact|skill|identity|conversion|shape|meaning/i;

export function extractTables(chapter) {
  const lines = chapter.content.split(/\r?\n/);
  const tables = [];
  let heading = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (/^##\s+/.test(line)) {
      heading = line.replace(/^##\s+/, "").trim();
      continue;
    }

    if (!line.trim().startsWith("|")) continue;

    const block = [];
    while (index < lines.length && lines[index].trim().startsWith("|")) {
      block.push(lines[index].trim());
      index += 1;
    }
    index -= 1;

    if (block.length < 3) continue;
    const header = block[0]
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);
    if (!HEADER_PATTERN.test(header.join(" "))) continue;
    if (block.slice(0, 3).some((row) => /practice|answer|question/i.test(row))) continue;

    tables.push({
      chapter,
      heading,
      markdown: block.join("\n"),
      rows: parseRows(block),
    });
  }

  return tables;
}

function parseRows(block) {
  return block
    .slice(2)
    .map((row) =>
      row
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell, index, cells) => !(index === 0 && cell === "") && !(index === cells.length - 1 && cell === ""))
    )
    .filter((cells) => cells.length >= 2)
    .map((cells) => ({ label: cells[0], value: cells.slice(1).join(" · ") }));
}

export function formulaRows(chapters) {
  return chapters.flatMap((chapter) =>
    extractTables(chapter).flatMap((table) =>
      table.rows.map((row) => ({ ...row, chapter, heading: table.heading }))
    )
  );
}

export function formulaOfTheDay(chapters, date = new Date()) {
  const rows = formulaRows(chapters);
  if (!rows.length) return null;
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date - start) / 86400000);
  return rows[day % rows.length];
}

export function renderInline(markdown) {
  return renderMarkdown(markdown).replace(/^<p>|<\/p>\s*$/g, "");
}
