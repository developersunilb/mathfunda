# MathsFunda Interactive — App Flow Document

**Product:** Interactive CBSE maths lessons (iPad-first)  
**Scope:** User navigation + screen navigation  
**Version:** v1

## 1. Navigation principles

- iPad-first: bottom tab bar for primary sections; swipe gestures inside lessons
- Phone-safe: same screens reflow to single column; bottom tabs still reachable
- No account required to start; parent gate only for answer keys
- Every screen reachable within 2 taps from Home Screen launch

## 2. Screen inventory

| Screen | Path | Purpose | Entry points |
|---|---|---|---|
| Landing / Home | `index.html` | Five stages, next lesson, today's panel, streak badge | App launch |
| Stage picker | `learn.html?stage=<id>` | Choose stage; continue/review stage; lesson list | Home → stage |
| Lesson reader | `reader.html?ch=<slug>` | Interactive lesson: swipe pages, tap-to-reveal, widgets | Stage → lesson |
| Interactive widget overlay | inline in reader | Slider, drag-drop algebra, geometry sketch, formula recall | Inside lesson page |
| Practice / quiz | `reader.html?ch=<slug>&practice=1` | Formula fill-in-the-blank, quick check | Lesson → practice |
| Flashcards | `flashcards.html` | Spaced-repetition decks, rating 0–3 | Home / lesson / today |
| Formula vault | `formulas.html` | Searchable formula table, tap-to-expand derivation | Home / lesson |
| Methods / routine | `methods.html` | 15-min memorisation routine, evidence guide | Home |
| Progress / streak | inline on Home + reader | Streak, % complete, badges, due cards | Header |
| Parent gate / answer key | `reader.html?ch=diagnostic-answer-key` | Password-unlocked answers & reasoning | Parent-only link |
| Studio (authoring) | `studio.html` | Local Markdown editor, PDF/EPUB export | Admin / teacher |
| Diagnostic | `reader.html?ch=diagnostic-assessment` | 20-question placement | Start stage |
| Confirmation check | `confirmation.html` | Quick per-concept verification | Adaptive plan |

## 3. Primary navigation (bottom tab bar, iPad)

1. **Home** — stages + next lesson + today's streak card
2. **Learn** — stage picker & lesson list
3. **Practice** — due flashcards + formula recall drills
4. **Formulas** — searchable vault
5. **More** — Methods, Parent gate, Settings, About

## 4. In-lesson flow (reader)

```
Open lesson
   ├─ Swipe left/right to turn page (facing pages on wide iPad)
   ├─ Tap a concept pill → reveal step-by-step derivation (KaTeX)
   ├─ Drag-drop algebra widget → instant right/wrong + hint
   ├─ Geometry sketchpad → tap points, draw lines, measure angle
   ├─ Formula slider → change variable, see graph/table update
   ├─ "Mark page done" → progress ring updates, streak +1
   └─ Next lesson CTA → auto-advance or return to stage list
```

Completion of all pages in a lesson → celebration animation (Motion confetti) + badge unlock + "Practice now" prompt.

## 5. Flashcard flow (SM-2, existing)

```
Open Flashcards → due cards today
   ├─ Show question → tap to reveal answer
   ├─ Rate: Again / Hard / Good / Easy
   ├─ Card rescheduled (box 1–6)
   └─ Daily goal met → streak +1, badge check
```

## 6. Parent gate flow

```
Tap "Parent answers" → password modal
   ├─ Correct → unlock answer key for session (localStorage flag)
   ├─ Wrong ×3 → cooldown 15 min, nudge to ask teacher
   └─ Unlock persists until browser data cleared (per-device, convenience only)
```

## 7. Offline behaviour

- All screens above precached by Service Worker after first visit
- Progress writes to `localStorage`; no network required
- Parent gate password checked client-side (existing limitation — documented in Security doc)
- On reconnect (v2): queue sync; v1 shows "your progress stays on this iPad"

## 8. Edge states

| State | Behaviour |
|---|---|
| First launch | Show 3-slide onboarding: swipe to turn, tap to reveal, earn streaks |
| No due cards | "All caught up — try a lesson" CTA |
| 100% stage complete | "Review stage" instead of "Start stage" |
| Storage full/blocked | Silent fail; progress not persisted, banner "progress not saved on this device" |
| iPad rotated | Reader toggles facing-pages (wide) ↔ single page (narrow) |
