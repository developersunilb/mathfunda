import "katex/dist/katex.min.css";
import "../css/site.css";
import renderMathInElement from "katex/dist/contrib/auto-render.mjs";

document.addEventListener("DOMContentLoaded", () => {
  renderMathInElement(document.body, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
      { left: "$", right: "$", display: false },
    ],
    throwOnError: false,
  });
});
