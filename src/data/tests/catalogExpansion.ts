import { RawQuestion, RawTest } from '@/types/content'

type QuestionSeed = {
  topic: string
  prompt: string
  options: string[]
  correct: number
  explanation: string
  tags?: string[]
}

const makeQuestion = (testKey: string, index: number, seed: QuestionSeed): RawQuestion => ({
  id: `q-${testKey}-${index}`,
  question: seed.prompt,
  type: 'single-choice',
  options: seed.options.map((text, optionIndex) => ({ id: `opt-${testKey}-${index}-${String.fromCharCode(97 + optionIndex)}`, text })),
  correctAnswer: `opt-${testKey}-${index}-${String.fromCharCode(97 + seed.correct)}`,
  explanation: seed.explanation,
  difficulty: 'beginner',
  topic: seed.topic,
  tags: seed.tags || [seed.topic],
})

const makeTest = (
  testKey: string,
  slug: string,
  title: string,
  shortDescription: string,
  category: { id: string; name: string; slug: string; description: string; color: string },
  language: string,
  seeds: QuestionSeed[],
  difficulty: RawTest['difficulty'] = 'beginner'
): RawTest => ({
  id: `test-${testKey}`,
  slug,
  title,
  shortDescription,
  fullDescription: `${shortDescription} Focused practice with clear explanations and realistic distractors.`,
  category: { ...category, icon: 'BookOpen' },
  tags: Array.from(new Set(seeds.flatMap((seed) => seed.tags || [seed.topic]))).map((name) => ({ id: `tag-${testKey}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') })),
  difficulty,
  estimatedMinutes: 6,
  questionCount: seeds.length,
  language,
  passingScorePercentage: 70,
  featured: false,
  createdAt: '2026-03-01T00:00:00.000Z',
  questions: seeds.map((seed, index) => makeQuestion(testKey, index + 1, seed)),
})

const programming = { id: 'cat-programming', name: 'Programming', slug: 'programming', description: 'Core programming languages and software development fundamentals.', color: '#2563eb' }
const english = { id: 'cat-english', name: 'English', slug: 'english', description: 'Grammar, vocabulary, reading, and written communication.', color: '#7c3aed' }
const competitiveExams = { id: 'cat-competitive-exams', name: 'Competitive Exams', slug: 'competitive-exams', description: 'Exam-style quantitative, verbal, and general awareness practice.', color: '#ca8a04' }
const generalKnowledge = { id: 'cat-general-knowledge', name: 'General Knowledge', slug: 'general-knowledge', description: 'Useful facts across history, geography, civics, and culture.', color: '#0f766e' }
const science = { id: 'cat-science', name: 'Science', slug: 'science', description: 'Foundational biology, chemistry, physics, and scientific reasoning.', color: '#059669' }
const mathematics = { id: 'cat-mathematics', name: 'Mathematics', slug: 'mathematics', description: 'Arithmetic, algebra, geometry, probability, and quantitative reasoning.', color: '#dc2626' }
const webDevelopment = { id: 'cat-web-development', name: 'Web Development', slug: 'web-development', description: 'HTML, CSS, browser APIs, accessibility, and web performance.', color: '#0284c7' }
const cybersecurity = { id: 'cat-cybersecurity', name: 'Cybersecurity', slug: 'cybersecurity', description: 'Security fundamentals, threats, authentication, and safe systems.', color: '#475569' }
const cloudDevOps = { id: 'cat-cloud-devops', name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'Deployment, containers, CI/CD, observability, and cloud foundations.', color: '#4f46e5' }

export const cProgrammingTest = makeTest('c-programming', 'c-programming-test', 'C Programming Test', 'Practice pointers, memory, arrays, and core C language behavior.', programming, 'c', [
  { topic: 'Pointers', prompt: 'What does a pointer store in C?', options: ['A memory address', 'A source file', 'A CPU instruction only', 'A type name'], correct: 0, explanation: 'A pointer stores the memory address of another object or function.' },
  { topic: 'Arrays', prompt: 'What is the first valid index of a C array?', options: ['0', '1', '-1', 'The array length'], correct: 0, explanation: 'C arrays use zero-based indexing, so the first element is at index zero.' },
  { topic: 'Memory', prompt: 'Which function releases heap memory allocated with malloc?', options: ['delete', 'release', 'free', 'clear'], correct: 2, explanation: 'The free function returns malloc-allocated memory to the C runtime.' },
])

export const cppFundamentalsTest = makeTest('cpp-fundamentals', 'cpp-fundamentals-test', 'C++ Fundamentals Test', 'Assess classes, references, RAII, and modern C++ object behavior.', programming, 'cpp', [
  { topic: 'Classes', prompt: 'What is the default access level for members of a C++ class?', options: ['public', 'private', 'protected', 'internal'], correct: 1, explanation: 'Members of a class are private by default in C++, unlike members of a struct.' },
  { topic: 'References', prompt: 'What does a C++ reference provide?', options: ['An alias for an existing object', 'A copied object always', 'A new process', 'A compile command'], correct: 0, explanation: 'A reference is an alias bound to an existing object and does not represent a separate object.' },
  { topic: 'RAII', prompt: 'What is the main idea of RAII?', options: ['Pair resource lifetime with object lifetime', 'Avoid constructors', 'Allocate everything globally', 'Disable exceptions'], correct: 0, explanation: 'RAII uses object construction and destruction to acquire and release resources safely.' },
])

export const englishGrammarTest = makeTest('english-grammar', 'english-grammar-test', 'English Grammar Test', 'Practice agreement, punctuation, verb tense, and clear sentence construction.', english, 'general', [
  { topic: 'Agreement', prompt: 'Which sentence has correct subject-verb agreement?', options: ['The list of items are long.', 'The list of items is long.', 'The list of items be long.', 'The list of items were long.'], correct: 1, explanation: 'The subject is singular list, so the singular verb is is is required.' },
  { topic: 'Punctuation', prompt: 'Which punctuation normally ends a direct question?', options: ['A comma', 'A colon', 'A question mark', 'A semicolon'], correct: 2, explanation: 'A direct question ends with a question mark.' },
  { topic: 'Tense', prompt: 'Choose the correct completion: She ___ the report yesterday.', options: ['finishes', 'finished', 'finishing', 'has finish'], correct: 1, explanation: 'Yesterday indicates a completed action in the simple past tense: finished.' },
])

export const competitiveQuantitativeTest = makeTest('competitive-quantitative', 'competitive-exams-quantitative-test', 'Competitive Exams Quantitative Test', 'Build speed with percentages, ratios, and exam-style quantitative reasoning.', competitiveExams, 'general', [
  { topic: 'Percentages', prompt: 'What is 20% of 150?', options: ['15', '20', '30', '35'], correct: 2, explanation: 'Twenty percent is one fifth, and one fifth of 150 is 30.' },
  { topic: 'Ratios', prompt: 'If boys to girls are 2:3 and there are 10 boys, how many girls are there?', options: ['12', '15', '18', '20'], correct: 1, explanation: 'The scale factor is five, so the girls count is 3 times 5, or 15.' },
  { topic: 'Averages', prompt: 'What is the average of 4, 6, and 8?', options: ['5', '6', '7', '18'], correct: 1, explanation: 'The sum is 18 and dividing by three values gives an average of 6.' },
])

export const generalKnowledgeTest = makeTest('general-knowledge', 'general-knowledge-test', 'General Knowledge Test', 'Review foundational geography, history, and civic knowledge.', generalKnowledge, 'general', [
  { topic: 'Geography', prompt: 'What is the largest ocean on Earth?', options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], correct: 2, explanation: 'The Pacific Ocean covers more area than any other ocean.' },
  { topic: 'Civics', prompt: 'What is a constitution primarily used to define?', options: ['A country\'s fundamental rules', 'Daily weather', 'Market prices', 'A family tree'], correct: 0, explanation: 'A constitution establishes the fundamental principles and structure of government.' },
  { topic: 'History', prompt: 'Which invention is most associated with Johannes Gutenberg?', options: ['The compass', 'The printing press', 'The steam engine', 'The telescope'], correct: 1, explanation: 'Gutenberg is widely associated with the movable-type printing press in Europe.' },
])

export const scienceFoundationsTest = makeTest('science-foundations', 'science-foundations-test', 'Science Foundations Test', 'Practice core concepts from biology, chemistry, and physics.', science, 'general', [
  { topic: 'Biology', prompt: 'Which structure contains most genetic material in a human cell?', options: ['Nucleus', 'Ribosome', 'Cell wall', 'Vacuole'], correct: 0, explanation: 'The nucleus contains the chromosomes that carry most of a human cell\'s genetic material.' },
  { topic: 'Chemistry', prompt: 'What is the approximate pH of a neutral solution at room temperature?', options: ['0', '5', '7', '14'], correct: 2, explanation: 'A neutral solution has a pH close to 7 at room temperature.' },
  { topic: 'Physics', prompt: 'What force pulls objects toward Earth?', options: ['Friction', 'Gravity', 'Magnetism only', 'Buoyancy'], correct: 1, explanation: 'Earth\'s gravitational attraction accelerates nearby objects toward its center.' },
])

export const mathematicsFoundationsTest = makeTest('mathematics-foundations', 'mathematics-foundations-test', 'Mathematics Foundations Test', 'Practice algebra, geometry, and probability fundamentals.', mathematics, 'general', [
  { topic: 'Algebra', prompt: 'If 2x + 4 = 10, what is x?', options: ['2', '3', '6', '7'], correct: 1, explanation: 'Subtract four and divide by two to get x equal to 3.' },
  { topic: 'Geometry', prompt: 'How many degrees are in a triangle?', options: ['90', '180', '270', '360'], correct: 1, explanation: 'The interior angles of every Euclidean triangle sum to 180 degrees.' },
  { topic: 'Probability', prompt: 'What is the probability of rolling a six on a fair six-sided die?', options: ['1/2', '1/3', '1/6', '0'], correct: 2, explanation: 'One of six equally likely outcomes is a six, giving probability one sixth.' },
])

export const webDevelopmentTest = makeTest('web-development', 'web-development-fundamentals-test', 'Web Development Fundamentals Test', 'Assess HTML semantics, CSS layout, accessibility, and browser basics.', webDevelopment, 'mixed', [
  { topic: 'HTML', prompt: 'Which HTML element represents the primary page heading?', options: ['<p>', '<h1>', '<header>', '<title>'], correct: 1, explanation: 'The h1 element represents the main visible heading of a page or section.' },
  { topic: 'CSS', prompt: 'Which CSS layout system is designed for two-dimensional rows and columns?', options: ['Float', 'Grid', 'Inline', 'Clearfix'], correct: 1, explanation: 'CSS Grid provides explicit two-dimensional row and column layout.' },
  { topic: 'Accessibility', prompt: 'What does an accessible label give a control?', options: ['A larger font only', 'A programmatic name for assistive technology', 'A faster network', 'A database key'], correct: 1, explanation: 'An accessible label provides the control name that assistive technologies can announce.' },
])

export const cybersecurityFoundationsTest = makeTest('cybersecurity-foundations', 'cybersecurity-foundations-test', 'Cybersecurity Foundations Test', 'Learn the fundamentals of authentication, threats, encryption, and safe systems.', cybersecurity, 'general', [
  { topic: 'Authentication', prompt: 'What is multi-factor authentication?', options: ['Two or more independent verification factors', 'Two passwords of the same type', 'A public username', 'A faster login'], correct: 0, explanation: 'MFA combines independent factors such as knowledge, possession, or inherence.' },
  { topic: 'Threats', prompt: 'What is phishing?', options: ['A fraudulent attempt to obtain sensitive information', 'A backup strategy', 'A network cable standard', 'A disk format'], correct: 0, explanation: 'Phishing uses deceptive messages or sites to trick people into revealing sensitive information.' },
  { topic: 'Encryption', prompt: 'What does encryption do to readable data?', options: ['Compresses it permanently', 'Transforms it using a key so it is unreadable without decryption', 'Deletes it', 'Publishes it'], correct: 1, explanation: 'Encryption transforms plaintext into ciphertext that requires the appropriate key to recover.' },
])

export const cloudDevOpsFoundationsTest = makeTest('cloud-devops-foundations', 'cloud-devops-foundations-test', 'Cloud & DevOps Foundations Test', 'Practice containers, CI/CD, deployment, and operational reliability concepts.', cloudDevOps, 'general', [
  { topic: 'Containers', prompt: 'What does a container primarily package?', options: ['An application and its user-space dependencies', 'A physical server only', 'A database row', 'A DNS record'], correct: 0, explanation: 'A container packages an application with its user-space dependencies for consistent execution.' },
  { topic: 'CI/CD', prompt: 'What is continuous integration intended to encourage?', options: ['Frequent integration and automated verification of changes', 'Manual releases once a year', 'Removing all tests', 'Avoiding version control'], correct: 0, explanation: 'Continuous integration frequently builds and verifies changes as they are integrated.' },
  { topic: 'Observability', prompt: 'Which three signals commonly support observability?', options: ['Logs, metrics, and traces', 'Passwords, cookies, and fonts', 'HTML, CSS, and images', 'Users, roles, and invoices'], correct: 0, explanation: 'Logs, metrics, and traces provide complementary evidence about system behavior.' },
])
