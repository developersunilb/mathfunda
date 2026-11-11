import { marked } from "marked";
import katex from "katex";
import DOMPurify from "dompurify";

marked.setOptions({ gfm: true, breaks: false });

/**
 * Matches display math ($$...$$ and \[...\]) and inline math ($...$, \(...\)).
 * The single-dollar branch deliberately avoids escaped dollars. A closing $
 * followed by a digit is not treated as a math delimiter, which keeps currency
 * patterns such as "$5 and $10" out of the maths renderer.
 */
const MATH_PATTERN =
  /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|(?<![\\$])\$(?![\s$])(?:\\.|[^$\n])+?(?<![\s\\])\$(?!\d))/g;

function extractMath(match) {
  if (match.startsWith("$$")) {
    return { expression: match.slice(2, -2), display: true };
  }
  if (match.startsWith("\\[")) {
    return { expression: match.slice(2, -2), display: true };
  }
  if (match.startsWith("\\(")) {
    return { expression: match.slice(2, -2), display: false };
  }
  return { expression: match.slice(1, -1), display: false };
}

function protectMath(source) {
  const blocks = [];
  const nonce = Math.random().toString(36).slice(2, 8);

  const protectedSource = source.replace(MATH_PATTERN, (match) => {
    const { expression, display } = extractMath(match);
    const trimmed = expression.trim();

    if (!trimmed) return match;

    let html;
    try {
      html = katex.renderToString(trimmed, {
        displayMode: display,
        throwOnError: false,
        strict: "ignore",
        trust: false,
        errorColor: "#b42318",
      });
    } catch (error) {
      console.warn("KaTeX could not render:", trimmed, error);
      return match;
    }

    const token = `KATEXTOKEN${nonce}${blocks.length}END`;
    blocks.push({ token, html });
    return token;
  });

  return { protectedSource, blocks };
}

/**
 * Convert the Markdown source into sanitised, KaTeX-rendered HTML for the
 * A4 preview. User HTML is sanitised before math is inserted, so KaTeX's
 * trusted MathML output is never altered by DOMPurify.
 */
export function renderMarkdown(source) {
  const { protectedSource, blocks } = protectMath(source);
  const parsed = marked.parse(protectedSource, { async: false });
  let html = DOMPurify.sanitize(parsed, {
    ADD_ATTR: ["style", "align", "colspan", "rowspan"],
    ADD_TAGS: ["mark", "u", "sup", "sub"],
  });

  for (const { token, html: mathHtml } of blocks) {
    html = html.split(token).join(mathHtml);
  }

  return html;
}
