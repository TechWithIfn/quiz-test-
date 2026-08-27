# Adaptive Learning Engine — Algorithm Documentation

## Overview

The adaptive learning engine is an **optional**, client-side system that uses locally stored performance data to select questions more intelligently during "adaptive practice" sessions. It does **not** interfere with normal fixed quizzes.

### What This Is

- A heuristic question-selection system based on local performance history
- A simple mastery estimation that categorizes topics into rough proficiency buckets
- A difficulty manager that nudges the difficulty up or down based on recent results

### What This Is NOT

- Not a scientifically validated psychometric model
- Not Item Response Theory (IRT)
- Not spaced repetition (SRS) — there are no interval calculations
- Not machine learning or AI — it's deterministic weighted scoring
- Not a certified proficiency assessment

---

## Mastery Score Formula

Each topic receives a **mastery score** (0–100) computed from four weighted factors:

```
masteryScore = overallAccuracy × 40
             + recentAccuracy  × 35
             + volumeFactor    × 15
             − mistakePenalty  × 10
```

### Factors

| Factor | Weight | Range | Description |
|---|---|---|---|
| **Overall Accuracy** | 40% | 0–1 | `totalCorrect / totalAttempts` across all time |
| **Recent Accuracy** | 35% | 0–1 | Correct ratio in the most recent N attempts (sliding window) |
| **Volume Factor** | 15% | 0–1 | `min(1, totalAttempts / 10)` — partial credit for having more data |
| **Mistake Penalty** | 10% | 0–1 | `min(1, repeatedMistakeCount / totalAttempts)` — penalizes persistent errors |

The raw score is clamped to [0, 100] and rounded to an integer.

### Mastery Levels

The numeric score maps to a conceptual level:

| Level | Score Range | Rough Meaning |
|---|---|---|
| **Unknown** | 0 (no attempts) | No data available for this topic |
| **Learning** | 1–30 | Few attempts, mostly incorrect, or very recent |
| **Developing** | 31–60 | Some correct answers but inconsistent |
| **Strong** | 61–85 | Consistently correct, reasonable speed |
| **Mastered** | 86–100 | High accuracy sustained over multiple attempts |

> **These thresholds are tunable heuristics**, not scientifically calibrated boundaries. They exist only to drive internal question-selection priority.

---

## Question Selection Algorithm

### Step 0: No Data Fallback

If the user has no performance history at all (`totalQuestionsAnswered === 0`), the algorithm simply shuffles the entire pool and returns the first N questions. No adaptive behavior is possible without data.

### Step 1: Score All Questions

Every question in the pool receives a **priority score** — a sum of weighted factors:

#### 1a. Topic Mastery Factor

Based on the topic's mastery level:

| Topic Mastery | Priority Bonus |
|---|---|
| Unknown | +25 |
| Learning | +30 × `weakTopicWeight` (default: ×3 = +90) |
| Developing | +20 |
| Strong | +5 (flagged as retention) |
| Mastered | +2 (flagged as retention) |

If no topic profile exists (topic never encountered), the question gets +25.

#### 1b. Question Mastery Factor

Based on the individual question's answer history:

| Question Mastery | Priority Bonus |
|---|---|
| Unknown | +20 |
| Learning | +25 |
| Developing | +15 |
| Strong | +3 |
| Mastered | +1 |

Never-attempted questions get +20.

#### 1c. Repeated Mistake Bonus

If the question appears as a repeated mistake in the mistake repository (answered incorrectly 2+ times across different attempts):

```
priority += repeatedMistakeBonus  (default: +15)
```

#### 1d. Difficulty Alignment

Based on how well the question's difficulty matches the recommended difficulty:

| Alignment | Bonus |
|---|---|
| Exact match | +10 |
| One step away | +4 |
| Two steps away | +0 |

#### 1e. Recency Penalty

If the question has been answered correctly `recencyDecayThreshold` or more times consecutively:

```
priority -= consecutiveCorrect × 3
```

This prevents drilling questions the user has clearly recovered on.

### Step 2: Ensure Weak Topic Coverage

Before filling general slots, the algorithm guarantees at least one question from each **weak topic** (topics with mastery level "learning" or "unknown"). The highest-priority question for each weak topic is selected first.

### Step 3: Fill Retention Slots

A configurable fraction of slots (`retentionRatio`, default: 20%) is reserved for questions from "strong" or "mastered" topics. This provides periodic reinforcement of known material.

### Step 4: Fill Remaining Slots

All remaining slots are filled from the globally sorted priority list, skipping any already-selected questions (no duplicates).

### Step 5: Shuffle

The final selection is shuffled using the provided `RandomSource` for a non-predictable presentation order.

---

## Difficulty Management

### Recommended Difficulty Computation

The engine examines the user's recent overall performance window to decide whether to shift difficulty:

```
if recent accuracy ≥ 0.8 over 10+ questions → recommend "advanced"
if recent accuracy ≤ 0.4 over 10+ questions → recommend "beginner"
otherwise                                   → recommend "intermediate"
```

The minimum question threshold (`minQuestionsForDifficultyShift`, default: 10) prevents premature shifts from small sample sizes.

### Difficulty Never Excludes

Difficulty alignment adds a **priority bonus**, not a filter. Questions at non-recommended difficulty levels still appear — they're just deprioritized. This ensures:
- Beginners still see some harder questions for stretch
- Advanced learners still see easier questions for retention
- The pool is never artificially restricted

---

## Tunable Parameters

All parameters have sensible defaults and can be overridden via `AdaptiveSelectionConfig`:

| Parameter | Default | Description |
|---|---|---|
| `retentionRatio` | 0.2 | Fraction of slots for mastered-topic retention |
| `recentWindowSize` | 10 | How many recent answers to consider |
| `difficultyUpThreshold` | 0.8 | Accuracy above which difficulty increases |
| `difficultyDownThreshold` | 0.4 | Accuracy below which difficulty decreases |
| `minQuestionsForDifficultyShift` | 10 | Minimum recent answers before shifting difficulty |
| `weakTopicWeight` | 3.0 | Multiplier for weak-topic priority |
| `repeatedMistakeBonus` | 15 | Extra priority for repeated mistakes |
| `recencyDecayThreshold` | 2 | Consecutive correct before recency penalty applies |

---

## Data Sources

All data comes from existing localStorage stores — no new storage is introduced:

| Data | Source | Used For |
|---|---|---|
| `TestResult[]` | `useHistoryStore.results` | Topic/question accuracy, time tracking |
| `MistakeRecord[]` | `mistakeRepository.getAll()` | Repeated mistake identification |
| `Question[]` | `contentService.getQuestionsForTest()` | Pool definition, topic/difficulty metadata |

---

## Non-Interference Guarantee

The adaptive engine:

1. Lives in `src/engine/adaptive/` — completely separate from `src/engine/quizEngine.ts`
2. Has **zero imports** from stores, services, or React
3. Accepts data as pure function arguments
4. Never reads or writes localStorage
5. The existing `createAttempt()` function is not modified — adaptive sessions pass pre-selected questions into the existing function
6. Fixed quiz modes (`full-test`, `single-question`, `mistake-practice`, `custom-test`) are completely unaffected

---

## Limitations

1. **Cold start**: With no history, the engine can't adapt. It falls back to random selection.
2. **Single-test scope**: Currently operates within a single test's question pool. Cross-test adaptive mode is a future extension.
3. **No time-based spacing**: This is not spaced repetition. The engine doesn't schedule reviews at optimal intervals.
4. **Session-bounded**: Each adaptive session is independent. There's no multi-session learning curve tracking beyond what the existing result history provides.
5. **Heuristic thresholds**: All mastery boundaries are educated guesses, not empirically validated. They will need tuning based on real usage patterns.
