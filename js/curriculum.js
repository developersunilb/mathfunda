/**
 * Single source of truth for the chapter list, study order and public metadata.
 * The studio editor, the landing page, the reader and the flashcard decks all
 * import from here, so adding a chapter only needs an entry below.
 */

const chapterModules = import.meta.glob("../chapters/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const CHAPTER_ORDER = {
  "learning-roadmap": 1,
  "study-plan-45-days": 2,
  "diagnostic-assessment": 3,
  "diagnostic-answer-key": 35,
  "foundation-1-numbers-and-signs": 4,
  "foundation-2-fractions-decimals-percentages": 5,
  "foundation-3-ratio-and-proportion": 6,
  "foundation-4-powers-and-roots": 7,
  "foundation-5-basic-algebra": 8,
  "foundation-6-algebraic-operations": 9,
  "foundation-7-geometry-vocabulary": 10,
  "foundation-8-measurement-and-units": 11,
  "geometry-basics": 12,
  "basic-equations": 13,
  "number-systems": 14,
  polynomials: 15,
  "linear-equations": 16,
  "linear-inequalities": 17,
  "beyond-class-9": 18,
};

const TITLE_OVERRIDES = {
  "learning-roadmap": "Master Learning Roadmap",
  "study-plan-45-days": "45-Day Study Plan",
  "diagnostic-assessment": "Diagnostic Assessment",
  "diagnostic-answer-key": "Diagnostic Assessment — Answer Key (Parent)",
  "foundation-1-numbers-and-signs": "Foundation 1: Numbers and Signs",
  "foundation-2-fractions-decimals-percentages":
    "Foundation 2: Fractions, Decimals and Percentages",
  "foundation-3-ratio-and-proportion": "Foundation 3: Ratio and Proportion",
  "foundation-4-powers-and-roots": "Foundation 4: Powers and Roots",
  "foundation-5-basic-algebra": "Foundation 5: Basic Algebra",
  "foundation-6-algebraic-operations": "Foundation 6: Algebraic Operations",
  "foundation-7-geometry-vocabulary": "Foundation 7: Geometry Vocabulary",
  "foundation-8-measurement-and-units": "Foundation 8: Measurement and Units",
  "geometry-basics": "Perimeter, Area and Heron's Formula",
  "basic-equations": "Basic Equations",
  "number-systems": "Number Systems",
  polynomials: "Polynomials",
  "linear-equations": "Linear Equations in Two Variables",
  "linear-inequalities": "Linear Inequalities (Enrichment)",
  "beyond-class-9": "Beyond Class 9 (Enrichment)",
};

function titleFromSlug(slug) {
  if (TITLE_OVERRIDES[slug]) return TITLE_OVERRIDES[slug];
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const PART_DEFINITIONS = [
  { id: "getting-started", label: "Getting Started", topics: [] },
  { id: "foundation", label: "Foundation Repair", topics: [] },
  {
    id: "part1",
    label: "Part 1 · Chapters 1–8",
    topics: [
      {
        label: "Chapters 1–2: Coordinates and Linear Polynomials",
        short: "Ch 1–2 · Coordinates & Linear Polynomials",
      },
      {
        label: "Chapters 3–4: Numbers and Identities",
        short: "Ch 3–4 · Numbers & Identities",
      },
      {
        label: "Chapters 5–6: Geometry and Mensuration",
        short: "Ch 5–6 · Geometry & Mensuration",
      },
      {
        label: "Chapters 7–8: Probability and Sequences",
        short: "Ch 7–8 · Probability & Sequences",
      },
    ],
  },
  {
    id: "part2",
    label: "Part 2 · Chapters 9–14",
    topics: [
      {
        label: "Chapters 9–11: Reasoning, Data and Algorithms",
        short: "Ch 9–11 · Reasoning, Data & Algorithms",
      },
      {
        label: "Chapters 12–14: Quadrilaterals, Equations and Solids",
        short: "Ch 12–14 · Quadrilaterals, Equations & Solids",
      },
    ],
  },
  { id: "enrichment", label: "Enrichment", topics: [] },
];

const PART_ORDER = PART_DEFINITIONS.map((part) => part.id);
const TOPIC_SHORT = Object.fromEntries(
  PART_DEFINITIONS.flatMap((part) => part.topics.map((topic) => [topic.label, topic.short]))
);

// Existing files are mapped to the Ganita Manjari part/topic pairs.
const CHAPTER_PLACEMENT = {
  "learning-roadmap": { part: "getting-started" },
  "study-plan-45-days": { part: "getting-started" },
  "diagnostic-assessment": { part: "getting-started" },
  "diagnostic-answer-key": { part: "getting-started" },
  "basic-equations": {
    part: "part1",
    topic: "Chapters 1–2: Coordinates and Linear Polynomials",
  },
  "number-systems": { part: "part1", topic: "Chapters 3–4: Numbers and Identities" },
  polynomials: { part: "part1", topic: "Chapters 3–4: Numbers and Identities" },
  "geometry-basics": { part: "part1", topic: "Chapters 5–6: Geometry and Mensuration" },
  "linear-equations": {
    part: "part2",
    topic: "Chapters 12–14: Quadrilaterals, Equations and Solids",
  },
  "linear-inequalities": { part: "enrichment" },
  "beyond-class-9": { part: "enrichment" },
};

function placementForChapter(slug) {
  if (slug.startsWith("foundation-")) return { part: "foundation" };
  return CHAPTER_PLACEMENT[slug] || { part: "part1" };
}

function topicOrderForChapter(chapter) {
  const part = PART_DEFINITIONS.find((entry) => entry.id === chapter.part);
  const index = part?.topics.findIndex((topic) => topic.label === chapter.topic);
  return index === undefined || index < 0 ? 99 : index;
}

export const chapters = Object.entries(chapterModules)
  .map(([path, raw]) => {
    const match = path.match(/chapters\/(class-(\d+))\/(.+)\.md$/i);
    if (!match) return null;
    const [, classFolder, classNumber, slug] = match;
    const placement = placementForChapter(slug);
    return {
      id: `${classFolder}/${slug}`,
      classFolder,
      classNumber: Number(classNumber),
      className: `Class ${classNumber}`,
      slug,
      part: placement.part,
      topic: placement.topic || "",
      topicShort: TOPIC_SHORT[placement.topic] || "",
      title: titleFromSlug(slug),
      content: String(raw).trim(),
    };
  })
  .filter(Boolean)
  .sort((a, b) => {
    if (a.classNumber !== b.classNumber) return a.classNumber - b.classNumber;
    const partDelta = PART_ORDER.indexOf(a.part) - PART_ORDER.indexOf(b.part);
    if (partDelta !== 0) return partDelta;
    const topicDelta = topicOrderForChapter(a) - topicOrderForChapter(b);
    if (topicDelta !== 0) return topicDelta;
    const aOrder = CHAPTER_ORDER[a.slug] ?? 100;
    const bOrder = CHAPTER_ORDER[b.slug] ?? 100;
    return aOrder - bOrder || a.title.localeCompare(b.title);
  });

export const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));

/* ---------------------------------------------------------- Public metadata */

export const STAGES = [
  {
    id: "start",
    part: "getting-started",
    kicker: "Before you begin",
    title: "Start here",
    blurb:
      "Understand the route, take the short diagnostic and set a routine. Ten minutes here saves hours later.",
    accent: "slate",
  },
  {
    id: "foundations",
    part: "foundation",
    kicker: "Stage 1 · Repair",
    title: "The Foundations",
    blurb:
      "Eight short modules that fix the arithmetic, fractions, ratio, powers, algebra and geometry every Class 9 chapter assumes.",
    accent: "green",
  },
  {
    id: "part1",
    part: "part1",
    kicker: "Stage 2 · Build",
    title: "Class 9 · Part 1",
    blurb:
      "Number systems, polynomials and mensuration. Each lesson assumes the foundations are already solid.",
    accent: "indigo",
  },
  {
    id: "part2",
    part: "part2",
    kicker: "Stage 3 · Extend",
    title: "Class 9 · Part 2",
    blurb:
      "Two-variable equations, graphs and the reasoning chapters that follow the Part 1 toolkit.",
    accent: "amber",
  },
  {
    id: "enrichment",
    part: "enrichment",
    kicker: "Optional",
    title: "Enrichment",
    blurb:
      "Inequalities and a first look beyond Class 9. Come here when the core work feels comfortable.",
    accent: "rose",
  },
];

export const STAGE_BY_ID = Object.fromEntries(STAGES.map((stage) => [stage.id, stage]));

const LESSON_NOTES = {
  "learning-roadmap":
    "See the whole journey before you start: three levels, the study order and how the chapters fit together.",
  "study-plan-45-days":
    "A 90-minute daily routine across 45 days, with weekly confidence checks and a mistakes notebook.",
  "diagnostic-assessment":
    "Twenty questions that show exactly which foundations to repair first. Mark it honestly.",
  "diagnostic-answer-key":
    "Answers, marking guide and worked reasoning. Parent-only — keep away from the student until the test is complete.",
  "foundation-1-numbers-and-signs":
    "Integers, signs, absolute value and the small rules that cause most lost marks.",
  "foundation-2-fractions-decimals-percentages":
    "Three ways of writing the same number, and how to move between them without errors.",
  "foundation-3-ratio-and-proportion":
    "Compare, share and scale quantities with confidence, including the unitary method.",
  "foundation-4-powers-and-roots":
    "Index laws, square and cube roots, and how to spot perfect powers.",
  "foundation-5-basic-algebra":
    "Letters as numbers: collect like terms, expand brackets and solve one-step equations.",
  "foundation-6-algebraic-operations":
    "Expand, factorise and use the identities that carry straight into Class 9 polynomials.",
  "foundation-7-geometry-vocabulary":
    "The angle and shape vocabulary that every geometry question silently assumes.",
  "foundation-8-measurement-and-units":
    "Units, conversions and the mensuration formulas used all year.",
  "basic-equations":
    "Keep equations balanced and undo operations in the reverse order.",
  "number-systems":
    "Rational and irrational numbers, decimal expansions and the laws of exponents.",
  polynomials:
    "Degrees, zeroes, the remainder and factor theorems, and the identity bank.",
  "geometry-basics":
    "Perimeter and area for every shape, plus Heron's formula for triangles.",
  "linear-equations":
    "Two-variable equations, tables of values and straight-line graphs.",
  "linear-inequalities":
    "Solve and graph inequalities, including the rule that flips the sign.",
  "beyond-class-9":
    "A first look at complex numbers and radians, and where the story continues.",
};

const LESSON_MINUTES = {
  "learning-roadmap": 12,
  "study-plan-45-days": 12,
  "diagnostic-assessment": 35,
  "diagnostic-answer-key": 15,
  "foundation-1-numbers-and-signs": 25,
  "foundation-2-fractions-decimals-percentages": 30,
  "foundation-3-ratio-and-proportion": 22,
  "foundation-4-powers-and-roots": 24,
  "foundation-5-basic-algebra": 22,
  "foundation-6-algebraic-operations": 20,
  "foundation-7-geometry-vocabulary": 25,
  "foundation-8-measurement-and-units": 24,
  "basic-equations": 18,
  "number-systems": 30,
  polynomials: 32,
  "geometry-basics": 28,
  "linear-equations": 24,
  "linear-inequalities": 18,
  "beyond-class-9": 15,
};

for (const chapter of chapters) {
  chapter.blurb = LESSON_NOTES[chapter.slug] || "";
  chapter.minutes = LESSON_MINUTES[chapter.slug] || 20;
  chapter.stage = STAGES.find((stage) => stage.part === chapter.part)?.id || "part1";
  chapter.number = CHAPTER_ORDER[chapter.slug] ?? 99;
}

export function stageChapters(stageId) {
  const stage = STAGE_BY_ID[stageId];
  if (!stage) return [];
  return chapters.filter((chapter) => chapter.part === stage.part);
}

export function chapterIndex(chapter) {
  return chapters.findIndex((entry) => entry.id === chapter.id);
}

export function nextChapter(chapter) {
  const index = chapterIndex(chapter);
  return index >= 0 ? chapters[index + 1] || null : null;
}

export function previousChapter(chapter) {
  const index = chapterIndex(chapter);
  return index > 0 ? chapters[index - 1] : null;
}

export function lessonHref(slug, page) {
  const query = new URLSearchParams({ ch: slug });
  if (page) query.set("page", String(page));
  return `./reader.html?${query.toString()}`;
}

export function stageHref(stageId) {
  return `./learn.html?stage=${encodeURIComponent(stageId)}`;
}

export { PART_DEFINITIONS };
