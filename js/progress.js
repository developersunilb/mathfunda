/**
 * Local progress, streaks and spaced-repetition scheduling.
 * Everything lives in localStorage, so every device keeps its own progress.
 */

const STORAGE_KEY = "mathfunda-progress-v1";

const EMPTY = () => ({
  version: 1,
  lessons: {},
  last: null,
  days: [],
  cards: {},
  reviews: 0,
});

function read() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (stored && typeof stored === "object" && stored.lessons) {
      return { ...EMPTY(), ...stored };
    }
  } catch {
    /* corrupt or unavailable storage */
  }
  return EMPTY();
}

let state = read();
const listeners = new Set();

function commit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be full or blocked in private mode */
  }
  listeners.forEach((listener) => listener(state));
}

export function onProgressChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function todayKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function recordActivity() {
  const today = todayKey();
  if (!state.days.includes(today)) {
    state.days.push(today);
    state.days = state.days.slice(-400);
  }
}

/* --------------------------------------------------------------- Lessons */

export function lessonState(slug) {
  return state.lessons[slug] || { done: false, page: 1, visitedAt: 0 };
}

export function isLessonDone(slug) {
  return Boolean(state.lessons[slug]?.done);
}

export function setLessonPage(slug, page) {
  const entry = lessonState(slug);
  state.lessons[slug] = {
    ...entry,
    page: Math.max(1, Number(page) || 1),
    visitedAt: Date.now(),
  };
  state.last = { slug, page: state.lessons[slug].page, at: Date.now() };
  recordActivity();
  commit();
}

export function markLessonDone(slug, done = true) {
  const entry = lessonState(slug);
  state.lessons[slug] = {
    ...entry,
    done,
    visitedAt: Date.now(),
    completedAt: done ? Date.now() : 0,
  };
  state.last = { slug, page: entry.page || 1, at: Date.now() };
  if (done) recordActivity();
  commit();
}

export function lastLesson() {
  return state.last;
}

export function summary(slugs) {
  const total = slugs.length;
  const done = slugs.filter(isLessonDone).length;
  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

export function nextUnfinished(slugs) {
  const last = state.last?.slug;
  if (last && slugs.includes(last) && !isLessonDone(last)) {
    const index = slugs.indexOf(last);
    const ordered = [...slugs.slice(index), ...slugs.slice(0, index)];
    return ordered.find((slug) => !isLessonDone(slug)) || null;
  }
  return slugs.find((slug) => !isLessonDone(slug)) || null;
}

export function streakDays() {
  if (state.days.length === 0) return 0;
  const days = new Set(state.days);
  const cursor = new Date();
  if (!days.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(todayKey(cursor))) return 0;
  }
  let count = 0;
  while (days.has(todayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function activeToday() {
  return state.days.includes(todayKey());
}

/* ----------------------------------------------------------------- Cards */

const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [0, 1, 3, 7, 16, 35];

export function cardState(id) {
  return state.cards[id] || { box: 1, due: 0, reps: 0, lapses: 0, last: 0 };
}

export function dueCount(ids, now = Date.now()) {
  return ids.reduce((count, id) => count + (cardState(id).due <= now ? 1 : 0), 0);
}

export function newCount(ids) {
  return ids.reduce((count, id) => count + (cardState(id).reps === 0 ? 1 : 0), 0);
}

/**
 * Rate a card.
 * @param {string} id
 * @param {0|1|2|3} rating 0 again, 1 hard, 2 good, 3 easy
 * @returns {{intervalDays: number, dueLabel: string}}
 */
export function reviewCard(id, rating) {
  const card = { ...cardState(id) };
  card.reps += 1;
  card.last = Date.now();
  let intervalDays;

  if (rating === 0) {
    card.box = 1;
    card.lapses += 1;
    intervalDays = 10 / (24 * 60); // ten minutes
  } else if (rating === 1) {
    card.box = Math.max(1, card.box - 1);
    intervalDays = card.box === 1 ? 0.5 : INTERVALS[card.box - 1] * 0.6;
  } else {
    card.box = Math.min(6, card.box + (rating === 3 ? 2 : 1));
    intervalDays = INTERVALS[card.box - 1];
  }

  card.due = Date.now() + Math.round(intervalDays * DAY);
  state.cards[id] = card;
  state.reviews += 1;
  recordActivity();
  commit();

  return { intervalDays, dueLabel: relativeDue(card.due) };
}

export function relativeDue(due, now = Date.now()) {
  if (!due || due <= now) return "now";
  const minutes = Math.round((due - now) / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 20) return `${hours} hr`;
  const days = Math.round(hours / 24);
  if (days <= 1) return "tomorrow";
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return months <= 1 ? "1 month" : `${months} months`;
}

export function reviewStats() {
  const cards = Object.values(state.cards);
  return {
    reviews: state.reviews,
    learned: cards.filter((card) => card.reps > 0).length,
    mature: cards.filter((card) => card.box >= 4).length,
  };
}

export function resetCards(ids) {
  if (ids) ids.forEach((id) => delete state.cards[id]);
  else state.cards = {};
  commit();
}

export function resetEverything() {
  state = EMPTY();
  commit();
}

export { STORAGE_KEY };
