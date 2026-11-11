import "katex/dist/katex.min.css";
import { renderMarkdown } from "./markdown.js";
import { decks, deckById, cardsForDecks, allCards } from "./flashcard-data.js";
import {
  cardState,
  dueCount,
  newCount,
  relativeDue,
  resetCards,
  reviewCard,
  reviewStats,
  streakDays,
} from "./progress.js";
import "../css/site.css";

const params = new URLSearchParams(location.search);
const requestedDeck = params.get("deck");
const startDeck = requestedDeck && deckById[requestedDeck] ? requestedDeck : null;

const deckView = document.querySelector("#deck-view");
const reviewView = document.querySelector("#review-view");
const doneView = document.querySelector("#review-done");
const deckGrid = document.querySelector("#deck-grid");
const flashcard = document.querySelector("#flashcard");
const frontEl = document.querySelector("#card-front");
const backEl = document.querySelector("#card-back");
const hintEl = document.querySelector("#card-hint");
const promptEl = document.querySelector("#card-prompt");
const sideLabel = document.querySelector("#card-side-label");
const ratingRow = document.querySelector("#rating-row");
const reviewDeck = document.querySelector("#review-deck");
const reviewCount = document.querySelector("#review-count");
const reviewBar = document.querySelector("#review-bar-fill");
const reviewProgressText = document.querySelector("#review-progress-text");

let session = null;

/* ------------------------------------------------------------------ Stats */

function refreshStats() {
  const due = dueCount(allCards.map((card) => card.id));
  const stats = reviewStats();
  document.querySelector("#stat-due").textContent = String(due);
  document.querySelector("#stat-learned").textContent = String(stats.learned);
  document.querySelector("#stat-mature").textContent = String(stats.mature);
  document.querySelector("#stat-streak").textContent = String(streakDays());
}

/* -------------------------------------------------------------- Deck grid */

function renderDecks() {
  deckGrid.innerHTML = "";

  decks.forEach((deck) => {
    const ids = deck.cards.map((card) => card.id);
    const due = dueCount(ids);
    const fresh = newCount(ids);
    const started = ids.length - fresh;
    const percent = Math.round((started / ids.length) * 100);

    const card = document.createElement("article");
    card.className = "deck-card";
    card.innerHTML = `
      <div class="deck-card-top">
        <span class="deck-stage">${stageLabel(deck.stage)}</span>
        <span class="deck-count">${ids.length} cards</span>
      </div>
      <h3>${deck.title}</h3>
      <p>${deck.subtitle}</p>
      <div class="deck-meter" role="img" aria-label="${percent}% of cards started">
        <span style="width: ${percent}%"></span>
      </div>
      <div class="deck-foot">
        <span class="deck-due">${due ? `${due} ready` : "Nothing due"}</span>
        <button class="deck-start" type="button" data-deck="${deck.id}">
          ${due ? "Review" : fresh ? "Start" : "Practice"} →
        </button>
      </div>
    `;
    deckGrid.appendChild(card);
  });

  deckGrid.querySelectorAll("[data-deck]").forEach((button) => {
    button.addEventListener("click", () => startSession([button.dataset.deck]));
  });

  refreshStats();
}

function stageLabel(stage) {
  return (
    {
      start: "START",
      foundations: "FOUNDATION",
      part1: "CLASS 9 · PART 1",
      part2: "CLASS 9 · PART 2",
      enrichment: "ENRICHMENT",
    }[stage] || "DECK"
  );
}

/* --------------------------------------------------------------- Session */

function startSession(deckIds) {
  const cards = cardsForDecks(deckIds);
  const now = Date.now();

  const due = cards.filter((card) => {
    const state = cardState(card.id);
    return state.reps > 0 && state.due <= now;
  });
  const fresh = cards.filter((card) => cardState(card.id).reps === 0);
  const newLimit = deckIds.length === 1 ? 10 : 12;
  const queue = shuffle([...due, ...fresh.slice(0, newLimit)]);

  if (queue.length === 0) {
    showEmpty(cards);
    return;
  }

  session = {
    deckIds,
    queue,
    index: 0,
    reviewed: 0,
    ratings: [0, 0, 0, 0],
    revealed: false,
    startedAt: Date.now(),
  };

  deckView.hidden = true;
  doneView.hidden = true;
  reviewView.hidden = false;

  reviewDeck.textContent =
    deckIds.length === 1 ? deckById[deckIds[0]].title : "All topics";

  showCard();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

function showCard() {
  if (!session) return;
  if (session.index >= session.queue.length) {
    finishSession();
    return;
  }

  const card = session.queue[session.index];
  session.revealed = false;

  frontEl.innerHTML = renderMarkdown(card.front);
  backEl.innerHTML = renderMarkdown(card.back);
  backEl.hidden = true;
  hintEl.textContent = card.hint ? `Hint: ${card.hint}` : "";
  sideLabel.textContent = "QUESTION";
  promptEl.textContent = "Tap to reveal the answer";
  ratingRow.hidden = true;
  flashcard.classList.remove("is-revealed");

  reviewCount.textContent = `Card ${session.index + 1} of ${session.queue.length}`;
  reviewBar.style.width = `${(session.index / session.queue.length) * 100}%`;
  reviewProgressText.textContent = `${session.reviewed} answered`;

  updateRatingTimes(card);
}

function updateRatingTimes(card) {
  const state = cardState(card.id);
  // Preview the next interval for each rating without changing the card.
  const boxHard = Math.max(1, state.box - 1);
  const boxGood = Math.min(6, state.box + 1);
  const boxEasy = Math.min(6, state.box + 2);
  const days = [0, 1, 3, 7, 16, 35];
  const hard = boxHard === 1 ? 0.5 : days[boxHard - 1] * 0.6;

  document.querySelector("#rating-hard-time").textContent = humanInterval(hard);
  document.querySelector("#rating-good-time").textContent = humanInterval(days[boxGood - 1]);
  document.querySelector("#rating-easy-time").textContent = humanInterval(days[boxEasy - 1]);
}

function humanInterval(days) {
  if (days < 1 / 24) return "10 min";
  if (days < 1) return `${Math.round(days * 24)} hr`;
  if (days < 30) return `${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`;
  return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? "" : "s"}`;
}

function reveal() {
  if (!session || session.revealed) return;
  session.revealed = true;
  backEl.hidden = false;
  sideLabel.textContent = "ANSWER";
  promptEl.textContent = "How well did you know it?";
  ratingRow.hidden = false;
  flashcard.classList.add("is-revealed");
}

function rate(rating) {
  if (!session || !session.revealed) return;
  const card = session.queue[session.index];
  const result = reviewCard(card.id, rating);
  session.ratings[rating] += 1;
  session.reviewed += 1;

  if (rating === 0) {
    // Bring a missed card back at the end of this session.
    session.queue.push(card);
  }

  session.index += 1;
  refreshStats();

  if (session.index >= session.queue.length) {
    finishSession(result);
  } else {
    showCard();
  }
}

function finishSession() {
  if (!session) return;
  const minutes = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));

  reviewView.hidden = true;
  doneView.hidden = false;

  document.querySelector("#done-copy").textContent = `You answered ${session.reviewed} card${
    session.reviewed === 1 ? "" : "s"
  } in about ${minutes} minute${minutes === 1 ? "" : "s"}. The cards you found hard will return first.`;

  const [again, hard, good, easy] = session.ratings;
  document.querySelector("#done-stats").innerHTML = `
    <div><strong>${good + easy}</strong><span>remembered</span></div>
    <div><strong>${again + hard}</strong><span>needs work</span></div>
    <div><strong>${session.reviewed}</strong><span>reviewed</span></div>
  `;

  document.querySelector("#done-title").textContent =
    again === 0 && hard <= 1 ? "Strong session." : "Progress is progress.";

  session = null;
  refreshStats();
}

function showEmpty(cards) {
  const next = cards
    .map((card) => cardState(card.id).due)
    .filter((due) => due > Date.now())
    .sort((a, b) => a - b)[0];

  deckView.hidden = true;
  reviewView.hidden = true;
  doneView.hidden = false;
  document.querySelector("#done-title").textContent = "Nothing due right now.";
  document.querySelector("#done-copy").textContent = next
    ? `The next card is due ${relativeDue(next)}. Spacing is the point — come back then, or read a lesson in the meantime.`
    : "Start a different deck from the list.";
  document.querySelector("#done-stats").innerHTML = "";
}

/* ----------------------------------------------------------------- Events */

flashcard.addEventListener("click", () => {
  if (session?.revealed) return;
  reveal();
});

document.querySelectorAll("[data-rating]").forEach((button) => {
  button.addEventListener("click", () => rate(Number(button.dataset.rating)));
});

document.querySelector("#review-exit").addEventListener("click", () => {
  session = null;
  reviewView.hidden = true;
  doneView.hidden = true;
  deckView.hidden = false;
  refreshStats();
  window.scrollTo({ top: 0, behavior: "instant" });
});

document.querySelector("#review-all-button").addEventListener("click", () => {
  startSession(decks.map((deck) => deck.id));
});

document.querySelector("#done-again").addEventListener("click", () => {
  doneView.hidden = true;
  deckView.hidden = false;
  renderDecks();
  window.scrollTo({ top: 0, behavior: "instant" });
});

document.querySelector("#reset-cards").addEventListener("click", () => {
  const sure = window.confirm("Reset all flashcard scheduling on this device? Reading progress is kept.");
  if (!sure) return;
  resetCards();
  renderDecks();
});

document.addEventListener("keydown", (event) => {
  if (reviewView.hidden) return;
  if (event.target.closest("input, textarea")) return;

  if (event.code === "Space" || event.key === "Enter") {
    event.preventDefault();
    if (!session?.revealed) reveal();
    else rate(2);
  } else if (["1", "2", "3", "4"].includes(event.key) && session?.revealed) {
    event.preventDefault();
    rate(Number(event.key) - 1);
  } else if (event.key === "Escape") {
    document.querySelector("#review-exit").click();
  }
});

/* ------------------------------------------------------------------- Boot */

renderDecks();

if (startDeck) {
  startSession([startDeck]);
}
