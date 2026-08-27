# QuizFlow — Open-Source Client-Side Online Test Platform

QuizFlow is a high-performance, open-source online test and assessment platform built for maximum speed, privacy, and frictionless learning. 

Unlike traditional test sites, QuizFlow requires **no signups, no logins, no email inputs, and has zero server dependencies**. Everything runs entirely on the client side.

```
Search → Find Test → Start → Answer → Result → Review → Improve → Take Another Test
```

---

## 🌟 Key Features

- 🔒 **Zero Authentication / Zero Logins**: No accounts, no cookies, no profiling, and zero personal data collection.
- ⚡ **100% Client-Side Engine**: Scoring, timers, state transitions, and result generation work offline.
- 🧠 **Optional Adaptive Learning Engine**: A localized practice engine prioritizing weak topics, ramping difficulty, and avoiding unnecessary repetition using browser-local performance data.
- 🔄 **State Recovery & Reload Resilience**: Protects test progress against accidental page refreshes.
- 🛠️ **Custom Test Builder**: Create and configure custom assessments locally.
- 📑 **Comprehensive Explanations**: Review detailed answers and educational rationales for every question.
- 🔍 **Search-First Design**: Instantly find tests with Fuse.js client-side fuzzy search.
- 🌐 **SEO-Optimized**: Serverless friendly with unique canonical URLs, dynamic XML sitemaps, robots.txt, and JSON-LD structured data.
- ♿ **Keyboard Navigation**: Accessible runners using keyboard shortcuts (`1`-`4` or `A`-`D` to select, `F` to flag, arrows to navigate).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm / pnpm / yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/quizflow.git
   cd quizflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the local dev server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Run unit and integration tests:
   ```bash
   npm run test
   ```

---

## 📐 Architecture & Technology Stack

QuizFlow is built with a decoupled repository pattern to isolate presentation from the content layer:

- **Core Framework**: React 18 & TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **State Management**: Zustand
- **Fuzzy Search**: Fuse.js
- **Mathematical Equations**: LaTeX support via KaTeX (`remark-math`, `rehype-katex`)
- **Storage Layer**: Versioned envelopes in LocalStorage
- **Tests**: Vitest with JSDOM environment

```
src/
├── types/             # Core domain models (Test, Question, Attempt, Result)
├── config/            # Constants, taxonomy, and version configurations
├── engine/            # Pure state transition rules (Quiz & Adaptive engines)
├── services/          # Data access providers (Storage, Mistakes, Content, Test)
├── store/             # Zustand state machines (Quiz session, History, Theme)
├── components/        # Reusable UI component system
├── features/          # Domain-specific features (Quiz, Results, Search, Recommendations)
└── pages/             # Main route pages
```

---

## 🧠 Client-Side Adaptive Learning Engine

QuizFlow features an optional client-side adaptive practice engine that operates in `src/engine/adaptive/` using pure, stateless functions.

### How It Works
1. **Mastery score calculation**: Combines overall accuracy, recent accuracy, attempt volume, and mistake penalties into a 0–100 heuristic mastery category (`unknown` → `learning` → `developing` → `strong` → `mastered`).
2. **Priority selection**: Prioritizes unseen questions and weak topics, reserves ~20% of slots for reinforcement of mastered topics (retention), and applies a priority penalty for heavily drilled questions.
3. **Difficulty ramping**: Increases recommended difficulty if recent accuracy exceeds 80%, and decreases difficulty if recent accuracy drops below 40%.

*Note: The mastery score is a lightweight heuristic to support practice recommendations and is not a certified psychometric measure.*

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Adding New Tests
To add standard static tests, create a new TS file under `src/data/tests/<category>/` defining your test layout, register it in `src/data/tests/index.ts`, and run validation:
```bash
npm run validate:content
```

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
