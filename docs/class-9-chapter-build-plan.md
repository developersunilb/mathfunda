# Class 9 Ganita Manjari — Chapter Build Plan

Status: **proposed, awaiting approval — not committed**  
Scope: complete the Class 9 maths chapter set for Parts 1 and 2, in unit-completion order, without disturbing approved work.

---

## 1. What “complete” means

A chapter is complete only when all of the following exist and agree with one another:

1. A student-facing lesson in `chapters/class-9/` using the approved Chapter 1 / Chapter 13 teaching style.
2. The chapter’s resource set: worked examples, application questions, full solutions, sample questions and parent answer key.
3. Question-bank entries with stable IDs and step-by-step solutions where the question needs them.
4. A flashcard deck, Formula Vault entries and vocabulary cross-links.
5. Correct curriculum metadata, study-plan mapping and concept mapping.
6. A browser check on desktop and phone, a print check, a passing build and no new test failures.
7. One commit per chapter. No push until explicitly approved.

A chapter is **not** complete merely because a Markdown file exists.

---

## 2. Current state

| Chapter | Current file | Status | Required work |
|---|---|---|---|
| 1. Orienting Yourself: The Use of Coordinates | `orienting-coordinates.md` | Approved | Keep as reference |
| 2. Introduction to Linear Polynomials | `polynomials.md` is legacy and covers old polynomial theorems | Missing | New chapter, new slug `linear-polynomials`; keep old slug for compatibility |
| 3. The World of Numbers | `number-systems.md` | Legacy draft, 191 lines | Rewrite and expand to the Ganita Manjari chapter |
| 4. Exploring Algebraic Identities | Partly inside `polynomials.md` | Missing | New chapter, slug `algebraic-identities` |
| 5. I’m Up and Down, and Round and Round | None | Missing | New chapter, slug `circles` |
| 6. Measuring Space: Perimeter and Area | `geometry-basics.md` | Legacy draft, 152 lines | Rewrite and expand to the full chapter |
| 7. The Mathematics of Maybe: Introduction to Probability | None | Missing | New chapter, slug `probability` |
| 8. Predicting What Comes Next: Exploring Sequences and Progressions | None | Missing | New chapter, slug `sequences` |
| 9. Propositions and their Converses | None | Missing | New chapter, slug `propositions` |
| 10. How Quantities Combine: Understanding Data | None | Missing | New chapter, slug `understanding-data` |
| 11. The World of Algorithms | None | Missing | New chapter, slug `algorithms` |
| 12. Quadrilaterals | None | Missing | New chapter, slug `quadrilaterals` |
| 13. Two Variables, One Line | `linear-equations.md` | Rebuilt and committed | Do not rewrite. The Step B audit decision is the only open loop |
| 14. Math of Space: Surface Area and Volume | None | Missing | New chapter, slug `surface-area-volume` |

Supporting files such as `basic-equations.md`, `linear-inequalities.md` and `beyond-class-9.md` are repair/enrichment material, not textbook chapters. They stay.

### Chapter 13 status — explicit decision required

The rebuilt Chapter 13 is committed at `5433571`. There are **no uncommitted Chapter 13 changes**, so any audit correction would be a new, deliberate edit — not finishing an already-started change.

The open loop is therefore a decision, not a build task:

1. **Approve** a specific correction list and apply only those changes.
2. **Defer** the corrections and leave Chapter 13 exactly as committed.
3. **Review** the audit findings before deciding.

No Chapter 13 edit will happen implicitly as part of this roadmap.

### Legacy problems the plan must fix

- `polynomials.md` mixes Chapter 2 and Chapter 4 material. It must be split, not stretched.
- `geometry-basics.md` is used as a fallback for coordinate geometry, circles, statistics, probability and surface area in `adaptive-plan.js`. That fallback is wrong and must be replaced with real chapter links.
- `number-systems.md` covers the old number-system sequence, not the Ganita Manjari history-and-irrationality sequence.
- Several Part 1 chapters have no placement or metadata yet.

---

## 3. Marks map and priority logic

CBSE publishes **unit marks**, not an official chapter-by-chapter split. The chapter estimates below are planning estimates from the unit weights, the textbook page allocation and the standard question-paper design. They are not presented as official chapter marks. Source: CBSE Class 9 Mathematics syllabus 2026–27, `cbseacademic.nic.in`.

| Unit | Marks | Chapters in this plan | Exam character |
|---|---:|---|---|
| Geometry | 25 | Ch 5 Circles, Ch 9 Propositions, Ch 12 Quadrilaterals | Proofs, theorems, multi-step reasoning; highest total weight |
| Algebra | 20 | Ch 2 Linear Polynomials, Ch 4 Identities, Ch 8 Sequences, Ch 13 Linear Equations | Method selection, graphs, formula application |
| Mensuration | 14 | Ch 6 Perimeter and Area, Ch 14 Surface Area and Volume | Formula recall plus composite-figure problems |
| Statistics and Probability | 10 | Ch 7 Probability, Ch 10 Understanding Data | Graph interpretation, weighted averages, sample spaces |
| Number Systems | 7 | Ch 3 The World of Numbers | Irrationality proof, decimals, number-line reasoning |
| Coordinate Geometry | 4 | Ch 1 Coordinates | Complete |

### Priority rule

This is a **unit-completion roadmap**, not a strict chapter-weight ranking.

1. Complete the highest-weight units first.
2. Within a unit, respect conceptual dependencies.
3. Low-weight chapters are not skipped; they are placed after the high-weight units.
4. A chapter can open a unit early when it is the deliberate next vertical slice.
5. Existing accurate content is reused rather than rewritten for its own sake.

Chapter 14 is first because it is a deliberately chosen, high-value, tangible vertical slice. It is **not** first because Mensuration is the highest-weight unit — Geometry is.

### Chapter-level estimate used for ordering

| Chapter | Unit | Estimated exam share | Why it sits here |
|---|---|---:|---|
| 14. Surface Area and Volume | Mensuration | High | Chosen first as a tangible vertical slice; composite solids and conversions are reliable scoring questions |
| 12. Quadrilaterals | Geometry | High | Substantial chapter with strong conceptual dependencies; a valuable second geometry vertical slice after Chapter 1 |
| 5. Circles | Geometry | High | Geometry is 25 marks; circle theorems and cyclic quadrilaterals are core |
| 9. Propositions | Geometry | Medium | Completes the Geometry unit and supplies proof and counterexample language |
| 6. Perimeter and Area | Mensuration | High | Completes Mensuration with Chapter 14; strong scoring chapter with an existing draft to upgrade |
| 4. Algebraic Identities | Algebra | High | Algebra is 20 marks; identities feed factorisation and mental calculation |
| 8. Sequences | Algebra | Medium-high | Algebra is 20 marks; AP/GP formulas are predictable and scoring |
| 2. Linear Polynomials | Algebra | Medium | Completes the Algebra build with Chapter 13 already done; bridge to graphs |
| 10. Understanding Data | Statistics and Probability | Medium-high | Opens the 10-mark statistics unit; weighted averages and stacked bars are accessible marks |
| 7. Probability | Statistics and Probability | Medium | Completes the statistics and probability unit; usually accessible |
| 3. The World of Numbers | Number System | Medium | Number System is 7 marks; contained but proof-heavy |
| 11. Algorithms | No separate board unit | Low direct exam weight | Valuable for competency and computational thinking; built last for completeness |

---

## 4. Build sequence

### Phase 0 — Settle the known issue, then freeze the baseline

**Goal:** make the Chapter 13 decision explicit and start the new work from a trustworthy base.

1. Decide the Chapter 13 open loop: approve specific corrections, defer them, or review the audit findings.
2. Do not edit Chapter 13 merely because a correction was once suggested.
3. Freeze the chapter template and the "definition of done" checklist.
4. Record the current test baseline: 204 tests, 203 pass, 1 pre-existing `milestone8.test.js` failure.
5. Confirm no existing question IDs, chapter slugs or approved content are renamed.

**Exit gate:** Chapter 13 decision recorded; no unapproved Chapter 13 edits; baseline unchanged.

### Phase A — Build in unit-completion order

**Order:** **14 → 12 → 5 → 9 → 6 → 4 → 8 → 2 → 10 → 7 → 3 → 11**

Chapter 13 and Chapter 1 are already complete. Chapter 11 is last because it has no separate board unit.

| Order | Chapter | Unit | Estimated effort | Main exam outcomes |
|---|---|---|---:|---|
| A1 | 14. Surface Area and Volume | Mensuration | 2 sessions | TSA and volume of cuboid, cube, cylinder, cone, pyramid, sphere, hemisphere; composite solids; unit conversion; estimation |
| A2 | 12. Quadrilaterals | Geometry | 2–3 sessions | Parallelogram tests and proofs; midpoint theorem; median and centroid properties; Varignon; tiling |
| A3 | 5. Circles | Geometry | 2–3 sessions | Circle vocabulary; symmetry; circumcircle; chord theorems; angle at centre; cyclic quadrilaterals |
| A4 | 9. Propositions and their Converses | Geometry | 1 session | Proposition, converse, implication, counterexample; proving versus disproving; geometry examples |
| A5 | 6. Perimeter and Area | Mensuration | 2 sessions | Perimeter; circumference; arc length; rectangle, parallelogram and triangle area; Heron; circle and sector area |
| A6 | 4. Algebraic Identities | Algebra | 2 sessions | Visual proofs of identities; factorisation; algebra tiles; new identities; rational expressions |
| A7 | 8. Sequences and Progressions | Algebra | 2 sessions | Explicit and recursive rules; AP; sum of first n natural numbers; GP; fractal patterns |
| A8 | 2. Linear Polynomials | Algebra | 2 sessions | Linear expressions; patterns; input-output; graphs; slope as rate of change |
| A9 | 10. Understanding Data | Statistics and Probability | 1–2 sessions | Weighted mean; average of averages; mixtures; custom weights; stacked and 100% stacked bars |
| A10 | 7. Probability | Statistics and Probability | 1–2 sessions | Randomness; probability scale; experimental and theoretical probability; sample space; events; tree diagrams |
| A11 | 3. The World of Numbers | Number System | 2 sessions | Historical number systems; zero; integers; rational density; irrationality of √2; real decimals; square-root spiral |
| A12 | 11. The World of Algorithms | No separate board unit | 1–2 sessions | Step-by-step algorithms; digit addition; divisors and GCD; Euclid's subtraction algorithm; Aryabhata's division algorithm |

**Why this order:**

- **14 first** is a deliberate vertical-slice choice: high-value, tangible, and the agreed starting point. Mensuration is 14 marks, not the highest unit.
- **12, then 5, then 9** completes the 25-mark Geometry unit. Chapter 12 is next because it is a substantial chapter with strong conceptual dependencies and gives a second geometry vertical slice after Chapter 1's coordinate work. It is **not** automatically ahead of Chapter 5 because it is "heavier"; both are in the same unit.
- **6** completes the 14-mark Mensuration unit with Chapter 14.
- **4, then 8, then 2** completes the 20-mark Algebra unit alongside the already-built Chapter 13.
- **10, then 7** completes the 10-mark Statistics and Probability unit.
- **3** completes the 7-mark Number System unit.
- **11** is last: valuable computational thinking, but no separate board weight.

**Optional swap:** if Chapter 12's proof load feels too abrupt, pull Chapter 9 forward as a one-session "proof toolkit" before Chapter 12. The default remains the sequence above.

### Phase B — Unit integration gates

Do not wait for the whole course before integrating. After each unit is complete, run a mini integration pass:

| Unit completed | Gate |
|---|---|
| Geometry — after Chapter 9 | Mixed geometry set; adaptive mappings; Formula Vault; flashcards; vocabulary; misconceptions; unit retrieval |
| Mensuration — after Chapter 6 | Mixed mensuration set; formula reconciliation; composite-solid and unit-conversion checks |
| Algebra — after Chapter 2 | Mixed algebra set; identity/factorisation/graph links; question-bank coverage; flashcards |
| Statistics and Probability — after Chapter 7 | Mixed data and probability set; graph interpretation and sample-space checks |
| Number System — after Chapter 3 | Number-line, decimal and irrationality checks; mixed retrieval |
| Algorithms — after Chapter 11 | Algorithm-tracing and competency-style checks; label as non-board enrichment |

Each gate checks:

1. Mixed-topic questions within that unit.
2. Adaptive-plan mappings for every concept in the unit.
3. Formula Vault reconciliation.
4. Flashcards for every major method.
5. Vocabulary links and definitions.
6. Misconception and error-detection coverage.
7. Unit-level retrieval practice.

### Phase C — Cross-unit exam readiness

Once the units are complete, the final phase becomes cross-unit revision rather than late integration:

1. Rebuild the study-plan sequence around the real 14 chapters.
2. Add mixed-topic revision sets that deliberately combine high-weight units.
3. Add two full-length mixed practice papers with marking schemes.
4. Run the complete browser, print, mobile and offline checks.
5. Produce a one-page "last 10 days" revision sheet from the highest-yield chapters.

---

## 5. Chapter scope from the textbook

These are the content anchors, not a promise to copy the textbook page for page. The site keeps its own teaching voice.

| Chapter | Textbook anchors |
|---|---|
| 2. Linear Polynomials | 2.1 Introduction; 2.2 Linear polynomials; 2.3 Linear patterns; 2.5 Linear relationships; 2.6 Visualising linear relationships |
| 3. The World of Numbers | History of counting; zero; Brahmagupta’s rules; integers; rationals and density; irrationality of √2; constructing lengths; π and Madhava; terminating/repeating/irrational decimals; cyclic numbers |
| 4. Algebraic Identities | Visualising identities; factorisation using identities; algebra tiles; factorisation without tiles; finding new identities; simplifying rational expressions |
| 5. Circles | Definitions; symmetry; how many circles through given points; chords and subtended angles; midpoint and perpendicular bisector; distance of chords from centre; arcs; concyclicity |
| 6. Perimeter and Area | Perimeter; C/D ratio; π is irrational; arc length; rectangle, parallelogram and triangle area; Heron; squaring a rectangle; circle area; sector area; Brahmagupta |
| 7. Probability | Randomness; probability scale; experimental probability; theoretical probability; statistical data; sample spaces; events; tree diagrams |
| 8. Sequences | Sequences; explicit rules; recursive rules; arithmetic progressions; sum of first n natural numbers; geometric progressions; fractals |
| 9. Propositions | Proposition; converse; implication; counterexample; proof versus disproof; converses of known geometry statements; Fermat number example |
| 10. Understanding Data | Average of averages; mixtures; custom weights; weighted mean; stacked columns; 100% stacked bars as an alternative to pie charts |
| 11. Algorithms | Adding numbers; digit-by-digit addition; divisors; GCD; first GCD algorithm; data structures; improving the algorithm; algorithm analysis; Euclid’s subtraction algorithm; Aryabhata’s division algorithm |
| 12. Quadrilaterals | What a quadrilateral is; parallelograms; applications; triangle midpoint property; medians and centroid; Varignon; tiling with any 4-gon |
| 13. Linear Equations | Already rebuilt: standard form, solutions, graphs, slope-intercept, pairs of equations, substitution, elimination, graphical method, ratio tests, applications |
| 14. Surface Area and Volume | Cuboids and cubes; cylinders; cones; pyramids; spheres and hemispheres; composite objects; estimation and guesstimates |

---

## 6. Standard chapter structure

Each lesson should follow the approved teaching arc, adapted to the chapter:

1. Why this matters — a real question or situation.
2. Prior knowledge check — only the prerequisites that are actually needed.
3. Discover — an activity, pattern or counterexample before the formal rule.
4. Understand — precise definition, theorem or formula, with the conditions stated.
5. Worked examples — at least three, moving from routine to exam-style.
6. Guided practice — partially completed solutions.
7. Independent practice — exam-format questions.
8. Reasoning and error detection — common wrong answers, and why they are wrong.
9. Real-life application — one substantive context, not a decorative word problem.
10. Retrieval practice — short mixed recall.
11. Memory hook and formula reference — compact, accurate, printable.
12. Answer key — with method notes where the method matters.
13. Spaced retrieval schedule — 1 day, 3 days, 7 days, 21 days.

### Non-negotiable accuracy rules

- State conditions: denominators not zero; triangle inequalities; valid domains; “not both zero” for \(ax+by+c=0\).
- Distinguish a definition from a theorem from a test.
- Do not call a converse true because the original is true.
- Do not present a formula without saying what each symbol means and when it applies.
- Use “same shape and same size” for congruent, not merely “equal”.
- Treat discrete-domain solutions as subsets, not automatically infinite.
- Label enrichment content as enrichment.
- Verify every numerical answer independently before publishing.

---

## 7. Integration checklist for every chapter

| Area | File | Action |
|---|---|---|
| Lesson | `chapters/class-9/<slug>.md` | New or rewritten chapter |
| Resources | `<slug>-examples.md`, `-application.md`, `-solutions.md`, `-sample-questions.md`, `-answer-key.md` | Create or rewrite |
| Order and title | `js/curriculum.js` | Add order, title override, placement, lesson notes |
| Question bank | `js/content-model.js` | Add 12–15 questions with stable IDs |
| Adaptive plan | `js/adaptive-plan.js` | Add concept entries and correct chapter mappings |
| Flashcards | `js/flashcard-data.js` | Add one deck; append cards, never reorder |
| Formula Vault | `js/formulas.js` | Add or update formula cards |
| Vocabulary | `js/vocabulary-data.js` | Add missing terms and chapter links |
| Reader | `js/reader.js` | Add interactive/enhanced blocks only where they teach something |
| Tests | `js/*.test.js` | Add content-integrity and accuracy guards |
| Build | `vite.config.js` | Only if a new page or entry is introduced |

### Metadata decisions

- Keep the approved slug `orienting-coordinates`.
- Keep the approved slug `linear-equations` and concept ID `alg-linear-eqns-2vars`.
- Keep existing slugs `number-systems`, `polynomials` and `geometry-basics` for progress compatibility, but retitle and rewrite them to the correct chapter.
- Add new slugs for the chapters that have no file today.
- Do not reuse an old slug for a different chapter unless the old content is fully replaced and links are audited.
- Do not renumber existing question IDs. Add new IDs.

---

## 8. Quality gates

A chapter is not accepted until all of these pass:

1. **Source check:** section coverage matched against the NCERT chapter; no invented syllabus.
2. **Maths check:** every example and answer reworked independently; units and rounding checked.
3. **Language check:** simple meaning before formal definition; no unexplained jargon.
4. **Link check:** every lesson link, vocabulary link and prerequisite link resolves.
5. **Question check:** no duplicate IDs; every answer key matches its question; no placeholder answers.
6. **Browser check:** desktop and 390 px mobile; no console errors; no raw LaTeX; no KaTeX errors.
7. **Print check:** examples open, navigation hidden, page breaks sane.
8. **Build check:** `npm run build` passes.
9. **Test check:** new tests pass; only the known pre-existing `milestone8.test.js` failure remains.
10. **Commit check:** one chapter per commit; no push.

---

## 9. Risks and controls

| Risk | Control |
|---|---|
| Copying the textbook too closely and losing the site’s teaching voice | Use the textbook for scope and accuracy, not prose |
| Proof-heavy chapters becoming intimidating | Start with a concrete counterexample or diagram; keep formal proof after intuition |
| Unit-completion order leaving gaps | No chapter is dropped; low-weight chapters are scheduled, just later |
| Updating adaptive-plan mappings breaks existing study plans | Change mappings in a separate commit with tests; preserve IDs |
| New chapters orphaned in navigation | Run an integration test that checks every chapter has placement, resources and at least one question |
| Formula overload in mensuration | Teach one derivation and one comparison table per family; do not dump 20 formulas at once |
| Chapter 13 being edited without a decision | Record the decision in Phase 0; make no Chapter 13 edit unless specifically approved |
| Integration deferred until the end | Run the unit gate immediately after each unit is complete, not in Phase C |
| Time spent polishing legacy content that should be replaced | Rewrite to the new template; reuse only verified explanations and questions |

---

## 10. Immediate next actions

1. Settle the Chapter 13 decision: approve specific corrections, defer them, or review the audit findings.
2. Approve or amend this sequence.
3. Build Chapter 14 as the first vertical slice: lesson, resources, questions, flashcards, formula cards, metadata, tests, browser check, commit.
4. Use Chapter 14 as the quality benchmark for every chapter that follows.

**Default execution order:** 14 → 12 → 5 → 9 → 6 → 4 → 8 → 2 → 10 → 7 → 3 → 11, with Chapter 13 left exactly as committed unless a correction is explicitly approved. Unit integration runs after each unit; the final pass is cross-unit exam readiness only.
