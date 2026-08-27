# Open-Source Contributor Guide: Adding High-Quality Tests & Questions

Thank you for contributing to **QuizFlow**!

Our platform goal is **editorial quality and conceptual clarity**, **NOT** generating thousands of low-effort, AI-scraped, or low-quality questions.

Every question submitted to QuizFlow must meet our **Content Quality Standards** and pass automated heuristic validation and human peer review.

---

## 1. Core Principles of High-Quality Questions

Every question must fulfill these 8 quality criteria:

1. **Clear, Unambiguous Wording**:
   - The question stem must clearly state the problem without trick questions or ambiguous terminology.
   - Avoid double negatives (e.g. *"Which of the following is NOT uncommon...?"*).
2. **Exactly One Unambiguous Correct Answer**:
   - There must be no controversy over the correct answer among domain experts.
   - The correct answer must be completely accurate and self-contained.
3. **Plausible Distractors (Wrong Answers)**:
   - Distractors should reflect common conceptual mistakes, misconceptions, or false assumptions made by real practitioners.
   - Avoid nonsensical, joke, or obviously impossible options.
   - Keep options approximately equal in length, grammatical structure, and tone so the correct answer does not stand out simply by being longer or more detailed.
4. **Educational, Actionable Explanation**:
   - The explanation must explain **why** the correct option is right **and why** common distractors are wrong.
   - Generic placeholder text (e.g. *"This is correct"*, *"See above"*, *"Because it is right"*) is automatically rejected by our validator.
5. **Specific Domain Topic**:
   - Assign a concrete, meaningful domain topic (e.g. `Indexing`, `Memory Allocation`, `Event Loop`, `Normalization`), not vague placeholders like `General` or `Basics`.
6. **Calibrated Difficulty**:
   - **Beginner**: Fundamental definitions, basic syntax, and standard usage.
   - **Intermediate**: Practical debugging, edge cases, trade-offs, and multi-step reasoning.
   - **Advanced**: Internal architecture, performance profiling, deep protocol quirks, and complex system designs.
7. **Relevant Search Tags**:
   - Provide 2 to 5 relevant technical tags (e.g. `["PostgreSQL", "B-Tree", "Optimization"]`).
8. **Realistic Estimated Solving Time**:
   - Specify `estimatedTime` in seconds (typically 30–90 seconds for multiple-choice questions).

---

## 2. Policy on AI-Generated Content

> [!IMPORTANT]
> **No Unchecked AI Content in Production:**
> We do not accept raw, unchecked LLM bulk dumps. AI tools may be used as authoring aids for draft formatting, but every question must be:
> 1. Manually verified and curated by a human contributor with domain experience.
> 2. Checked against real documentation and practical compilers/engines.
> 3. Subject to human peer review prior to merge.

---

## 3. Automated Content Validation Rules

When you run `npm run validate:content` or `npm test`, our automated `ContentValidatorService` checks:

| Quality Rule | Severity | What is Flagged |
|---|---|---|
| **Duplicate / Near-Duplicate Prompts** | `Warning / Error` | Exact duplicate question text or questions with $\ge 85\%$ word similarity. |
| **Duplicate Option IDs / Texts** | `Error` | Identical options within the same question. |
| **Weak / Placeholder Explanations** | `Warning / Error` | Explanations $< 15$ characters or containing phrases like *"this is correct"*, *"obviously"*, etc. |
| **Missing / Invalid Correct Answer** | `Error` | `correctAnswer` that does not match an option ID. |
| **Missing Topic / Short Topic** | `Error / Warning` | Questions lacking a specific domain topic. |
| **Suspicious Duration & Timing** | `Warning` | Tests with $< 15\text{s}$ or $> 5\text{min}$ average time per question, or questions with $< 5\text{s}$ estimated time. |
| **Category & Slug Integrity** | `Error` | Slugs must be lowercase kebab-case and unique across the repository. |

---

## 4. Question Example: Anatomy of a High-Quality Question

```typescript
{
  id: 'q-sql-opt-1',
  question: 'When creating a composite index on columns `(status, created_at, user_id)`, which query will **NOT** utilize the index efficiently?',
  type: 'single-choice',
  options: [
    {
      id: 'opt-sql-1a',
      text: '`SELECT * FROM orders WHERE created_at > NOW() - INTERVAL \'7 days\';`',
    },
    {
      id: 'opt-sql-1b',
      text: '`SELECT * FROM orders WHERE status = \'shipped\' AND created_at > NOW() - INTERVAL \'7 days\';`',
    },
    {
      id: 'opt-sql-1c',
      text: '`SELECT * FROM orders WHERE status = \'pending\';`',
    },
    {
      id: 'opt-sql-1d',
      text: '`SELECT * FROM orders WHERE status = \'completed\' AND created_at > NOW() - INTERVAL \'1 day\' AND user_id = 42;`',
    },
  ],
  correctAnswer: 'opt-sql-1a',
  explanation: 'B-tree composite indexes obey the **leftmost prefix rule**. A query filtering only on `created_at` skips the leading indexed column (`status`), forcing the query engine to perform a full index or table scan rather than an efficient index seek.',
  hint: 'Remember the leftmost prefix rule in B-tree composite indexing.',
  difficulty: 'intermediate',
  topic: 'Indexing',
  concept: 'Composite Indexes',
  tags: ['SQL', 'PostgreSQL', 'Performance', 'Indexing'],
  estimatedTime: 45,
  points: 1,
}
```

---

## 5. Pre-Submission Checklist

Before submitting a Pull Request:

1. [ ] **Run Content Quality Validator**:
   ```bash
   npm run validate:content
   ```
2. [ ] **Run the Automated Test Suite**:
   ```bash
   npm test
   ```
3. [ ] **Check Types**:
   ```bash
   npm run typecheck
   ```
4. [ ] **Verify Explanations**: Ensure every explanation is actionable and educational.
5. [ ] **Ensure Topic Alignment**: Confirm every question has a clear, non-generic domain topic.
