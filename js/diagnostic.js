import katex from "katex";
import JSZip from "jszip";
import "katex/dist/katex.min.css";
import "../css/site.css";

const toast = document.querySelector("#toast");
const introView = document.querySelector(".diagnostic-intro");
const quizView = document.querySelector("#quiz-view");
const finishView = document.querySelector("#finish-view");

const beginButton = document.querySelector("#diagnostic-begin");
const modal = document.querySelector("#diagnostic-modal");
const modalOk = document.querySelector("#modal-ok");
const modalClose = document.querySelectorAll("[data-modal-close]");
const nextButton = document.querySelector("#quiz-next");
const skipButton = document.querySelector("#quiz-skip");
const answerInput = document.querySelector("#quiz-answer");
const worksheetInput = document.querySelector("#quiz-worksheet");
const uploadPreview = document.querySelector("#quiz-upload-preview");
const progressEl = document.querySelector("#quiz-progress");
const questionEl = document.querySelector("#quiz-question");
const feedbackEl = document.querySelector("#quiz-feedback");
const finishTitle = document.querySelector("#finish-title");
const finishCopy = document.querySelector("#finish-copy");
const finishStats = document.querySelector("#finish-stats");
const downloadJsonButton = document.querySelector("#finish-download-json");
const downloadZipButton = document.querySelector("#finish-download-zip");
const shareButton = document.querySelector("#finish-share");
const emailButton = document.querySelector("#finish-email");

const TOTAL = 20;
const LIVE_STORAGE_KEY = "mathfunda-diagnostic-live";

const QUESTIONS = [
  {
    id: 1,
    topic: "Numbers and operations",
    skill: "Division",
    text: "$348 \\div 12$",
    instruction: "Calculate",
    answer: "29",
  },
  {
    id: 2,
    topic: "Numbers and operations",
    skill: "Integer addition and subtraction",
    text: "-8 + 13 - 6",
    instruction: "Simplify",
    answer: "-1",
  },
  {
    id: 3,
    topic: "Numbers and operations",
    skill: "Adding fractions",
    text: "\\frac{2}{3} + \\frac{3}{4}",
    instruction: "Find",
    answer: "17/12",
  },
  {
    id: 4,
    topic: "Numbers and operations",
    skill: "Multiplying decimals",
    text: "3.75 \\times 0.4",
    instruction: "Calculate",
    answer: "1.5",
  },
  {
    id: 5,
    topic: "Numbers and operations",
    skill: "Percentage of a quantity",
    text: "15\\% \\text{ of } 240",
    instruction: "Find",
    answer: "36",
  },
  {
    id: 6,
    topic: "Numbers and operations",
    skill: "Ratio",
    text: "360 \\text{ in the ratio } 2:3",
    instruction: "Divide",
    answer: "144 and 216",
  },
  {
    id: 7,
    topic: "Numbers and operations",
    skill: "Factors and multiples",
    text: "18 \\text{ and } 24",
    instruction: "Find the HCF and the LCM of",
    answer: "HCF = 6, LCM = 72",
  },
  {
    id: 8,
    topic: "Numbers and operations",
    skill: "Laws of exponents",
    text: "2^3 \\times 2^2",
    instruction: "Simplify",
    answer: "32",
  },
  {
    id: 9,
    topic: "Algebra",
    skill: "Like terms",
    text: "3x + 5x - 2x",
    instruction: "Simplify",
    answer: "6x",
  },
  {
    id: 10,
    topic: "Algebra",
    skill: "Linear equation",
    text: "3x + 7 = 22",
    instruction: "Solve",
    answer: "x = 5",
  },
  {
    id: 11,
    topic: "Geometry and measurement",
    skill: "Angle sum of a triangle",
    text: "48^\\circ \\text{ and } 67^\\circ",
    instruction: "Two angles of a triangle are. Find the third angle.",
    answer: "65^\\circ",
  },
  {
    id: 12,
    topic: "Geometry and measurement",
    skill: "Area of a rectangle",
    text: "12.5 \\text{ cm by } 8 \\text{ cm}",
    instruction: "Find the area of a rectangle measuring",
    answer: "100 cm^2",
  },
  {
    id: 13,
    topic: "Mixed skills",
    skill: "Sign rules and order of operations",
    text: "(-3) \\times (-4) + (-2)",
    instruction: "Simplify",
    answer: "10",
  },
  {
    id: 14,
    topic: "Mixed skills",
    skill: "Dividing fractions",
    text: "\\frac{5}{6} \\div \\frac{2}{3}",
    instruction: "Find",
    answer: "5/4",
  },
  {
    id: 15,
    topic: "Mixed skills",
    skill: "Decimal to fraction",
    text: "0.375",
    instruction: "Write as a fraction in its simplest form",
    answer: "3/8",
  },
  {
    id: 16,
    topic: "Mixed skills",
    skill: "Brackets and simplification",
    text: "4(2x - 3) + 5",
    instruction: "Expand and simplify",
    answer: "8x - 7",
  },
  {
    id: 17,
    topic: "Mixed skills",
    skill: "Equation with a fraction",
    text: "\\frac{x}{4} = 9",
    instruction: "Solve",
    answer: "x = 36",
  },
  {
    id: 18,
    topic: "Mixed skills",
    skill: "Rounding and place value",
    text: "4.678",
    instruction: "Round to two decimal places, and state the place value of the digit 7",
    answer: "4.68; hundredths",
  },
  {
    id: 19,
    topic: "Mixed skills",
    skill: "Perimeter",
    text: "12.5 \\text{ cm by } 8 \\text{ cm}",
    instruction: "Find the perimeter of a rectangle measuring",
    answer: "41 cm",
  },
  {
    id: 20,
    topic: "Mixed skills",
    skill: "Coordinates and midpoint",
    text: "(-3, 4)",
    instruction: "In which quadrant does the point lie? Find the midpoint of the segment joining (2, 4) and (8, 10).",
    answer: "Quadrant II; (5, 7)",
  },
];

let currentIndex = 0;
let startTime = 0;
let timerInterval = null;
let currentWorksheet = { dataUrl: null, fileName: null };
const results = [];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function renderMath(text) {
  try {
    const latex = text.replace(/^\$(.+)\$$/s, "$1");
    return katex.renderToString(latex, { throwOnError: false, trust: false });
  } catch {
    return text;
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function startTimer() {
  stopTimer();
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function elapsedSeconds() {
  return Math.floor((Date.now() - startTime) / 1000);
}

function recordResult(skipped, answer, worksheetDataUrl, worksheetFileName) {
  const q = QUESTIONS[currentIndex];
  const entry = {
    question: q.id,
    topic: q.topic,
    skill: q.skill,
    questionText: q.text,
    instruction: q.instruction,
    correctAnswer: q.answer,
    studentAnswer: skipped ? null : answer,
    skipped,
    timeSeconds: elapsedSeconds(),
    answeredAt: new Date().toISOString(),
  };
  if (worksheetDataUrl) {
    entry.worksheetDataUrl = worksheetDataUrl;
    entry.worksheetFileName = worksheetFileName;
  }
  results.push(entry);

  // Live-log results to localStorage as each question is answered.
  try {
    localStorage.setItem(LIVE_STORAGE_KEY, JSON.stringify(results));
  } catch {
    /* storage may be full or blocked */
  }
}

function renderQuestion() {
  stopTimer();
  answerInput.disabled = false;
  answerInput.value = "";
  feedbackEl.hidden = true;
  feedbackEl.textContent = "";

  // Reset optional worksheet upload for the new question.
  currentWorksheet = { dataUrl: null, fileName: null };
  worksheetInput.value = "";
  uploadPreview.hidden = true;
  uploadPreview.innerHTML = "";

  const q = QUESTIONS[currentIndex];
  progressEl.textContent = `Question ${q.id} of ${TOTAL}`;

  // Last question uses an explicit Finish button instead of Next.
  nextButton.textContent = currentIndex === TOTAL - 1 ? "Finish" : "Next";

  const instructionHtml = renderMath(q.instruction);
  const textHtml = renderMath(q.text);
  questionEl.innerHTML = `<span class="quiz-instruction">${instructionHtml}</span><span class="quiz-expression">${textHtml}</span>`;

  answerInput.focus();
  startTimer();
}

function goNext() {
  const answer = answerInput.value.trim();
  if (answer === "" && !currentWorksheet.dataUrl) {
    showToast("Type an answer, attach a worksheet photo, or tap “Don’t know / skip”.");
    return;
  }
  recordResult(false, answer, currentWorksheet.dataUrl, currentWorksheet.fileName);
  currentWorksheet = { dataUrl: null, fileName: null };
  currentIndex += 1;
  if (currentIndex >= TOTAL) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}

function skipQuestion() {
  recordResult(true, null);
  currentIndex += 1;
  if (currentIndex >= TOTAL) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}

function finishQuiz() {
  stopTimer();

  quizView.hidden = true;
  finishView.hidden = false;

  const answered = results.filter((r) => !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const totalTime = results.reduce((sum, r) => sum + r.timeSeconds, 0);

  finishTitle.textContent = "Congratulations!";
  finishCopy.textContent = `You have completed the diagnostic assessment. You answered ${answered} of ${TOTAL} questions and skipped ${skipped}.`;

  // Auto-download the JSON result to the local device.
  const dateStamp = new Date().toISOString().replace(/[:.-]/g, "").slice(0, 13);
  const jsonBlob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
  downloadZip(jsonBlob, `mathfunda-diagnostic-${dateStamp}.json`);

  // Clear live storage now that the test is complete.
  try {
    localStorage.removeItem(LIVE_STORAGE_KEY);
  } catch {
    /* storage may be blocked */
  }

  document.querySelector("#main").scrollIntoView({ behavior: "smooth" });
}

function buildReport() {
  const totalTime = results.reduce((sum, r) => sum + r.timeSeconds, 0);
  const skipped = results.filter((r) => r.skipped).length;
  const answered = TOTAL - skipped;

  const lines = [];
  lines.push("# MathsFunda Diagnostic Assessment Result");
  lines.push("");
  lines.push(`Date: ${new Date().toISOString()}`);
  lines.push(`Questions answered: ${answered} / ${TOTAL}`);
  lines.push(`Questions skipped: ${skipped}`);
  lines.push(`Total time: ${formatTime(totalTime)}`);
  lines.push("");
  lines.push("## Per-question record");
  lines.push("");
  lines.push("| Q | Topic | Skill | Time | Status | Your answer | Correct answer | Worksheet photo |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const r of results) {
    lines.push(
      `| ${r.question} | ${r.topic} | ${r.skill} | ${formatTime(r.timeSeconds)} | ${r.skipped ? "Skipped" : "Answered"} | ${r.studentAnswer ?? "—"} | ${r.correctAnswer} | ${r.worksheetDataUrl ? "Yes" : "—"} |`
    );
  }

  const withPhotos = results.filter((r) => r.worksheetDataUrl);
  if (withPhotos.length > 0) {
    lines.push("");
    lines.push("## Worksheet photos");
    lines.push("");
    lines.push("Worksheet photos are included in the `worksheet-photos/` folder of the ZIP export.");
    for (const r of withPhotos) {
      lines.push(`- Q${r.question} (${r.topic}): ${r.worksheetFileName}`);
    }
  }
  lines.push("");
  lines.push("## Note");
  lines.push("This is not a judgement of maths ability. It helps the tutor build a fine-tuning plan for the final exam portions and maths basics.");
  return lines.join("\n");
}

async function buildZip() {
  const zip = new JSZip();
  const dateStamp = new Date().toISOString().replace(/[:.-]/g, "").slice(0, 13);
  const baseName = `mathfunda-diagnostic-${dateStamp}`;

  zip.file(`${baseName}.json`, JSON.stringify(results, null, 2));
  zip.file(`${baseName}.md`, buildReport());

  const imagesFolder = zip.folder("worksheet-photos");
  let imageIndex = 1;
  for (const r of results) {
    if (r.worksheetDataUrl) {
      const [, base64] = r.worksheetDataUrl.split(",");
      const ext = (r.worksheetFileName || `worksheet-Q${r.question}`).split(".").pop() || "jpg";
      imagesFolder.file(`Q${r.question}-${imageIndex}.${ext}`, base64, { base64: true });
      imageIndex += 1;
    }
  }

  return zip.generateAsync({ type: "blob" });
}

function downloadZip(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Result file downloaded.");
}

async function shareToWhatsApp(blob, fileName) {
  try {
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [blob] })) {
      const file = new File([blob], fileName, { type: "application/zip" });
      await navigator.share({
        title: "MathsFunda Diagnostic Result",
        text: "Here is my diagnostic assessment result file.",
        files: [file],
      });
      showToast("Shared via WhatsApp.");
      return true;
    }
  } catch {
    /* fall through to email fallback */
  }
  return false;
}

// Show the intro modal first. OK reveals the intro card with the Begin test button.
modal.hidden = false;

modalOk.addEventListener("click", () => {
  modal.hidden = true;
  introView.hidden = false;
  quizView.hidden = true;
  finishView.hidden = true;
  results.length = 0;
  currentIndex = 0;
});

modalClose.forEach((button) => {
  button.addEventListener("click", () => {
    modal.hidden = true;
    introView.hidden = false;
    quizView.hidden = true;
    finishView.hidden = true;
    results.length = 0;
    currentIndex = 0;
  });
});

beginButton.addEventListener("click", () => {
  introView.hidden = true;
  quizView.hidden = false;
  results.length = 0;
  currentIndex = 0;
  renderQuestion();
});

nextButton.addEventListener("click", goNext);
skipButton.addEventListener("click", skipQuestion);

answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") goNext();
});

worksheetInput.addEventListener("change", () => {
  const file = worksheetInput.files?.[0];
  if (!file) {
    currentWorksheet = { dataUrl: null, fileName: null };
    uploadPreview.hidden = true;
    uploadPreview.innerHTML = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    currentWorksheet = { dataUrl: reader.result, fileName: file.name };
    uploadPreview.hidden = false;
    uploadPreview.innerHTML = `<img src="${reader.result}" alt="Worksheet photo" />`;
  };
  reader.readAsDataURL(file);
});

async function buildJsonBlob() {
  return new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
}

async function buildZipBlob() {
  const zip = new JSZip();
  const dateStamp = new Date().toISOString().replace(/[:.-]/g, "").slice(0, 13);
  const baseName = `mathfunda-diagnostic-${dateStamp}`;
  zip.file(`${baseName}.json`, await buildJsonBlob());
  zip.file(`${baseName}.md`, buildReport());
  return zip.generateAsync({ type: "blob" });
}

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

function openMailto(fileName, zipBlob) {
  const body = encodeURIComponent(
    "Hello,\n\nPlease find attached the MathsFunda diagnostic assessment result file.\n" +
    "It contains the student's answers, the time taken per question, and which " +
    "questions were skipped. This helps build a fine-tuning plan for the final exam " +
    "portions and maths basics.\n\nThe result file is attached as a ZIP.\n\n" +
    "Thank you."
  );
  const subject = encodeURIComponent("MathsFunda Diagnostic Assessment Result");
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
  location.href = mailtoUrl;
  showToast("Opening your email app to send the results.");
}

downloadJsonButton.addEventListener("click", async () => {
  downloadJsonButton.disabled = true;
  downloadJsonButton.textContent = "Preparing…";
  try {
    const blob = await buildJsonBlob();
    const dateStamp = new Date().toISOString().replace(/[:.-]/g, "").slice(0, 13);
    downloadBlob(blob, `mathfunda-diagnostic-${dateStamp}.json`);
    showToast("Result JSON downloaded.");
  } catch (error) {
    showToast("Could not download the result file.");
    console.error(error);
  } finally {
    downloadJsonButton.disabled = false;
    downloadJsonButton.textContent = "Download result (JSON)";
  }
});

downloadZipButton.addEventListener("click", async () => {
  downloadZipButton.disabled = true;
  downloadZipButton.textContent = "Preparing…";
  try {
    const blob = await buildZipBlob();
    const dateStamp = new Date().toISOString().replace(/[:.-]/g, "").slice(0, 13);
    downloadBlob(blob, `mathfunda-diagnostic-${dateStamp}.zip`);
    showToast("Result ZIP downloaded.");
  } catch (error) {
    showToast("Could not create the result file.");
    console.error(error);
  } finally {
    downloadZipButton.disabled = false;
    downloadZipButton.textContent = "Download result (ZIP)";
  }
});

shareButton.addEventListener("click", async () => {
  shareButton.disabled = true;
  shareButton.textContent = "Sending…";
  try {
    const blob = await buildZipBlob();
    const dateStamp = new Date().toISOString().replace(/[:.-]/g, "").slice(0, 13);
    const fileName = `mathfunda-diagnostic-${dateStamp}.zip`;
    const sent = await shareToWhatsApp(blob, fileName);
    if (!sent) {
      // WhatsApp not available: trigger email instead.
      openMailto(fileName, blob);
    }
  } catch (error) {
    showToast("Could not share the result file.");
    console.error(error);
  } finally {
    shareButton.disabled = false;
    shareButton.textContent = "Send to WhatsApp";
  }
});

emailButton.addEventListener("click", async () => {
  emailButton.disabled = true;
  emailButton.textContent = "Opening mail…";
  try {
    const blob = await buildZipBlob();
    const dateStamp = new Date().toISOString().replace(/[:.-]/g, "").slice(0, 13);
    openMailto(`mathfunda-diagnostic-${dateStamp}.zip`, blob);
  } catch (error) {
    showToast("Could not prepare the email.");
    console.error(error);
  } finally {
    emailButton.disabled = false;
    emailButton.textContent = "Email results to parent";
  }
});
