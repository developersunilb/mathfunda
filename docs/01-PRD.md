# MathsFunda Interactive — Product Requirements Document (PRD)

**Product:** MathsFunda Interactive — CBSE maths lesson layer for iPad/tablet
**Audience:** CBSE Class 9 students (~14–15 years) learning on iPad
**Goal:** Make lessons interactive, motivating, and memorable so children want to learn and formulas etch into long-term memory.
**Status:** Draft v1
**Owner:** Product

## 1. Problem statement

Children opening static Markdown/PDF maths notes on iPad disengage quickly. Lessons feel like textbooks: long walls of text, KaTeX formulas that are hard to inspect, no feedback, no progress, no reason to return. Formulas are not etched because there is no retrieval, no manipulation, and no celebration of mastery.

## 2. Objectives & success metrics

| Objective | Success metric |
|---|---|
| Make every lesson touch-interactive on iPad | ≥ 70% of lessons include ≥ 1 interactive widget (slider, drag-drop, sketch, toggle) |
| Motivate repeat sessions | ≥ 40% 7-day return rate; average streak ≥ 5 days |
| Etch formulas in memory | ≥ 80% of students score ≥ 80% on spaced-repetition flashcard reviews after 2 weeks |
| Keep parents informed, children safe | Parent gate on answer keys; zero PII collected from minors |
| Work offline on iPad (installed via Home Screen) | Full lesson + progress usable without network after first visit |

## 3. User personas

- **Student (child):** opens app from Home Screen, picks a lesson, taps through concepts, gets instant feedback, earns streaks/badges, reviews due flashcards.
- **Parent / guardian:** unlocks answer keys, views child's progress summary, sets daily goal.
- **Teacher (optional):** assigns a lesson, views class completion (future phase).

## 4. In scope (MVP)

- Interactive lesson player on iPad (swipe pages, tap-to-reveal steps, drag-drop algebra, geometry sketchpad, formula slider)
- Per-lesson completion + streak + badge state in localStorage (offline-first)
- Spaced-repetition flashcard deck tied to formulas (SM-2, existing `progress.js`)
- Formula vault with tap-to-expand derivation and "fill-in-the-blank" recall
- Parent-gated answer key (existing `admin.html`/reader password pattern)
- Offline PWA installable to iPad Home Screen (existing vite-plugin-pwa)
- Celebration animation on lesson completion (Motion primitives)

## 5. Out of scope (v1)

- Real-time multiplayer, live classes, video content
- Backend sync across devices (v1 is per-device; sync is v2)
- AI-generated lesson content (AI used only for optional hints, see guard rails)
- Native App Store distribution (PWA only)

## 6. Non-functional requirements

- iPad Safari first; responsive down to phone
- Touch targets ≥ 44 px; no hover-only interactions
- First paint < 1.5 s on iPad over 4G
- Works offline after install
- All math rendered with KaTeX; formulas inspectable (tap to zoom)

## 7. Open questions

- Confirm class level (Class 9 vs multi-class)
- Confirm whether v2 adds cross-device sync (requires backend)
