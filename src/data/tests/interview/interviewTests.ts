import { buildExpandedTest } from '../testBuilder'

const interviewCat = {
  id: 'cat-interview-preparation',
  name: 'Interview Preparation',
  slug: 'interview-preparation',
  description: 'Technical, aptitude, logical reasoning, and HR interview assessments.',
  color: '#8b5cf6',
  icon: 'Briefcase',
}

export const verbalAbilityTest = buildExpandedTest(
  'verbal-ability',
  'verbal-ability-test',
  'Verbal Ability & English Test',
  'Reading comprehension, sentence completion, word analogy, error spotting, para-jumbles, vocabulary, and verbal reasoning for placements and competitive exams.',
  'Targeted verbal ability practice for CAT, GATE verbal, campus placements, and banking exams. Covers reading comprehension inference, sentence correction, idiom usage, critical reasoning, and active/passive voice transformation.',
  interviewCat,
  'general',
  'intermediate',
  25,
  [
    {
      topic: 'Reading Comprehension – Inference',
      prompt: 'Read: "Despite the company\'s strong quarterly revenue, investor confidence fell sharply following the CEO\'s resignation." What can be directly inferred?',
      options: [
        'The company will go bankrupt next quarter',
        'Investor confidence is influenced by leadership changes, not just financial performance',
        'The CEO resigned because of poor revenue',
        'The company\'s revenue will decline next quarter',
      ],
      correct: 1,
      explanation:
        'The passage contrasts "strong revenue" with "fell confidence" following the CEO resignation. The direct inference is that investors reacted to the leadership change rather than the financial performance data. We cannot infer future trends or the cause of the resignation without additional information.',
      hint: 'Focus on what is explicitly contrasted in the sentence.',
      difficulty: 'intermediate',
      tags: ['Reading Comprehension', 'Inference', 'Verbal'],
    },
    {
      topic: 'Sentence Completion',
      prompt: 'Choose the best word to complete: "The professor\'s lecture was so _______ that several students fell asleep within the first ten minutes."',
      options: ['provocative', 'monotonous', 'contentious', 'eloquent'],
      correct: 1,
      explanation:
        '"Monotonous" (tediously uniform or unvarying) correctly describes a lecture so dull that students fell asleep. "Provocative" (stimulating controversy), "contentious" (causing disagreement), and "eloquent" (fluent and expressive) all contradict the context of students falling asleep.',
      hint: 'The outcome (students sleeping) guides the correct tone of the missing word.',
      difficulty: 'intermediate',
      tags: ['Sentence Completion', 'Vocabulary', 'Context'],
    },
    {
      topic: 'Word Analogy',
      prompt: 'CANVAS : PAINTER :: STAGE : ?',
      options: ['Director', 'Actor', 'Script', 'Audience'],
      correct: 1,
      explanation:
        'The relationship is workspace/medium : professional who uses it. A canvas is the primary workspace/medium of a painter. A stage is the primary workspace/performance medium of an actor. A director works behind the scenes; a script is a document; an audience observes.',
      hint: 'Identify the functional relationship between canvas and painter first.',
      difficulty: 'beginner',
      tags: ['Analogy', 'Word Relationships', 'Verbal'],
    },
    {
      topic: 'Error Spotting',
      prompt: 'Identify the error in: "Each of the students have submitted their assignments on time."',
      options: [
        '"Each" should be "Every"',
        '"have" should be "has" — "Each of" is singular and requires a singular verb',
        '"their" should be "his or her"',
        'No error; the sentence is grammatically correct',
      ],
      correct: 1,
      explanation:
        '"Each" is an indefinite pronoun that always takes a singular verb. "Each of the students" → singular → "has submitted". While "their" as a singular pronoun is increasingly accepted, the verb agreement error ("have" vs "has") is the grammatical error the question targets.',
      hint: '"Each" is always singular — what verb agreement does that require?',
      difficulty: 'intermediate',
      tags: ['Error Spotting', 'Subject-Verb Agreement', 'Grammar'],
    },
    {
      topic: 'Para-Jumble',
      prompt: 'Arrange in logical order: (A) This made global travel accessible to ordinary people. (B) The invention of commercial aviation transformed the world. (C) Distances that once took weeks by ship could now be covered in hours. (D) Before aircraft, intercontinental travel was an expensive, time-consuming undertaking.',
      options: ['B, D, C, A', 'A, B, C, D', 'D, B, A, C', 'C, A, B, D'],
      correct: 0,
      explanation:
        'Logical sequence: B (introduce the general claim: aviation transformed the world), D (establish the "before" contrast), C (explain the specific improvement: time reduction), A (consequence: ordinary people could travel). B → D → C → A follows a problem-solution-impact narrative.',
      hint: 'Look for the introductory sentence, then the contrast, then the explanation, then the result.',
      difficulty: 'intermediate',
      tags: ['Para-Jumble', 'Logical Ordering', 'Verbal'],
    },
    {
      topic: 'Synonyms',
      prompt: 'Choose the word closest in meaning to LACONIC:',
      options: ['Verbose', 'Concise', 'Ambiguous', 'Eloquent'],
      correct: 1,
      explanation:
        '"Laconic" means using very few words; brief and concise. Origin: the Spartans (Laconians) were famous for their terse speech. Antonyms: verbose, loquacious, garrulous. Synonyms: terse, succinct, pithy, brief.',
      hint: 'Spartans were known for being... brief in speech.',
      difficulty: 'intermediate',
      tags: ['Synonyms', 'Vocabulary', 'Word Meaning'],
    },
    {
      topic: 'Antonyms',
      prompt: 'Choose the word OPPOSITE in meaning to OPAQUE:',
      options: ['Dense', 'Translucent', 'Murky', 'Cloudy'],
      correct: 1,
      explanation:
        '"Opaque" means not transparent; impossible to see through. Its antonym is "translucent" (allowing some light through, semi-transparent) or "transparent" (fully clear). Dense, murky, and cloudy all reinforce opacity rather than contrasting it.',
      hint: 'If opaque = cannot see through, the antonym allows seeing through.',
      difficulty: 'beginner',
      tags: ['Antonyms', 'Vocabulary', 'Word Meaning'],
    },
    {
      topic: 'Idioms & Phrases',
      prompt: 'What does "bite the bullet" mean?',
      options: [
        'To eat very quickly',
        'To endure a painful or difficult situation with courage and stoicism',
        'To speak quickly and aggressively',
        'To accept a bad deal unwillingly',
      ],
      correct: 1,
      explanation:
        '"Bite the bullet" originates from wartime surgery without anaesthesia, where patients would bite a bullet during painful procedures. It means to endure a difficult, painful, or unpleasant situation with courage and without complaint.',
      hint: 'Historical origin: battlefield surgery before anaesthesia.',
      difficulty: 'beginner',
      tags: ['Idioms', 'Phrases', 'Verbal'],
    },
    {
      topic: 'Active to Passive Voice',
      prompt: 'Convert to passive voice: "The manager approved the project proposal."',
      options: [
        'The project proposal was approved by the manager.',
        'The project proposal is approved by the manager.',
        'The manager was approved by the project proposal.',
        'The project proposal approved the manager.',
      ],
      correct: 0,
      explanation:
        'Passive voice structure: Object (subject of passive) + be + past participle + by + agent. "The project proposal" becomes subject. "was approved" (past tense of "be approved"). "by the manager" retains the agent. Tense preserved: simple past active → simple past passive.',
      hint: 'Passive = Object + was/were + past participle + by + original subject.',
      difficulty: 'beginner',
      tags: ['Active Passive', 'Voice', 'Grammar'],
    },
    {
      topic: 'Cloze Test',
      prompt: 'Fill in the blank: "The negotiators worked tirelessly to _______ a compromise that would satisfy both parties."',
      options: ['demolish', 'impede', 'broker', 'dispute'],
      correct: 2,
      explanation:
        '"Broker" means to arrange or negotiate (especially in diplomacy or business): "to broker a deal/compromise." "Demolish" (destroy), "impede" (hinder), and "dispute" (argue against) all conflict with the positive, constructive context of satisfying both parties.',
      hint: 'Negotiators are trying to CREATE a compromise, not destroy one.',
      difficulty: 'intermediate',
      tags: ['Cloze Test', 'Vocabulary', 'Context'],
    },
    {
      topic: 'Direct to Indirect Speech',
      prompt: 'Convert: She said, "I am working on the report." → Indirect speech:',
      options: [
        'She said that I am working on the report.',
        'She said that she was working on the report.',
        'She told that she is working on the report.',
        'She said that she will work on the report.',
      ],
      correct: 1,
      explanation:
        'Rules for converting present continuous direct speech: (1) "said" remains "said that"; (2) first person "I" → third person "she"; (3) "am working" (present continuous) → "was working" (past continuous) — the tense shifts back one step in time. "told" needs an object: "told me/them".',
      hint: 'Tense shifts back one step; person changes according to context.',
      difficulty: 'intermediate',
      tags: ['Direct Indirect Speech', 'Grammar', 'Narration'],
    },
    {
      topic: 'Critical Reasoning – Assumptions',
      prompt: 'Statement: "Students who study for more than 4 hours daily will definitely pass the exam." Which assumption is this statement based on?',
      options: [
        'The exam is very difficult',
        'Duration of study is the primary factor determining exam success',
        'All students who study 4+ hours are interested in the subject',
        'Exams should be abolished',
      ],
      correct: 1,
      explanation:
        'The statement assumes a direct causal relationship between study hours and exam passage — i.e., that studying duration is the primary determinant of success. This ignores quality of study, prior knowledge, exam difficulty, and other factors. Identifying hidden assumptions is a key verbal reasoning skill.',
      hint: 'What does the argument take for granted without stating?',
      difficulty: 'intermediate',
      tags: ['Critical Reasoning', 'Assumptions', 'Verbal'],
    },
    {
      topic: 'Sentence Correction',
      prompt: 'Identify the correct sentence:',
      options: [
        'Neither the manager nor the employees was present at the meeting.',
        'Neither the manager nor the employees were present at the meeting.',
        'Neither the manager nor the employees has been present at the meeting.',
        'Neither the manager nor the employees are going to present the meeting.',
      ],
      correct: 1,
      explanation:
        'With "Neither...nor", the verb agrees with the subject closest to it (the "proximity rule"). "Employees" (plural) is closest to the verb, so "were" is correct. If reversed: "Neither the employees nor the manager was present" — "manager" (singular) closest = "was".',
      hint: 'Neither...nor: verb agrees with the NEAREST subject.',
      difficulty: 'intermediate',
      tags: ['Sentence Correction', 'Neither Nor', 'Agreement'],
    },
    {
      topic: 'Prepositions',
      prompt: 'Choose the correct preposition: "She has been working ___ this company ___ 2019."',
      options: ['in / since', 'for / since', 'at / from', 'with / from'],
      correct: 1,
      explanation:
        '"Working for a company" is the correct collocation (employed by). "Since 2019" indicates a point in time continuing to the present (used with present perfect). "From 2019" is used with simple past. "In" + company name is incorrect; "in" is for institutions/sectors.',
      hint: '"For" follows "work" as employer; "since" marks a point in past time.',
      difficulty: 'intermediate',
      tags: ['Prepositions', 'Grammar', 'Collocations'],
    },
    {
      topic: 'Verbal Reasoning – Logical Completion',
      prompt: 'If "hot" is related to "cold" as "dark" is related to "?":',
      options: ['Night', 'Light', 'Black', 'Shadow'],
      correct: 1,
      explanation:
        'The relationship is antonyms: hot ↔ cold. The antonym of "dark" is "light." Night, black, and shadow are associated with dark but are not its direct opposite/antonym.',
      hint: 'Identify the relationship type: are hot and cold synonyms, antonyms, or associated words?',
      difficulty: 'beginner',
      tags: ['Verbal Reasoning', 'Analogies', 'Opposites'],
    },
  ],
  { featured: true, aliases: ['verbal ability', 'english test', 'verbal reasoning', 'english verbal'] }
)

export const hrInterviewTest = buildExpandedTest(
  'hr-interview',
  'hr-interview-test',
  'HR Interview Knowledge Test',
  'Key HR interview topics: situational questions, behavioral frameworks, company research, salary negotiation, cultural fit, and common HR concepts.',
  'Prepare for HR rounds with confidence. This test covers STAR method situational responses, behavioral question frameworks, common HR interview traps, workplace ethics, company research best practices, and salary negotiation strategies.',
  interviewCat,
  'general',
  'beginner',
  20,
  [
    {
      topic: 'STAR Method',
      prompt: 'What does the STAR method stand for in behavioral interview responses?',
      options: [
        'Skills, Training, Achievements, Results',
        'Situation, Task, Action, Result – a structured framework for narrating real past experiences with context, responsibility, specific actions, and measurable outcomes',
        'Strategy, Team, Alignment, Reflection',
        'Summary, Target, Analysis, Recommendation',
      ],
      correct: 1,
      explanation:
        'STAR = Situation (set context), Task (your responsibility), Action (what YOU specifically did), Result (measurable outcome + learning). It ensures responses are concrete, relevant, and complete. Practice 3–5 STAR stories covering leadership, conflict, failure, teamwork, and initiative.',
      hint: 'STAR is a 4-step storytelling framework for behavioral questions.',
      difficulty: 'beginner',
      tags: ['STAR Method', 'Behavioral', 'Interview Framework'],
    },
    {
      topic: '"Tell me about yourself"',
      prompt: 'What is the most effective structure for answering "Tell me about yourself" in an HR interview?',
      options: [
        'Describe your childhood and educational background in full chronological detail',
        'Present → Past → Future: briefly cover current role/skills, highlight relevant past experiences, and connect to why this specific role aligns with your goals',
        'Recite your resume word-for-word to show thoroughness',
        'Deflect by asking the interviewer what specifically they want to know',
      ],
      correct: 1,
      explanation:
        'The Present → Past → Future framework works because it: (1) establishes current credibility, (2) validates experience, (3) shows intentionality for this specific role. Keep it to 90 seconds. Tailor it to the job: emphasise skills most relevant to the position.',
      hint: 'This is your verbal elevator pitch: concise, tailored, forward-looking.',
      difficulty: 'beginner',
      tags: ['Tell Me About Yourself', 'Self-Introduction', 'HR'],
    },
    {
      topic: '"Greatest Weakness"',
      prompt: 'What is the best approach to answering "What is your greatest weakness?"',
      options: [
        'Claim you have no weaknesses to project confidence',
        'State a real development area that is not critical to the role, describe the impact you recognised, and explain the specific steps you have taken to improve',
        'Choose a strength disguised as weakness: "I work too hard"',
        'Admit to a serious flaw directly relevant to the core job requirement',
      ],
      correct: 1,
      explanation:
        'Interviewers know "I work too hard" is a dodge and it backfires. A genuine answer shows self-awareness and growth mindset. Choose a real but manageable weakness (e.g. "I used to struggle with delegating; I now practice with structured handoffs"), showing you are actively improving.',
      hint: 'Authenticity + growth evidence > deflection or false humility.',
      difficulty: 'beginner',
      tags: ['Weakness Question', 'Self-Awareness', 'HR'],
    },
    {
      topic: 'Reason for Leaving Current Job',
      prompt: 'Which answer is most appropriate when asked "Why are you leaving your current job?"',
      options: [
        '"My boss is terrible and the culture is toxic"',
        '"I am seeking opportunities to grow my skills in [specific area] and take on greater responsibility, which aligns well with what this role offers"',
        '"The pay is too low at my current company"',
        '"I am not sure; I just wanted to explore options"',
      ],
      correct: 1,
      explanation:
        'Never speak negatively about current employers — it raises red flags about attitude and confidentiality. Frame your departure in terms of seeking positive growth, new challenges, or alignment with career goals. Stay specific: "I want to move into data architecture, and this role offers that path."',
      hint: 'Pull (towards opportunity) always sounds better than push (away from problems).',
      difficulty: 'beginner',
      tags: ['Leaving Job', 'Interview Strategy', 'HR'],
    },
    {
      topic: '"Where do you see yourself in 5 years?"',
      prompt: 'What does the "5-year plan" question primarily assess?',
      options: [
        'Whether you have specific year-by-year milestones planned',
        'Your career ambition level, whether your goals align with the company\'s growth trajectory, and whether you plan to stay long-term',
        'Whether you expect to become the interviewer\'s boss',
        'Whether you have a degree plan for future education',
      ],
      correct: 1,
      explanation:
        'Interviewers want to know: (1) do you have professional ambition, (2) do your goals fit what this role and company can offer, (3) are you a retention risk. A good answer: "I hope to develop [skill X] and take on [more scope]. I see this company as a place where I can grow in that direction over the next few years."',
      hint: 'Show ambition + alignment with the company\'s direction.',
      difficulty: 'beginner',
      tags: ['5 Year Plan', 'Career Goals', 'HR'],
    },
    {
      topic: 'Salary Negotiation',
      prompt: 'When an interviewer asks "What are your salary expectations?", what is the most effective strategy?',
      options: [
        'Give a single precise number immediately to appear decisive',
        'Respond with a researched salary range based on market data, your experience, and the cost of living — framing it around the value you bring rather than your personal needs',
        'Refuse to answer until an offer is made',
        'Ask for the highest number you can think of',
      ],
      correct: 1,
      explanation:
        'Research using Glassdoor, LinkedIn Salary, and industry surveys. Provide a range (e.g. "Based on my research and 4 years in this domain, I am targeting $85–95K"). Stating a range gives flexibility. Anchor the discussion on market value and your contributions, not personal bills.',
      hint: 'Research market rates first; present a range with your justification.',
      difficulty: 'intermediate',
      tags: ['Salary Negotiation', 'Compensation', 'HR'],
    },
    {
      topic: 'Handling Conflict – STAR Application',
      prompt: '"Tell me about a time you had a conflict with a coworker." What key elements should your response include?',
      options: [
        'Prove the coworker was wrong and you were right',
        'Describe the conflict context, your specific de-escalation or resolution actions, the collaborative outcome, and what you learned about communication',
        'Avoid mentioning the conflict entirely and redirect to teamwork',
        'State that you never have conflicts with coworkers',
      ],
      correct: 1,
      explanation:
        'Behavioral conflict questions assess emotional intelligence, communication skills, and maturity. Using STAR: Situation (the disagreement), Task (your role in resolving it), Action (specific steps you took: "I scheduled a 1:1, listened actively, acknowledged their concern..."), Result (outcome + relationship preserved + lesson learned).',
      hint: 'Focus on YOUR actions and the resolution, not on blaming the other person.',
      difficulty: 'intermediate',
      tags: ['Conflict Resolution', 'STAR', 'EQ'],
    },
    {
      topic: 'Company Research – Why This Company',
      prompt: 'How should you answer "Why do you want to work for us?"',
      options: [
        '"I need a job and your company appeared in my search"',
        '"Your company\'s track record in [specific area], recent [specific initiative or product], and reputation for [culture element] align with my goal to work where innovation in [domain] is prioritised"',
        '"The pay is competitive"',
        '"A friend who works here referred me"',
      ],
      correct: 1,
      explanation:
        'This question tests whether you have done your homework and are genuinely motivated. Reference: the company\'s products or services you have used, recent news (funding, product launch, mission), specific team/culture attributes you value, and how the role connects to your career direction. Generic answers are immediately obvious and signal low interest.',
      hint: 'Specificity = genuine interest. Vagueness = no preparation.',
      difficulty: 'beginner',
      tags: ['Company Research', 'Motivation', 'HR'],
    },
    {
      topic: 'Cultural Fit Questions',
      prompt: 'When asked "How would your colleagues describe your work style?", what approach works best?',
      options: [
        'Make up flattering adjectives without examples',
        'Cite specific, verifiable feedback you have received from colleagues or managers (e.g. 360 reviews, team feedback), grounding your answer in concrete evidence',
        'Say you prefer to work alone and are not interested in team feedback',
        'List every positive adjective possible: fast, detail-oriented, creative, organised',
      ],
      correct: 1,
      explanation:
        'This question assesses self-awareness and alignment with the team. Ground it in real feedback: "In my last review, my team described me as the person who \'connects the dots between teams\'. I pride myself on proactive communication and clarifying ambiguity early." Genuine evidence beats a list of adjectives.',
      hint: 'Use real feedback from past reviews or colleagues to ground your answer.',
      difficulty: 'intermediate',
      tags: ['Cultural Fit', 'Self-Awareness', 'HR'],
    },
    {
      topic: 'Questions for Interviewer',
      prompt: 'Why is it important to prepare thoughtful questions to ask the interviewer at the end?',
      options: [
        'It is expected protocol but has no impact on hiring decisions',
        'Asking specific, informed questions demonstrates genuine interest, shows you have researched the role, and helps you evaluate whether the company fits your goals — both sides are assessing fit',
        'It gives you a chance to negotiate salary on the spot',
        'Interviewers are always annoyed by candidate questions',
      ],
      correct: 1,
      explanation:
        'Candidates who ask no questions signal low engagement. Good questions: "How does success look in this role in the first 90 days?", "What challenges is the team currently navigating?", "How do you describe the team\'s culture?" Avoid questions answerable by reading the job description — it signals you did not prepare.',
      hint: 'Questions signal interest; no questions signal indifference.',
      difficulty: 'beginner',
      tags: ['Questions for Interviewer', 'Engagement', 'HR'],
    },
    {
      topic: 'Employment Gap',
      prompt: 'How should you address a visible employment gap on your resume if asked?',
      options: [
        'Deny the gap exists and redirect the conversation',
        'Be honest: briefly explain the reason (personal reasons, skill development, family care, etc.) and emphasise what you did during the gap that kept you productive or growing',
        'Fabricate employment dates to cover the gap',
        'Refuse to discuss personal matters',
      ],
      correct: 1,
      explanation:
        'Interviewers understand that gaps happen (illness, family, layoff, education). Honesty is essential — background checks reveal fabrications. Frame gaps productively: "I took a sabbatical to care for a family member; during that time I completed two online certifications in data analytics." Own it; control the narrative.',
      hint: 'Honest + productive framing always beats dishonesty or deflection.',
      difficulty: 'beginner',
      tags: ['Employment Gap', 'Resume', 'Honesty'],
    },
    {
      topic: 'Leadership vs Management',
      prompt: 'An interviewer asks: "Are you a leader or a manager?" What is the most nuanced, effective response?',
      options: [
        '"I am purely a leader – I do not like administrative tasks"',
        '"I am purely a manager who follows established processes"',
        '"Effective leadership and management are complementary: I lead by inspiring and setting vision while also managing by planning, coordinating, and removing blockers – I adapt the balance to what the team needs"',
        '"I have never managed anyone so I cannot answer"',
      ],
      correct: 2,
      explanation:
        'The question tests whether you have thought about this distinction. Great leaders manage; great managers lead. Showing nuance — that you can inspire (leadership) AND execute (management) — reflects maturity. Reference a specific example where you balanced both: set a clear team vision while also tracking deliverables.',
      hint: 'Both skills are valuable; show you can deploy both depending on context.',
      difficulty: 'intermediate',
      tags: ['Leadership', 'Management', 'Interview Strategy'],
    },
  ],
  { featured: true, aliases: ['hr interview', 'hr round', 'soft skills interview', 'behavioral interview'] }
)

export const codingInterviewTest = buildExpandedTest(
  'coding-interview',
  'coding-interview-test',
  'Coding Interview Fundamentals Test',
  'Data structures, algorithm complexity, problem-solving patterns, and common coding interview question categories.',
  'Prepare for technical coding interviews at product companies. Covers Big-O time/space complexity analysis, common data structure operations, algorithmic problem-solving patterns (sliding window, two pointers, BFS/DFS, dynamic programming), and interview strategy.',
  interviewCat,
  'general',
  'intermediate',
  25,
  [
    {
      topic: 'Big-O – Time Complexity',
      prompt: 'What is the time complexity of the following algorithm?',
      codeSnippet: `def find_pair(arr, target):
    seen = set()
    for num in arr:
        complement = target - num
        if complement in seen:
            return (complement, num)
        seen.add(num)
    return None`,
      codeLanguage: 'python',
      options: ['O(n²) — nested loop', 'O(n log n) — sorted lookup', 'O(n) — single pass with O(1) hash set lookup', 'O(1) — constant time'],
      correct: 2,
      explanation:
        'The loop runs once per element: O(n). Inside the loop, `in seen` is O(1) average for a hash set. Total: O(n) time, O(n) space. This is the classic Two Sum problem solved with a hash set in linear time, versus the naive O(n²) nested loop approach.',
      hint: 'Hash set lookup is O(1) on average.',
      difficulty: 'intermediate',
      tags: ['Big-O', 'Hash Set', 'Two Sum'],
    },
    {
      topic: 'Big-O – Space Complexity',
      prompt: 'What is the space complexity of a recursive Fibonacci function with no memoization?',
      options: [
        'O(1) — no extra data structures',
        'O(n) — the call stack holds n activation frames at maximum depth',
        'O(2^n) — exponential space due to branching',
        'O(n²)',
      ],
      correct: 1,
      explanation:
        'Recursive Fibonacci without memoization has O(2^n) TIME complexity (exponential recomputation). The SPACE complexity is O(n) because the call stack depth is proportional to n (the deepest recursion path reaches depth n before returning). The branching tree generates O(2^n) total calls, but at any moment, only one path occupies the stack.',
      hint: 'Space = maximum stack depth at any point in time, not total calls made.',
      difficulty: 'intermediate',
      tags: ['Big-O', 'Space Complexity', 'Recursion'],
    },
    {
      topic: 'Data Structures – Array vs Linked List',
      prompt: 'For an algorithm that requires frequent insertion at arbitrary positions and no random access by index, which data structure is preferred?',
      options: [
        'Array – O(1) insertion everywhere',
        'Linked List – O(1) insertion once the position node is found, versus O(n) array shift',
        'Hash Map – O(1) insertion and random access',
        'Binary Search Tree – O(log n) insertion and ordered traversal',
      ],
      correct: 1,
      explanation:
        'Array insertion at position k requires shifting all elements from k to end: O(n). Linked list insertion at a given node requires only pointer updates: O(1). However, finding the position in a linked list is O(n) since there is no random access. If the position node is already known, linked list insertion is O(1).',
      hint: 'Linked list insertion at a known node = O(1); finding it = O(n).',
      difficulty: 'intermediate',
      tags: ['Data Structures', 'Linked List', 'Array'],
    },
    {
      topic: 'Data Structures – Stack Applications',
      prompt: 'Which problem is a classic, natural application of a stack data structure?',
      options: [
        'Finding the shortest path in a graph',
        'Checking balanced parentheses/brackets in a string',
        'Sorting an array in O(n log n)',
        'Finding the median of a data stream',
      ],
      correct: 1,
      explanation:
        'A stack\'s LIFO (Last In, First Out) property makes it ideal for matching opening/closing delimiters: push opening brackets, pop and compare when encountering closing brackets. At the end, an empty stack means balanced. DFS also uses a stack (implicitly via recursion or explicitly).',
      hint: 'LIFO = Last In First Out = perfectly matches opening/closing bracket tracking.',
      difficulty: 'beginner',
      tags: ['Stack', 'Parentheses', 'Data Structures'],
    },
    {
      topic: 'Sliding Window Pattern',
      prompt: 'Which algorithmic pattern is best suited for "Find the maximum sum of any subarray of size k"?',
      options: [
        'Divide and conquer — split the array in half and recurse',
        'Sliding Window — maintain a running sum, add the next element, subtract the element leaving the window, O(n)',
        'Two Pointers — sort then expand from both ends',
        'Dynamic Programming — store all subarray sums',
      ],
      correct: 1,
      explanation:
        'The Sliding Window pattern maintains a window of k elements, computing the sum by adding the new right element and removing the old left element on each slide. This avoids recomputing the sum from scratch (which is O(n·k)); instead, each slide is O(1), making the total O(n).',
      hint: 'Think about reusing the previous sum by adding and removing one element each step.',
      difficulty: 'intermediate',
      tags: ['Sliding Window', 'Patterns', 'Algorithm'],
    },
    {
      topic: 'Two Pointers Pattern',
      prompt: 'Given a sorted array, how does the Two Pointers pattern find pairs summing to a target in O(n)?',
      options: [
        'Place one pointer at index 0 and one at index n/2; move both toward the middle',
        'Place one pointer at the start and one at the end; if their sum equals target you found it; if sum < target, move start right; if sum > target, move end left',
        'Sort first, then use binary search for each element\'s complement: O(n log n)',
        'Two Pointers requires a hash map to work correctly',
      ],
      correct: 1,
      explanation:
        'Start pointer at index 0 (smallest element), end pointer at index n-1 (largest). If `arr[start] + arr[end] == target`: found. If sum < target: need larger sum → move start right. If sum > target: need smaller sum → move end left. Each step eliminates one element: O(n) total.',
      hint: 'Start = smallest, end = largest; eliminate one element per comparison.',
      difficulty: 'intermediate',
      tags: ['Two Pointers', 'Sorted Array', 'Patterns'],
    },
    {
      topic: 'BFS vs DFS',
      prompt: 'When is Breadth-First Search (BFS) preferred over Depth-First Search (DFS) for graph problems?',
      options: [
        'Always prefer BFS; it is faster',
        'BFS is preferred for finding shortest paths in unweighted graphs (it explores level by level, guaranteeing the first path found is shortest); DFS is preferred for exhaustive search, topological sort, or cycle detection',
        'DFS is always preferred for weighted graphs',
        'BFS uses less memory than DFS in all cases',
      ],
      correct: 1,
      explanation:
        'BFS uses a queue and processes nodes level by level. It finds the shortest path (in terms of edges) in unweighted graphs because the first time it reaches a node is via the shortest route. DFS (stack/recursion) is more memory-efficient for deep graphs and suited for problems requiring complete exploration, backtracking, or path enumeration.',
      hint: 'Shortest path in unweighted graph → BFS. Full exploration → DFS.',
      difficulty: 'intermediate',
      tags: ['BFS', 'DFS', 'Graph Algorithms'],
    },
    {
      topic: 'Dynamic Programming – Overlapping Subproblems',
      prompt: 'What two conditions must be present for dynamic programming to be an appropriate solution strategy?',
      options: [
        'The problem must involve sorting and binary search',
        'Optimal substructure (the optimal solution is built from optimal solutions to subproblems) and overlapping subproblems (same subproblems are computed multiple times without memoization)',
        'The problem must have O(n²) brute force complexity',
        'The data must be stored in a sorted array',
      ],
      correct: 1,
      explanation:
        '(1) Optimal Substructure: the best solution to the whole problem can be constructed from best solutions to sub-problems. (2) Overlapping Subproblems: naive recursion recomputes the same results, making memoization or tabulation valuable. Classic DP problems: Fibonacci, 0/1 Knapsack, Longest Common Subsequence, Coin Change.',
      hint: 'DP = optimal substructure + overlapping subproblems = memoize repeated work.',
      difficulty: 'intermediate',
      tags: ['Dynamic Programming', 'Memoization', 'Patterns'],
    },
    {
      topic: 'Hash Map – Frequency Count Pattern',
      prompt: 'What classic pattern uses a hash map to find the first non-repeating character in a string?',
      options: [
        'Sort the string alphabetically and return the middle character',
        'Pass 1: build a frequency hash map (char → count); Pass 2: iterate the string and return the first character with count == 1',
        'Use a nested loop to compare each character with all others: O(n²)',
        'Use binary search on the sorted character frequencies',
      ],
      correct: 1,
      explanation:
        'Two-pass hash map pattern: (1) Count frequencies of all characters in O(n) time and O(k) space (k = alphabet size). (2) Iterate the ORIGINAL string in order, returning the first char whose count is 1. Total: O(n) time — vastly better than the O(n²) nested comparison approach.',
      hint: 'Count all, then scan once more to find the first with count = 1.',
      difficulty: 'intermediate',
      tags: ['Hash Map', 'String', 'Frequency Count'],
    },
    {
      topic: 'Binary Search – Use Cases',
      prompt: 'Binary search requires which precondition on the data?',
      options: [
        'The data must be stored in a linked list',
        'The data must be sorted (or a monotonic property must hold), so the search space can be halved per comparison',
        'The data must have no duplicates',
        'The data must fit in RAM',
      ],
      correct: 1,
      explanation:
        'Binary search relies on being able to eliminate half the remaining search space after each comparison. This requires the search space to be ordered (sorted array or any structure with a monotonic property). Without ordering, you cannot determine which half to eliminate.',
      hint: 'You must be able to say "target is in left half or right half" at each step.',
      difficulty: 'beginner',
      tags: ['Binary Search', 'Sorted Array', 'Prerequisites'],
    },
  ],
  { featured: true, aliases: ['coding interview', 'technical coding', 'dsa interview', 'algorithm interview'] }
)
