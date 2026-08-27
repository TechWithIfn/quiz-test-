import { TestCategory } from '@/types'

export const APP_CONFIG = {
  storageSchemaVersion: 1,
  name: 'QuizFlow',
  tagline: 'Open-Source, No-Login Test Platform',
  description: 'Search any topic, start immediately, assess your knowledge, and review in-depth explanations. No accounts, no personal info, zero friction.',
  version: '1.0.0',
  githubUrl: '',
  storageKeys: {
    theme: 'quizflow_theme_mode_v1',
    history: 'quizflow_attempt_history_v1',
    activeAttempt: 'quizflow_active_attempt_v1',
    activeQuestions: 'quizflow_active_questions_v1',
    mistakes: 'quizflow_mistakes_v1',
    customTests: 'quizflow_custom_tests_v1',
    bookmarks: 'quizflow_bookmarks_v1',
  },
  defaultPassingScore: 70, // %
} as const

export const TEST_CATEGORIES: TestCategory[] = [
  {
    id: 'cat-programming', name: 'Programming', slug: 'programming',
    description: 'Core programming languages, algorithms, and software development fundamentals.', icon: 'Code2', color: '#2563eb'
  },
  {
    id: 'cat-data-analytics', name: 'Data & Analytics', slug: 'data-analytics',
    description: 'SQL, spreadsheets, reporting, statistics, and practical data analysis.', icon: 'BarChart3', color: '#0891b2'
  },
  {
    id: 'cat-office-productivity', name: 'Office & Productivity', slug: 'office-productivity',
    description: 'Excel, documents, presentations, and practical workplace tools.', icon: 'BriefcaseBusiness', color: '#16a34a'
  },
  {
    id: 'cat-aptitude', name: 'Aptitude', slug: 'aptitude',
    description: 'Quantitative aptitude, patterns, and practical problem solving.', icon: 'BrainCircuit', color: '#ea580c'
  },
  {
    id: 'cat-reasoning', name: 'Reasoning', slug: 'reasoning',
    description: 'Critical thinking, logic, evidence evaluation, and decision making.', icon: 'Lightbulb', color: '#db2777'
  },
  {
    id: 'cat-english', name: 'English', slug: 'english', description: 'Grammar, vocabulary, reading, and written communication.', icon: 'Languages', color: '#7c3aed'
  },
  {
    id: 'cat-interview-preparation', name: 'Interview Preparation', slug: 'interview-preparation', description: 'Role-specific and technical interview practice.', icon: 'UserRoundCheck', color: '#9333ea'
  },
  {
    id: 'cat-competitive-exams', name: 'Competitive Exams', slug: 'competitive-exams', description: 'Exam-style quantitative, verbal, and general awareness practice.', icon: 'Medal', color: '#ca8a04'
  },
  {
    id: 'cat-general-knowledge', name: 'General Knowledge', slug: 'general-knowledge', description: 'Useful facts across history, geography, civics, and culture.', icon: 'Globe2', color: '#0f766e'
  },
  {
    id: 'cat-science', name: 'Science', slug: 'science', description: 'Foundational biology, chemistry, physics, and scientific reasoning.', icon: 'FlaskConical', color: '#059669'
  },
  {
    id: 'cat-mathematics', name: 'Mathematics', slug: 'mathematics', description: 'Arithmetic, algebra, geometry, probability, and quantitative reasoning.', icon: 'Sigma', color: '#dc2626'
  },
  {
    id: 'cat-web-development', name: 'Web Development', slug: 'web-development', description: 'HTML, CSS, browser APIs, accessibility, and web performance.', icon: 'Globe', color: '#0284c7'
  },
  {
    id: 'cat-database', name: 'Database', slug: 'database', description: 'Relational queries, data modeling, indexing, and transactions.', icon: 'Database', color: '#0369a1'
  },
  {
    id: 'cat-cybersecurity', name: 'Cybersecurity', slug: 'cybersecurity', description: 'Security fundamentals, threats, authentication, and safe systems.', icon: 'ShieldCheck', color: '#475569'
  },
  {
    id: 'cat-cloud-devops', name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'Deployment, containers, CI/CD, observability, and cloud foundations.', icon: 'CloudCog', color: '#4f46e5'
  }
]
