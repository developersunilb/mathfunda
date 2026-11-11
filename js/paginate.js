/**
 * Shared pagination engine.
 *
 * Both the EPUB exporter and the on-screen flip-book reader use this code, so a
 * lesson breaks into pages the same way in the printed book and in the reader.
 *
 * A builder supplied by the caller must provide:
 *   builder.current.body   element whose scrollHeight is measured
 *   builder.contentWidth   numeric content width in pixels
 *   builder.pageHeight     numeric content height in pixels
 *   builder.fits()         true when the current page still fits
 *   builder.hasContent()   true when the current page has printable blocks
 *   builder.breakPage({ chapterTitle })
 *   builder.addPage({ chapterTitle, label, showLabel })
 */

export function isBlank(node) {
  return node.nodeType === Node.TEXT_NODE && !node.nodeValue.trim();
}

export function isHeading(node) {
  return node.nodeType === Node.ELEMENT_NODE && /^H[1-6]$/.test(node.tagName);
}

function tryAppend(builder, node) {
  const clone = node.cloneNode(true);
  builder.current.body.appendChild(clone);
  if (builder.fits()) return true;
  builder.current.body.removeChild(clone);
  return false;
}

// Break to a fresh page, but carry a trailing heading with it so headings are
// never stranded at the bottom of a page.
function breakPageKeepingHeading(builder, chapter) {
  const body = builder.current.body;
  const blocks = [...body.children].filter(
    (child) => !child.classList.contains("epub-chapter-label")
  );
  const last = blocks[blocks.length - 1];
  let heading = null;

  if (last && isHeading(last) && blocks.length > 1) {
    last.remove();
    heading = last;
  }

  builder.breakPage({ chapterTitle: chapter.title });
  if (heading) builder.current.body.appendChild(heading);
}

function placeNode(builder, node, chapter) {
  if (isBlank(node)) return;

  if (isHeading(node)) {
    const probe = node.cloneNode(true);
    builder.current.body.appendChild(probe);
    const overflow = !builder.fits();
    const tooCloseToEdge = builder.current.body.scrollHeight > builder.pageHeight - 120;
    builder.current.body.removeChild(probe);
    if (builder.hasContent() && (overflow || tooCloseToEdge)) {
      breakPageKeepingHeading(builder, chapter);
    }
  }

  if (tryAppend(builder, node)) return;

  // Lists and tables can flow across a page boundary, which avoids leaving a
  // large empty area at the bottom of a page.
  if (
    node.nodeType === Node.ELEMENT_NODE &&
    (node.tagName === "UL" || node.tagName === "OL" || node.tagName === "TABLE") &&
    splitNode(builder, node, chapter)
  ) {
    return;
  }

  if (builder.hasContent()) {
    breakPageKeepingHeading(builder, chapter);
    if (tryAppend(builder, node)) return;
  }

  if (splitNode(builder, node, chapter)) return;

  // Last resort: place the block and let it clip rather than lose content.
  builder.current.body.appendChild(node.cloneNode(true));
}

function splitNode(builder, node, chapter) {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = node.tagName;
  if (tag === "UL" || tag === "OL") return splitList(builder, node, chapter);
  if (tag === "TABLE") return splitTable(builder, node, chapter);
  return false;
}

function splitList(builder, listElement, chapter) {
  const tag = listElement.tagName;
  const items = [...listElement.children].filter((child) => child.tagName === "LI");
  if (items.length === 0) return false;

  const attributes = [...listElement.attributes].filter(
    (attribute) => attribute.name !== "start"
  );
  const originalStart = Number(listElement.getAttribute("start") || 1);

  const createList = () => {
    const list = document.createElement(tag);
    attributes.forEach((attribute) =>
      list.setAttribute(attribute.name, attribute.value)
    );
    if (tag === "OL") {
      list.setAttribute("start", String(originalStart + index));
    }
    builder.current.body.appendChild(list);
    return list;
  };

  let index = 0;
  let list = createList();

  while (index < items.length) {
    const item = items[index].cloneNode(true);
    list.appendChild(item);

    if (builder.fits()) {
      index += 1;
      continue;
    }

    list.removeChild(item);
    if (list.children.length > 0) {
      breakPageKeepingHeading(builder, chapter);
      list = createList();
      continue;
    }

    // The item alone is taller than a page. Move to a fresh page and clip.
    list.remove();
    breakPageKeepingHeading(builder, chapter);
    list = createList();
    list.appendChild(item);
    index += 1;
  }

  return true;
}

function splitTable(builder, tableElement, chapter) {
  const head = tableElement.querySelector("thead");
  const rows = tableElement.querySelectorAll("tbody > tr");
  const rowElements = rows.length
    ? [...rows]
    : [...tableElement.children].filter((child) => child.tagName === "TR");
  if (rowElements.length === 0) return false;

  const createTable = () => {
    const table = document.createElement("table");
    [...tableElement.attributes].forEach((attribute) =>
      table.setAttribute(attribute.name, attribute.value)
    );
    if (head) table.appendChild(head.cloneNode(true));
    const body = document.createElement("tbody");
    table.appendChild(body);
    builder.current.body.appendChild(table);
    return body;
  };

  let index = 0;
  let body = createTable();

  while (index < rowElements.length) {
    const row = rowElements[index].cloneNode(true);
    body.appendChild(row);

    if (builder.fits()) {
      index += 1;
      continue;
    }

    body.removeChild(row);
    if (body.children.length > 0) {
      breakPageKeepingHeading(builder, chapter);
      body = createTable();
      continue;
    }

    body.parentElement.remove();
    breakPageKeepingHeading(builder, chapter);
    body = createTable();
    body.appendChild(row);
    index += 1;
  }

  return true;
}

export function paginateChapter(builder, chapter, label) {
  const startIndex = builder.pages.length;
  builder.addPage({
    chapterTitle: chapter.title,
    label,
    showLabel: true,
  });

  const source = document.createElement("div");
  source.className = "document-content";
  source.style.width = `${builder.contentWidth}px`;
  source.innerHTML = chapter.html;

  // The chapter label already prints the title. Drop a duplicate leading heading.
  const firstBlock = [...source.children][0];
  if (
    firstBlock &&
    /^H[12]$/.test(firstBlock.tagName) &&
    firstBlock.textContent.trim().toLowerCase() === chapter.title.trim().toLowerCase()
  ) {
    firstBlock.remove();
  }

  for (const node of [...source.childNodes]) {
    placeNode(builder, node, chapter);
  }

  return startIndex;
}
