import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

/**
 * Rich clipboard -> Markdown.
 *
 * Google Docs, Word and web pages all put their formatting in inline styles
 * rather than semantic tags. This module reads those styles, rebuilds clean
 * <strong>, <em>, <u>, <s>, <sup>, <sub> and coloured <span> elements, and
 * only then converts the document with Turndown. The result is editable
 * Markdown that still looks the same in the preview.
 */

const INLINE_UNWRAP = new Set([
  "span",
  "font",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ins",
  "s",
  "strike",
  "del",
  "sup",
  "sub",
  "mark",
  "small",
  "big",
  "abbr",
  "cite",
  "q",
  "time",
  "var",
  "kbd",
  "samp",
  "tt",
]);

const BLOCK_TAGS = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "dd",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
]);

const KEEP_ATTRIBUTES = new Set([
  "style",
  "href",
  "src",
  "alt",
  "title",
  "colspan",
  "rowspan",
]);

const EMPTY_STYLE = Object.freeze({
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  sup: false,
  sub: false,
  color: "",
  background: "",
});

function isBoldWeight(value) {
  if (!value) return false;
  if (value === "bold" || value === "bolder") return true;
  if (value === "normal" || value === "lighter") return false;
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric >= 600 : false;
}

function cleanColor(value) {
  if (!value) return "";
  const colour = value.trim().toLowerCase();
  if (!colour || colour === "transparent" || colour === "inherit" || colour === "initial") {
    return "";
  }
  if (/^rgba\([^)]*,\s*0(?:\.0+)?\s*\)$/.test(colour)) return "";
  return colour;
}

function isNearWhite(value) {
  return (
    value === "#fff" ||
    value === "#ffffff" ||
    value === "white" ||
    value === "rgb(255, 255, 255)" ||
    value === "rgb(255,255,255)" ||
    value === "rgba(255, 255, 255, 1)" ||
    value === "rgba(255,255,255,1)"
  );
}

function isDefaultBlack(value) {
  return value === "#000" || value === "#000000" || value === "black" || value === "rgb(0, 0, 0)";
}

function styleFromElement(element) {
  const tag = element.tagName.toLowerCase();
  const style = element.style || {};
  const next = {};

  if (tag === "b" || tag === "strong") next.bold = true;
  if (tag === "i" || tag === "em") next.italic = true;
  if (tag === "u" || tag === "ins") next.underline = true;
  if (tag === "s" || tag === "strike" || tag === "del") next.strike = true;
  if (tag === "sup") next.sup = true;
  if (tag === "sub") next.sub = true;
  if (tag === "mark") next.background = cleanColor(style.backgroundColor) || "rgb(255, 255, 0)";

  // Inline CSS wins over the tag name, which matters for Google Docs'
  // <b style="font-weight:normal"> document wrapper.
  if (style.fontWeight) next.bold = isBoldWeight(style.fontWeight);
  if (style.fontStyle) next.italic = /italic|oblique/i.test(style.fontStyle);

  const decoration = `${style.textDecorationLine || ""} ${style.textDecoration || ""}`;
  if (style.textDecorationLine === "none" || style.textDecoration === "none") {
    next.underline = false;
    next.strike = false;
  } else {
    if (/underline/i.test(decoration)) next.underline = true;
    if (/line-through/i.test(decoration)) next.strike = true;
  }

  if (/super/i.test(style.verticalAlign || "")) {
    next.sup = true;
    next.sub = false;
  } else if (/sub/i.test(style.verticalAlign || "")) {
    next.sub = true;
    next.sup = false;
  }

  const colour = cleanColor(style.color) || cleanColor(element.getAttribute("color"));
  if (colour) next.color = colour;

  const background = cleanColor(style.backgroundColor);
  if (background && !isNearWhite(background)) next.background = background;

  return next;
}

function mergeStyle(state, changes) {
  return { ...state, ...changes };
}

function styleDiff(next, emitted) {
  const diff = {};
  if (next.bold && !emitted.bold) diff.bold = true;
  if (next.italic && !emitted.italic) diff.italic = true;
  if (next.underline && !emitted.underline) diff.underline = true;
  if (next.strike && !emitted.strike) diff.strike = true;
  if (next.sup && !emitted.sup) diff.sup = true;
  if (next.sub && !emitted.sub) diff.sub = true;
  if (next.color && next.color !== emitted.color) {
    // Black text on a blank page is the default, so avoid noisy wrappers.
    if (!(isDefaultBlack(next.color) && !emitted.color)) diff.color = next.color;
  }
  if (next.background && next.background !== emitted.background) {
    diff.background = next.background;
  }
  return diff;
}

function hasBlockChild(element) {
  return Array.from(element.children).some((child) =>
    BLOCK_TAGS.has(child.tagName.toLowerCase())
  );
}

function makeWrapper(diff) {
  const wrappers = [];
  const css = [];
  if (diff.background) css.push(`background-color:${diff.background}`);
  if (diff.color) css.push(`color:${diff.color}`);
  if (css.length) {
    const span = document.createElement("span");
    span.setAttribute("style", css.join(";"));
    wrappers.push(span);
  }
  if (diff.bold) wrappers.push(document.createElement("strong"));
  if (diff.italic) wrappers.push(document.createElement("em"));
  if (diff.underline) wrappers.push(document.createElement("u"));
  if (diff.strike) wrappers.push(document.createElement("s"));
  if (diff.sup) wrappers.push(document.createElement("sup"));
  if (diff.sub) wrappers.push(document.createElement("sub"));
  return wrappers;
}

function wrapChildren(element, diff) {
  const wrappers = makeWrapper(diff);
  if (wrappers.length === 0) return;

  const inner = wrappers[wrappers.length - 1];
  while (element.firstChild) inner.appendChild(element.firstChild);

  for (let index = wrappers.length - 2; index >= 0; index -= 1) {
    wrappers[index].appendChild(wrappers[index + 1]);
  }
  element.appendChild(wrappers[0]);
}

function normaliseTree(root) {
  const body = root.body || root;

  function visit(element, state, emitted) {
    if (element.nodeType !== 1) return;

    const tag = element.tagName.toLowerCase();
    if (tag === "script" || tag === "style" || tag === "textarea") {
      element.remove();
      return;
    }
    if (tag === "code" || tag === "pre" || tag === "img" || tag === "br" || tag === "hr") {
      return;
    }

    const next = mergeStyle(state, styleFromElement(element));
    const canWrapHere = !hasBlockChild(element);
    const diff = canWrapHere ? styleDiff(next, emitted) : {};
    const childEmitted = canWrapHere ? next : emitted;

    const children = Array.from(element.childNodes);
    for (const child of children) {
      if (child.nodeType === 1) visit(child, next, childEmitted);
    }

    if (canWrapHere) wrapChildren(element, diff);

    if (INLINE_UNWRAP.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
    }
  }

  visit(body, EMPTY_STYLE, EMPTY_STYLE);
}

function sameWrapper(a, b) {
  if (a.nodeType !== 1 || b.nodeType !== 1) return false;
  if (a.tagName !== b.tagName) return false;
  if (a.tagName === "SPAN") {
    return (a.getAttribute("style") || "") === (b.getAttribute("style") || "");
  }
  return true;
}

function mergeAdjacentWrappers(root) {
  const tags = ["strong", "em", "u", "s", "sup", "sub", "span"];
  let changed = true;

  while (changed) {
    changed = false;
    for (const tag of tags) {
      for (const node of Array.from(root.querySelectorAll(tag))) {
        if (!node.isConnected) continue;
        let sibling = node.nextSibling;

        // Skip a whitespace-only text node so <strong>a</strong> <strong>b</strong>
        // becomes one run instead of two broken bold markers.
        if (sibling && sibling.nodeType === 3 && !sibling.nodeValue.trim()) {
          sibling = sibling.nextSibling;
        }
        if (sibling && sameWrapper(node, sibling)) {
          while (sibling.firstChild) node.appendChild(sibling.firstChild);
          sibling.remove();
          changed = true;
        }
      }
    }
  }

  // Remove duplicate nested wrappers such as <strong><strong>text</strong></strong>.
  for (const tag of ["strong", "em", "u", "s", "span"]) {
    for (const node of Array.from(root.querySelectorAll(tag))) {
      const parent = node.parentElement;
      if (!parent || parent.tagName.toLowerCase() !== tag) continue;
      if (tag === "span" && (parent.getAttribute("style") || "") !== (node.getAttribute("style") || "")) {
        continue;
      }
      node.replaceWith(...Array.from(node.childNodes));
    }
  }

  // Empty formatting wrappers add noise to the Markdown.
  for (const node of Array.from(root.querySelectorAll("strong,em,u,s,sup,sub,span"))) {
    if (!node.textContent.trim() && !node.querySelector("img,br")) node.remove();
  }
}

function prepareLists(root) {
  // Word puts its list bullet inside the <li> as a Symbol-font span. Remove
  // that glyph so the Markdown list marker is the only bullet left.
  for (const item of Array.from(root.querySelectorAll("li"))) {
    const walker = root.ownerDocument.createTreeWalker(item, 4);
    let textNode = walker.nextNode();
    while (textNode) {
      const cleaned = textNode.nodeValue.replace(/^[\s\u00a0]*[·•▪◦‣]\s*/u, "");
      if (!cleaned.trim()) {
        textNode.nodeValue = "";
        textNode = walker.nextNode();
        continue;
      }
      textNode.nodeValue = cleaned.replace(/^[\s\u00a0]+/, "");
      break;
    }
  }
}

function prepareTables(root) {
  const document = root.ownerDocument;

  for (const table of Array.from(root.querySelectorAll("table"))) {
    table.querySelectorAll("caption,colgroup,col").forEach((node) => node.remove());

    const firstRow = table.rows[0];
    if (firstRow) {
      const cells = Array.from(firstRow.cells || []);
      if (cells.length && cells.some((cell) => cell.tagName.toLowerCase() !== "th")) {
        for (const cell of cells) {
          if (cell.tagName.toLowerCase() === "th") continue;
          const th = document.createElement("th");
          for (const attribute of Array.from(cell.attributes)) {
            th.setAttribute(attribute.name, attribute.value);
          }
          while (cell.firstChild) th.appendChild(cell.firstChild);
          cell.replaceWith(th);
        }
      }
      const rowParent = firstRow.parentElement;
      if (rowParent && rowParent.tagName.toLowerCase() !== "thead") {
        const thead = document.createElement("thead");
        if (rowParent.tagName.toLowerCase() === "tbody") {
          table.insertBefore(thead, rowParent);
        } else {
          rowParent.insertBefore(thead, firstRow);
        }
        thead.appendChild(firstRow);
      }
    }

    // GFM tables must stay on one line per row.
    for (const cell of Array.from(table.querySelectorAll("th,td"))) {
      for (const block of Array.from(cell.querySelectorAll("p,div"))) {
        const fragment = document.createDocumentFragment();
        while (block.firstChild) fragment.appendChild(block.firstChild);
        fragment.appendChild(document.createTextNode(" "));
        block.replaceWith(fragment);
      }
      for (const br of Array.from(cell.querySelectorAll("br"))) {
        br.replaceWith(document.createTextNode(" "));
      }
    }
  }
}

function cleanDocument(root) {
  root
    .querySelectorAll("script,style,meta,link,title,base,noscript,iframe,object,embed,svg")
    .forEach((node) => node.remove());

  for (const element of Array.from(root.querySelectorAll("*"))) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || !KEEP_ATTRIBUTES.has(name)) {
        element.removeAttribute(attribute.name);
      }
    }
  }
}

function createTurndown() {
  const turndown = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
  });

  turndown.use(gfm);

  turndown.addRule("underline", {
    filter: ["u", "ins"],
    replacement: (content) => (content.trim() ? `<u>${content}</u>` : content),
  });

  turndown.addRule("superscript", {
    filter: ["sup"],
    replacement: (content) => (content.trim() ? `<sup>${content}</sup>` : content),
  });

  turndown.addRule("subscript", {
    filter: ["sub"],
    replacement: (content) => (content.trim() ? `<sub>${content}</sub>` : content),
  });

  turndown.addRule("strikethrough", {
    filter: ["s", "strike", "del"],
    replacement: (content) => (content.trim() ? `~~${content}~~` : content),
  });

  turndown.addRule("styledSpan", {
    filter: (node) => node.nodeName === "SPAN" && Boolean(node.getAttribute("style")),
    replacement: (content, node) => {
      if (!content.trim()) return content;
      const style = (node.getAttribute("style") || "")
        .replace(/\s+/g, " ")
        .replace(/\s*;\s*/g, ";")
        .replace(/;+$/, "")
        .trim();
      if (!style) return content;
      return `<span style="${style}">${content}</span>`;
    },
  });

  return turndown;
}

/**
 * @param {string} html Clipboard HTML.
 * @returns {string} Markdown with the pasted visual formatting preserved.
 */
export function htmlToMarkdown(html) {
  if (!html || !html.trim()) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  if (!body) return "";

  cleanDocument(body);
  prepareLists(body);
  prepareTables(body);
  normaliseTree(doc);
  mergeAdjacentWrappers(doc.body);

  const turndown = createTurndown();
  let markdown = turndown.turndown(doc.body);

  markdown = markdown
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return markdown;
}
