/**
 * Parent dashboard for MathsFunda.
 *
 * Reads persisted diagnostic results from localStorage and displays a
 * parent-friendly summary. Access is gated by a configurable hardcoded
 * password (change PARENT_PASSWORD below, then rebuild/redeploy).
 *
 * This is a browser-side convenience gate, not real security. Keep your
 * repository private if you do not want others to see this page.
 */

const PARENT_PASSWORD = "mathfunda-parent"; // <-- change this to your own password
const PARENT_KEY = "mathfunda-parent-unlocked";
const DIAGNOSTIC_RESULTS_KEY = "mathfunda-diagnostic-results";

const gate = document.querySelector("#parent-gate");
const dashboard = document.querySelector("#parent-dashboard");
const passwordInput = document.querySelector("#parent-password");
const gateError = document.querySelector("#parent-gate-error");
const unlockButton = document.querySelector("#parent-unlock");
const backButton = document.querySelector("#parent-back");
const lockButton = document.querySelector("#parent-lock");

function isUnlocked() {
  try {
    return localStorage.getItem(PARENT_KEY) === "1";
  } catch {
    return false;
  }
}

function setUnlocked() {
  try {
    localStorage.setItem(PARENT_KEY, "1");
  } catch {
    /* storage blocked */
  }
}

function clearUnlocked() {
  try {
    localStorage.removeItem(PARENT_KEY);
  } catch {
    /* storage blocked */
  }
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function unlock() {
  const input = passwordInput.value.trim();

  // Input validation: reject empty or excessively long passwords
  if (!input) {
    gateError.textContent = "Please enter a password.";
    gateError.hidden = false;
    passwordInput.focus();
    return;
  }
  if (input.length > 100) {
    gateError.textContent = "Password is too long.";
    gateError.hidden = false;
    passwordInput.focus();
    return;
  }

  if (input === PARENT_PASSWORD) {
    setUnlocked();
    gate.hidden = true;
    dashboard.hidden = false;
    renderDashboard();
    passwordInput.value = "";
    gateError.hidden = true;
  } else {
    gateError.textContent = "Incorrect password.";
    gateError.hidden = false;
    passwordInput.value = "";
    passwordInput.focus();
  }
}

function lock() {
  clearUnlocked();
  dashboard.hidden = true;
  gate.hidden = false;
  showToast("Dashboard locked.");
}

unlockButton.addEventListener("click", unlock);
passwordInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") unlock();
});
backButton.addEventListener("click", () => {
  location.href = "./index.html";
});
lockButton.addEventListener("click", lock);

/* ---------------------------------------------------------------- Dashboard */

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function readResults() {
  try {
    const stored = localStorage.getItem(DIAGNOSTIC_RESULTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* corrupt or unavailable storage */
  }
  return null;
}

function classifyError(entry) {
  if (entry.skipped) return "Skipped";
  if (entry.studentAnswer === entry.correctAnswer) return "Correct";
  const sa = String(entry.studentAnswer).trim().toLowerCase();
  const ca = String(entry.correctAnswer).trim().toLowerCase();
  // Normalise common formatting differences
  const normalise = (s) => s.replace(/\s/g, "").replace(/%$/, "").replace(/°/, "");
  if (normalise(sa) === normalise(ca)) return "Formatting difference";
  return "Conceptual / calculation";
}

function renderDashboard() {
  const results = readResults();

  const summaryEl = document.querySelector("#parent-diagnostic-summary");
  const rowsEl = document.querySelector("#parent-diagnostic-rows");
  const strengthsEl = document.querySelector("#parent-strengths");
  const weaknessesEl = document.querySelector("#parent-weaknesses");
  const statsEl = document.querySelector("#parent-stats");

  if (!results || results.length === 0) {
    summaryEl.innerHTML = `<p class="quiz-answer-hint">No diagnostic results found yet. Ask your child to take the 20-question diagnostic first.</p>`;
    rowsEl.innerHTML = "";
    strengthsEl.innerHTML = `<li class="quiz-answer-hint">No data yet.</li>`;
    weaknessesEl.innerHTML = `<li class="quiz-answer-hint">No data yet.</li>`;
    statsEl.innerHTML = "";
    return;
  }

  const answered = results.filter((r) => !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const correct = results.filter((r) => !r.skipped && r.studentAnswer === r.correctAnswer).length;
  const totalTime = results.reduce((sum, r) => sum + r.timeSeconds, 0);

  statsEl.innerHTML = `
    <p><strong>Questions answered:</strong> ${answered} / ${results.length}</p>
    <p><strong>Correct:</strong> ${correct}</p>
    <p><strong>Skipped:</strong> ${skipped}</p>
    <p><strong>Total time:</strong> ${formatTime(totalTime)}</p>
    <p><strong>Accuracy:</strong> ${answered ? Math.round((correct / answered) * 100) : 0}%</p>
  `;

  // Build table rows
  rowsEl.innerHTML = results
    .map((r) => {
      const status = r.skipped ? "Skipped" : r.studentAnswer === r.correctAnswer ? "Correct" : "Incorrect";
      const errorType = classifyError(r);
      return `
        <tr>
          <td>${r.question}</td>
          <td>${r.topic}</td>
          <td>${r.skill}</td>
          <td>${formatTime(r.timeSeconds)}</td>
          <td>${status}</td>
          <td>${r.studentAnswer ?? "—"}</td>
          <td>${r.correctAnswer}</td>
          <td>${errorType}</td>
        </tr>
      `;
    })
    .join("");

  // Strengths: topics where most answers were correct
  const byTopic = {};
  for (const r of results) {
    if (!byTopic[r.topic]) byTopic[r.topic] = { total: 0, correct: 0 };
    byTopic[r.topic].total += 1;
    if (!r.skipped && r.studentAnswer === r.correctAnswer) byTopic[r.topic].correct += 1;
  }

  const topicScores = Object.entries(byTopic)
    .map(([topic, data]) => ({ topic, pct: data.total ? Math.round((data.correct / data.total) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct);

  strengthsEl.innerHTML = topicScores
    .slice(0, 3)
    .map((t) => `<li><strong>${t.topic}</strong> — ${t.pct}% correct</li>`)
    .join("") || "<li class='quiz-answer-hint'>No data yet.</li>";

  weaknessesEl.innerHTML = topicScores
    .slice(-3)
    .reverse()
    .map((t) => `<li><strong>${t.topic}</strong> — ${t.pct}% correct</li>`)
    .join("") || "<li class='quiz-answer-hint'>No data yet.</li>";
}

/* ------------------------------------------------------------- Save / clear */

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function saveResultsJSON() {
  const results = readResults();
  if (!results || results.length === 0) {
    showToast("No results to save.");
    return;
  }
  const dateStamp = new Date().toISOString().replace(/[:.-]/g, "").slice(0, 13);
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
  downloadBlob(blob, `mathfunda-diagnostic-results-${dateStamp}.json`);
  showToast("Results saved as JSON.");
}

function saveResultsPDF() {
  const results = readResults();
  if (!results || results.length === 0) {
    showToast("No results to save.");
    return;
  }

  const dateStamp = new Date().toISOString().replace(/[:.-]/g, "").slice(0, 13);
  const rows = results
    .map((r) => {
      const status = r.skipped ? "Skipped" : r.studentAnswer === r.correctAnswer ? "Correct" : "Incorrect";
      const errorType = classifyError(r);
      return `<tr>
        <td>${r.question}</td>
        <td>${r.topic}</td>
        <td>${r.skill}</td>
        <td>${formatTime(r.timeSeconds)}</td>
        <td>${status}</td>
        <td>${r.studentAnswer ?? "—"}</td>
        <td>${r.correctAnswer}</td>
        <td>${errorType}</td>
      </tr>`;
    })
    .join("");

  const answered = results.filter((r) => !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const correct = results.filter((r) => !r.skipped && r.studentAnswer === r.correctAnswer).length;
  const totalTime = results.reduce((sum, r) => sum + r.timeSeconds, 0);

  const printHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>MathsFunda Diagnostic Results</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1d2420; margin: 20px; }
        h1 { font-size: 20px; margin-bottom: 10px; }
        h2 { font-size: 16px; margin-top: 20px; margin-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { border: 1px solid #999; padding: 6px; text-align: left; }
        th { background: #e7f1ec; }
        .stats { margin-bottom: 20px; }
        .stats p { margin: 4px 0; }
        .privacy { font-size: 10px; margin-top: 20px; color: #5f6b64; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>MathsFunda — Diagnostic Results</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <div class="stats">
        <p><strong>Questions answered:</strong> ${answered} / ${results.length}</p>
        <p><strong>Correct:</strong> ${correct}</p>
        <p><strong>Skipped:</strong> ${skipped}</p>
        <p><strong>Total time:</strong> ${formatTime(totalTime)}</p>
        <p><strong>Accuracy:</strong> ${answered ? Math.round((correct / answered) * 100) : 0}%</p>
      </div>
      <h2>Per-question results</h2>
      <table>
        <thead>
          <tr>
            <th>Q</th><th>Topic</th><th>Skill</th><th>Time</th><th>Status</th><th>Your answer</th><th>Correct answer</th><th>Error type</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="privacy">Results stored only in this browser. Nothing uploaded or shared.</p>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.write(printHtml);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

function clearResults() {
  const results = readResults();
  if (!results || results.length === 0) {
    showToast("No results to clear.");
    return;
  }
  if (!window.confirm("Are you sure you want to clear all diagnostic results? This cannot be undone.")) {
    return;
  }
  try {
    localStorage.removeItem("mathfunda-diagnostic-results");
    localStorage.removeItem("mathfunda-diagnostic-live");
  } catch {
    /* storage blocked */
  }
  gate.hidden = false;
  dashboard.hidden = true;
  renderDashboard();
  showToast("All results cleared.");
}

/* ------------------------------------------------------------------- Boot */

if (isUnlocked()) {
  gate.hidden = true;
  dashboard.hidden = false;
  renderDashboard();
} else {
  gate.hidden = false;
  dashboard.hidden = true;
}

document.querySelector("#parent-save-json").addEventListener("click", saveResultsJSON);
document.querySelector("#parent-save-pdf").addEventListener("click", saveResultsPDF);
document.querySelector("#parent-clear-results").addEventListener("click", clearResults);
