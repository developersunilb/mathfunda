/* ==========================================================================
   MathsFunda interactive widgets — opt-in mode for the reader
   iPad-first touch widgets. Enabled per-visit via the "Interactive" button.
   ========================================================================== */

import "../css/interactive.css";

const STORAGE_KEY = "mathfunda-interactive-mode";
const MARKER_SELECTOR = "[data-mf-widget]";

let enabled = false;

function isEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setEnabled(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* storage blocked */
  }
  enabled = value;
}

/* ------------------------------------------------------------------ Reveal */

function mountReveal(el) {
  if (el.dataset.mfMounted) return;
  el.classList.add("mf-widget");
  const btn = el.querySelector(".mf-reveal-btn");
  const answer = el.querySelector(".mf-reveal-answer");
  if (!btn || !answer) return;

  answer.style.display = "none";

  btn.addEventListener("click", () => {
    const shown = answer.style.display === "block";
    answer.style.display = shown ? "none" : "block";
    btn.textContent = shown ? "Show solution" : "Hide solution";
  });

  el.dataset.mfMounted = "1";
}

/* ------------------------------------------------------------------ Balance (drag-drop equation) */

function mountBalance(el) {
  if (el.dataset.mfMounted) return;
  el.classList.add("mf-widget");

  if (!el.dataset.mfOriginalHtml) {
    el.dataset.mfOriginalHtml = el.innerHTML;
  }

  const target = el.dataset.mfTarget || el.dataset.target || "";
  const choicesCsv = el.dataset.mfChoices || el.dataset.choices || "";
  const label = el.dataset.mfLabel || el.textContent.trim() || "Balance the equation";

  el.innerHTML = "";

  const title = document.createElement("div");
  title.className = "mf-dd-equation";
  title.textContent = label;

  const drop = document.createElement("div");
  drop.className = "mf-dd-dropzone";
  drop.dataset.mfDrop = "1";

  const choices = document.createElement("div");
  choices.className = "mf-dd-choices";

  const feedback = document.createElement("div");
  feedback.className = "mf-dd-feedback";

  const choiceList = choicesCsv.split(",").map((c) => c.trim()).filter(Boolean);

  choiceList.forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mf-dd-choice";
    btn.textContent = choice;
    btn.draggable = true;
    btn.dataset.mfValue = choice;

    let placed = false;

    const clear = () => {
      drop.classList.remove("mf-filled");
      drop.textContent = "";
      placed = false;
      btn.disabled = false;
      feedback.textContent = "";
    };

    const tryPlace = () => {
      if (placed) return;
      drop.textContent = choice;
      drop.classList.add("mf-filled");
      placed = true;
      btn.disabled = true;
      if (choice === target) {
        feedback.textContent = "Balanced — well done!";
        feedback.className = "mf-dd-feedback mf-correct";
      } else {
        feedback.textContent = "Not quite — try another term.";
        feedback.className = "mf-dd-feedback mf-wrong";
        setTimeout(clear, 1200);
      }
    };

    btn.addEventListener("dragstart", (ev) => {
      ev.dataTransfer.setData("text/plain", choice);
      btn.classList.add("is-dragging");
    });
    btn.addEventListener("dragend", () => btn.classList.remove("is-dragging"));

    drop.addEventListener("dragover", (ev) => ev.preventDefault());
    drop.addEventListener("drop", (ev) => {
      ev.preventDefault();
      const val = ev.dataTransfer.getData("text/plain");
      if (val) {
        drop.textContent = val;
        placed = true;
        Array.from(choices.children).forEach((b) => {
          if (b.dataset.mfValue === val) b.disabled = true;
        });
        if (val === target) {
          feedback.textContent = "Balanced — well done!";
          feedback.className = "mf-dd-feedback mf-correct";
        } else {
          feedback.textContent = "Not quite — try again.";
          feedback.className = "mf-dd-feedback mf-wrong";
          setTimeout(() => {
            drop.textContent = "";
            drop.classList.remove("mf-filled");
            placed = false;
            Array.from(choices.children).forEach((b) => (b.disabled = false));
          }, 1000);
        }
      }
    });

    btn.addEventListener("click", tryPlace);
    choices.appendChild(btn);
  });

  el.append(title, drop, choices, feedback);
}

/* ------------------------------------------------------------------ Slider */

function mountSlider(el) {
  if (el.dataset.mfMounted) return;
  el.classList.add("mf-widget");

  if (!el.dataset.mfOriginalHtml) {
    el.dataset.mfOriginalHtml = el.innerHTML;
  }

  const min = Number(el.dataset.mfMin || el.dataset.min || 1);
  const max = Number(el.dataset.mfMax || el.dataset.max || 10);
  const target = Number(el.dataset.mfTarget || el.dataset.target || 5);
  const unit = el.dataset.mfUnit || el.dataset.unit || "";
  const hint = el.dataset.mfHint || el.dataset.hint || "";
  const label = el.dataset.mfLabel || el.textContent.trim() || "Adjust the value";

  const title = document.createElement("div");
  title.textContent = label;
  title.style.fontWeight = "700";
  title.style.marginBottom = "0.25rem";

  const input = document.createElement("input");
  input.type = "range";
  input.min = min;
  input.max = max;
  input.value = min;

  const valueBox = document.createElement("div");
  valueBox.className = "mf-slider-value";
  valueBox.textContent = `${min}${unit}`;

  const targetBox = document.createElement("div");
  targetBox.className = "mf-slider-target";
  targetBox.textContent = `Target: ${target}${unit}`;

  const result = document.createElement("div");
  result.className = "mf-slider-result";
  result.textContent = "Slide to the target above";

  const hintEl = hint ? (() => {
    const h = document.createElement("div");
    h.className = "mf-slider-hint";
    h.textContent = hint;
    return h;
  })() : null;

  const row = document.createElement("div");
  row.className = "mf-slider-row";
  row.append(input, valueBox, targetBox);

  const update = () => {
    const v = Number(input.value);
    valueBox.textContent = `${v}${unit}`;
    if (v === target) {
      input.classList.add("mf-on-target");
      result.textContent = `Correct — ${v}${unit}  🎉`;
    } else {
      input.classList.remove("mf-on-target");
      result.textContent = "Keep sliding…";
    }
  };

  input.addEventListener("input", update);
  update();

  el.append(title, row, result);
  if (hintEl) el.append(hintEl);
}

/* ------------------------------------------------------------------ Circle to Rectangle canvas */

function mountCircleRect(el) {
  if (el.dataset.mfMounted) return;
  el.classList.add("mf-widget");

  if (!el.dataset.mfOriginalHtml) {
    el.dataset.mfOriginalHtml = el.innerHTML;
  }

  const minSlices = Number(el.dataset.mfMinSlices || el.dataset.minSlices || 4);
  const maxSlices = Number(el.dataset.mfMaxSlices || el.dataset.maxSlices || 60);
  const startSlices = Number(el.dataset.mfStartSlices || el.dataset.startSlices || 8);
  const unit = el.dataset.mfUnit || el.dataset.unit || "cm";

  el.innerHTML = "";

  const intro = document.createElement("div");
  intro.className = "mf-canvas-intro";
  intro.innerHTML = `
    <p style="margin:0 0 0.5rem 0; font-size: 0.95rem; color: var(--muted);">
      Slice the circle into wedges and unroll them into a rectangle. As slices get thinner,
      the curved edges straighten. Base = half circumference ($\pi r$), height = radius ($r$).
    </p>
  `;
  el.appendChild(intro);

  const canvasWrap = document.createElement("div");
  canvasWrap.className = "mf-canvas-wrap";

  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 320;
  canvasWrap.appendChild(canvas);
  el.appendChild(canvasWrap);

  const controls = document.createElement("div");
  controls.className = "mf-canvas-controls";

  const slicesGroup = document.createElement("div");
  slicesGroup.className = "mf-control-group";
  const slicesLabel = document.createElement("label");
  slicesLabel.htmlFor = "mf-slices";
  slicesLabel.textContent = "Number of slices:";
  const slicesInput = document.createElement("input");
  slicesInput.type = "range";
  slicesInput.id = "mf-slices";
  slicesInput.min = minSlices;
  slicesInput.max = maxSlices;
  slicesInput.step = 2;
  slicesInput.value = startSlices;
  const slicesVal = document.createElement("span");
  slicesVal.className = "mf-value";
  slicesVal.textContent = startSlices;
  slicesGroup.append(slicesLabel, slicesInput, slicesVal);

  const morphGroup = document.createElement("div");
  morphGroup.className = "mf-control-group";
  const morphLabel = document.createElement("label");
  morphLabel.htmlFor = "mf-morph";
  morphLabel.textContent = "Unroll to rectangle:";
  const morphInput = document.createElement("input");
  morphInput.type = "range";
  morphInput.id = "mf-morph";
  morphInput.min = 0;
  morphInput.max = 100;
  morphInput.value = 0;
  const morphVal = document.createElement("span");
  morphVal.className = "mf-value";
  morphVal.textContent = "0%";
  morphGroup.append(morphLabel, morphInput, morphVal);

  controls.append(slicesGroup, morphGroup);
  el.appendChild(controls);

  const ctx = canvas.getContext("2d");
  const radius = 90;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function draw() {
    const n = parseInt(slicesInput.value, 10);
    const t = parseInt(morphInput.value, 10) / 100;

    slicesVal.textContent = n;
    morphVal.textContent = `${Math.round(t * 100)}%`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dTheta = (2 * Math.PI) / n;
    const stepX = 2 * radius * Math.sin(dTheta / 2);
    const totalWidth = (n / 2) * stepX;
    const startX = centerX - totalWidth / 2;

    for (let i = 0; i < n; i++) {
      const isTopRow = i % 2 === 0;
      const pairIndex = Math.floor(i / 2);

      const circleAngle = i * dTheta;
      const rectAngle = isTopRow ? Math.PI / 2 : -Math.PI / 2;
      const rectX = startX + pairIndex * stepX + (isTopRow ? stepX / 2 : stepX);
      const rectY = isTopRow ? centerY - radius / 2 : centerY + radius / 2;

      const currentX = lerp(centerX, rectX, t);
      const currentY = lerp(centerY, rectY, t);

      let angleDiff = rectAngle - circleAngle;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      const currentAngle = circleAngle + angleDiff * t;

      ctx.save();
      ctx.translate(currentX, currentY);
      ctx.rotate(currentAngle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, -dTheta / 2, dTheta / 2);
      ctx.closePath();

      ctx.fillStyle = isTopRow ? "#176b54" : "#a9661b";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = n > 30 ? 0.5 : 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, radius, -dTheta / 2, dTheta / 2);
      ctx.strokeStyle = "#1d2420";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();
    }

    if (t > 0.85) {
      ctx.save();
      ctx.globalAlpha = (t - 0.85) / 0.15;
      ctx.fillStyle = "#1d2420";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Base = ½ Circumference = πr", centerX, centerY + radius / 2 + 26);
      ctx.textAlign = "left";
      ctx.fillText("Height = r", startX + totalWidth + 15, centerY + 6);
      ctx.restore();
    }
  }

  slicesInput.addEventListener("input", draw);
  morphInput.addEventListener("input", draw);

  draw();

  el.dataset.mfMounted = "1";
}

/* ------------------------------------------------------------------ Mount all markers in a page */

function mountWidgetsIn(root) {
  const markers = root.querySelectorAll(MARKER_SELECTOR);
  markers.forEach((el) => {
    if (el.dataset.mfMounted) return;
    const type = el.dataset.mfType || el.dataset.type;
    if (type === "reveal") mountReveal(el);
    else if (type === "balance") mountBalance(el);
    else if (type === "slider") mountSlider(el);
    else if (type === "circle-rect") mountCircleRect(el);
    el.dataset.mfMounted = "1";
  });
}

function mountWidgetsInAllPages() {
  document.querySelectorAll(".reader-page-body").forEach(mountWidgetsIn);
}

/* ------------------------------------------------------------------ Overflow / page-shift */

const FOOTER_ROOM = 150;

function pageOverflows(body) {
  return body.scrollHeight > body.clientHeight - FOOTER_ROOM;
}

function widgetWrappersOn(body) {
  return Array.from(body.querySelectorAll(MARKER_SELECTOR));
}

function shiftOverflowingWidgets() {
  const api = window.__mfReaderAPI;
  if (!api) return false;

  const pages = document.querySelectorAll(".reader-page-body");
  let moved = false;

  for (let i = 0; i < pages.length - 1; i++) {
    const body = pages[i];
    if (!pageOverflows(body)) continue;

    const widgets = widgetWrappersOn(body);
    if (widgets.length === 0) continue;

    // Move the last widget on this overflowing page to the next page.
    const last = widgets[widgets.length - 1];
    const nextBody = pages[i + 1];
    nextBody.insertBefore(last, nextBody.firstChild);
    moved = true;
  }

  if (moved) {
    // Re-mount widgets (some moved pages) and re-paginate to settle heights.
    mountWidgetsInAllPages();
    api.buildPages();
    mountWidgetsInAllPages();
    api.renderPage(false);
    return true;
  }
  return false;
}

function fixOverflow(maxPasses = 6) {
  let passes = 0;
  while (shiftOverflowingWidgets() && passes < maxPasses) {
    passes += 1;
  }
}

function fixOverflowDeferred() {
  // Give the browser time to lay out newly mounted widgets, then check.
  // Retry a few times in case layout happens across multiple frames
  // (canvas sizing, control wrapping, zoom changes, etc.).
  let attempts = 0;
  const tryFix = () => {
    const moved = fixOverflow();
    attempts += 1;
    if (moved && attempts < 8) {
      setTimeout(tryFix, 120);
    }
  };
  setTimeout(tryFix, 120);
}

/* ------------------------------------------------------------------ Toggle UI */

function initToggle() {
  const btn = document.getElementById("reader-interactive-toggle");
  if (!btn) return;

  enabled = isEnabled();
  btn.setAttribute("aria-pressed", String(enabled));
  if (enabled) btn.classList.add("is-done");

  btn.addEventListener("click", () => {
    enabled = !enabled;
    setEnabled(enabled);
    btn.setAttribute("aria-pressed", String(enabled));
    btn.classList.toggle("is-done", enabled);

    if (enabled) {
      mountWidgetsInAllPages();
      fixOverflowDeferred();
    } else {
      unmountWidgetsInAllPages();
    }
  });
}

/* ------------------------------------------------------------------ Hook into page render */

let originalRenderPage;
function patchRenderPage() {
  const readerExports = window.__mfReaderAPI;
  if (!readerExports || !readerExports.renderPage) return;
  originalRenderPage = readerExports.renderPage;
  readerExports.renderPage = function (animate, direction) {
    originalRenderPage.call(this, animate, direction);
    if (enabled) {
      mountWidgetsInAllPages();
      fixOverflowDeferred();
    } else {
      unmountWidgetsInAllPages();
    }
  };
}

/* ------------------------------------------------------------------ Boot */

function boot() {
  initToggle();

  window.__mfInteractive = {
    mountWidgetsInAllPages,
    unmountWidgetsInAllPages,
    isEnabled: () => enabled,
    fixOverflow,
  };

  const observer = new MutationObserver((mutations) => {
    let mounted = false;
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && node.querySelectorAll) {
          mountWidgetsIn(node);
          mounted = true;
        }
      }
    }
    if (mounted) fixOverflowDeferred();
  });
  const shell = document.getElementById("reader-page-shell");
  if (shell) observer.observe(shell, { childList: true, subtree: true });

  mountWidgetsInAllPages();
  fixOverflowDeferred();
}

/* --------------------------------------------------------------- Exports for block renderer */

export { mountReveal, mountBalance, mountSlider, mountCircleRect, mountWidgetsIn };

boot();
