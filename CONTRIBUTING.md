# Contributing to QuizFlow

Thank you for your interest in contributing to QuizFlow! We are excited to build a high-quality, free, open-source online test platform together.

---

## 📜 Code of Conduct

Please be respectful, professional, and welcoming to all contributors.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs & Suggesting Features
- Open an issue describing the bug or feature request.
- Provide step-by-step reproduction instructions and your environment details.

### 2. Code Contributions
- Fork the repository and create a branch: `git checkout -b feature/your-feature-name`.
- Write tests to cover your changes.
- Ensure the project builds and all tests pass:
  ```bash
  npm run build
  npm run test
  ```
- Open a Pull Request referencing the related issue.

---

## 📝 Test Authorship Guidelines

To add a new static test:
1. Create a file under `src/data/tests/<category>/` (e.g., `src/data/tests/programming/pythonAdvanced.ts`).
2. Define the test structure and questions using the `buildExpandedTest` helper.
3. Import and add your test export in `src/data/tests/index.ts`.
4. Validate the content format:
   ```bash
   npm run validate:content
   ```

To ensure test quality, refer to [docs/CONTRIBUTING_TESTS.md](./docs/CONTRIBUTING_TESTS.md).
