/**
 * Block renderer — generic, concept-agnostic.
 *
 * Renders lesson-block elements from a teaching strategy's block sequence.
 * Each block type is rendered by a generic template; no concept-specific
 * logic lives here. The Circle → Rectangle interactive widget is reused
 * from interactive-mode.js.
 *
 * Blocks not yet wired (mastery) fall through to a generic content container
 * so the lesson never breaks. Misconception-intervention blocks are not
 * auto-rendered in the lesson flow; they are rendered dynamically via
 * renderMisconceptionIntervention() when a misconception is detected during
 * practice.
 */

import { resolveSequence } from "./lesson-intelligence.js";

/* --------------------------------------------------------------- Block rendering */

/**
 * Render all blocks from a strategy into a container, in declared order.
 * @param {HTMLElement} container
 * @param {Object} strategy
 */
export function renderBlocks(container, strategy) {
  const blocks = resolveSequence(strategy);
  blocks.forEach((block) => renderBlock(container, block));
}

/**
 * Render a single block into a container.
 * @param {HTMLElement} container
 * @param {Object} block
 */
export function renderBlock(container, block) {
  if (!block || typeof block !== "object") {
    return;
  }

  const el = document.createElement("div");
  el.className = `lesson-block lesson-block-${block.type}`;

  if (block.title) {
    const heading = document.createElement("h3");
    heading.className = "lesson-block-title";
    heading.textContent = block.title;
    el.appendChild(heading);
  }

  switch (block.type) {
    case "story":
    case "prediction":
    case "discovery":
    case "worked-example":
    case "guided-practice":
    case "independent-practice":
    case "explain":
    case "memory-hook":
      renderContentBlock(el, block);
      break;
    case "visual":
      renderVisualBlock(el, block);
      break;
    case "interactive":
      renderInteractiveBlock(el, block);
      break;
    case "misconception-intervention":
    case "mastery":
      // Not auto-rendered in lesson flow. Misconception interventions are
      // rendered dynamically via renderMisconceptionIntervention().
      renderContentBlock(el, block);
      break;
    default:
      // Graceful fallback for unknown block types.
      renderContentBlock(el, block);
  }

  container.appendChild(el);
}

/**
 * Render a targeted misconception intervention block.
 *
 * Shows: description (why it's a mistake), targeted explanation (why the
 * incorrect approach is tempting + correct reasoning), and corrective
 * questions as placeholders.
 *
 * @param {HTMLElement} container
 * @param {Object} misconception - Misconception data from strategy
 * @param {string[]} correctiveQuestionIds - Question IDs for corrective practice
 */
export function renderMisconceptionIntervention(container, misconception, correctiveQuestionIds = []) {
  const el = document.createElement("div");
  el.className = "lesson-block lesson-block-misconception-intervention";

  // Title
  const heading = document.createElement("h3");
  heading.className = "lesson-block-title";
  heading.textContent = "Watch out — let's look at this together";
  el.appendChild(heading);

  // Description (what the misconception is)
  if (misconception.description) {
    const desc = document.createElement("div");
    desc.className = "lesson-block-content";
    desc.innerHTML = `<p><strong>What happened:</strong> ${misconception.description}</p>`;
    el.appendChild(desc);
  }

  // Targeted explanation
  if (misconception.targetedExplanation) {
    const expl = document.createElement("div");
    expl.className = "lesson-block-content lesson-block-explanation";
    expl.innerHTML = `<p>${misconception.targetedExplanation}</p>`;
    el.appendChild(expl);
  }

  // Corrective questions
  if (correctiveQuestionIds && correctiveQuestionIds.length > 0) {
    const practice = document.createElement("div");
    practice.className = "lesson-block-content";
    practice.innerHTML = `<p><strong>Try these:</strong></p><ul>${correctiveQuestionIds.map((id) => `<li data-corrective-question="${id}">Practice question: ${id}</li>`).join("")}</ul>`;
    el.appendChild(practice);
  }

  container.appendChild(el);
}

/**
 * Render a Memory Journey element block.
 *
 * Shows: title, content, and optionally an active recall prompt with
 * answer reveal. The child attempts the recall prompt before seeing the
 * recall answer.
 *
 * @param {HTMLElement} container
 * @param {Object} element - Memory journey element from strategy data
 * @param {number} index - Zero-based index of this element
 */
export function renderMemoryJourneyElement(container, element, index) {
  const el = document.createElement("div");
  el.className = `lesson-block lesson-block-memory lesson-block-memory-${element.type}`;
  el.dataset.memoryIndex = String(index);

  // Number badge
  const badge = document.createElement("span");
  badge.className = "memory-badge";
  badge.textContent = String(index + 1);
  el.appendChild(badge);

  // Title
  if (element.title) {
    const heading = document.createElement("h3");
    heading.className = "memory-title";
    heading.textContent = element.title;
    el.appendChild(heading);
  }

  // Content
  if (element.content) {
    const content = document.createElement("div");
    content.className = "lesson-block-content memory-content";
    content.innerHTML = element.content;
    el.appendChild(content);
  }

  // Active recall prompt
  if (element.recallPrompt) {
    const recallWrap = document.createElement("div");
    recallWrap.className = "memory-recall";

    const prompt = document.createElement("p");
    prompt.className = "memory-recall-prompt";
    prompt.textContent = element.recallPrompt;
    recallWrap.appendChild(prompt);

    const answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.className = "memory-recall-input";
    answerInput.placeholder = "Type your answer…";
    recallWrap.appendChild(answerInput);

    const revealBtn = document.createElement("button");
    revealBtn.type = "button";
    revealBtn.className = "memory-recall-reveal";
    revealBtn.textContent = "Reveal answer";
    recallWrap.appendChild(revealBtn);

    const answerDisplay = document.createElement("div");
    answerDisplay.className = "memory-recall-answer";
    answerDisplay.hidden = true;
    if (element.recallAnswer) {
      answerDisplay.innerHTML = `<p><strong>Remember:</strong> ${element.recallAnswer}</p>`;
    }
    recallWrap.appendChild(answerDisplay);

    revealBtn.addEventListener("click", () => {
      answerDisplay.hidden = false;
      revealBtn.hidden = true;
      answerInput.disabled = true;
    });

    el.appendChild(recallWrap);
  }

  container.appendChild(el);
}

/* --------------------------------------------------------------- Block type helpers */

function renderContentBlock(el, block) {
  const content = document.createElement("div");
  content.className = "lesson-block-content";
  content.innerHTML = block.content || "";
  el.appendChild(content);
}

function renderVisualBlock(el, block) {
  const content = document.createElement("div");
  content.className = "lesson-block-content lesson-block-visual";
  content.innerHTML = block.content || "";
  el.appendChild(content);
}

function renderInteractiveBlock(el, block) {
  const intro = document.createElement("div");
  intro.className = "lesson-block-content";
  intro.textContent = block.content || "";
  el.appendChild(intro);

  const marker = document.createElement("div");
  marker.className = "mf-widget-marker";
  marker.dataset.mfWidget = "1";

  const widgetType = block.widgetType || block.dataType || "circle-rect";
  marker.dataset.mfType = widgetType;

  // Pass through any data attributes declared on the block.
  if (block.mfMinSlices !== undefined) marker.dataset.mfMinSlices = String(block.mfMinSlices);
  if (block.mfMaxSlices !== undefined) marker.dataset.mfMaxSlices = String(block.mfMaxSlices);
  if (block.mfStartSlices !== undefined) marker.dataset.mfStartSlices = String(block.mfStartSlices);
  if (block.mfUnit !== undefined) marker.dataset.mfUnit = String(block.mfUnit);
  if (block.mfMin !== undefined) marker.dataset.mfMin = String(block.mfMin);
  if (block.mfMax !== undefined) marker.dataset.mfMax = String(block.mfMax);
  if (block.mfTarget !== undefined) marker.dataset.mfTarget = String(block.mfTarget);
  if (block.mfChoices !== undefined) marker.dataset.mfChoices = String(block.mfChoices);
  if (block.mfLabel !== undefined) marker.dataset.mfLabel = String(block.mfLabel);
  if (block.mfHint !== undefined) marker.dataset.mfHint = String(block.mfHint);

  el.appendChild(marker);

  // Do NOT mount here: the element will be cloned into pages by paginateChapter,
  // and mountWidgetsIn() is called on each page body after pagination to mount
  // widgets on their final DOM nodes.
}
