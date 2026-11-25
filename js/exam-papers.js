import { renderMarkdown } from "./markdown.js";
import "../css/site.css";

const files = import.meta.glob("../chapters/class-9/{practice-paper-1,practice-paper-2,internal-assessment}.md", { query: "?raw", import: "default", eager: true });

const PAPERS = {
  "practice-paper-1": "Practice Examination Paper 1 (80 marks)",
  "practice-paper-2": "Practice Examination Paper 2 (80 marks)",
  "internal-assessment": "Internal Assessment (20 marks)",
};

const contentEl = document.querySelector("#exam-content");
const tabs = document.querySelectorAll(".exam-tabs button");
const qBtn = document.querySelector("#show-questions");
const sBtn = document.querySelector("#show-solutions");

let current = "practice-paper-1";
let showSolutions = false;

function rawFor(slug) {
  const key = Object.keys(files).find((k) => k.includes(slug + ".md"));
  return key ? String(files[key]) : "";
}

function extractSection(md, name) {
  const regex = new RegExp("## " + name + "([\\s\\S]*?)(?=\\n## |$)", "i");
  const m = md.match(regex);
  return m ? m[1].trim() : "_Section not found._";
}

function render() {
  const md = rawFor(current);
  const section = showSolutions ? "Solutions and Marking Scheme" : "Question Paper";
  const body = extractSection(md, section);
  contentEl.innerHTML = renderMarkdown("# " + PAPERS[current] + "\n\n## " + section + "\n\n" + body);
  qBtn.classList.toggle("is-active", !showSolutions);
  sBtn.classList.toggle("is-active", showSolutions);
}

tabs.forEach((b) => {
  b.addEventListener("click", () => {
    tabs.forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    current = b.dataset.paper;
    showSolutions = false;
    render();
  });
});
qBtn.addEventListener("click", () => { showSolutions = false; render(); });
sBtn.addEventListener("click", () => { showSolutions = true; render(); });

render();
