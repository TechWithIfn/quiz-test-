import { RawTest } from '@/types/content'

export const pythonInterviewTest: RawTest = {
  id: 'test-py-interview',
  slug: 'python-interview-test',
  title: 'Python Interview Test',
  aliases: ["Python Interview Test", "Python Interview", "Python Interview test", "Python Interview quiz", "Python Interview online test", "Python Interview practice test", "Python Interview mcq", "Python Interview mock test", "Python Interview assessment", "Python Interview questions", "Python Interview interview questions", "Python Interview interview", "interview preparation", "python test", "python quiz"],
  shortDescription: 'Advanced interview assessment: generators, decorators, GIL, dunder protocols, context managers, and memory management.',
  fullDescription: 'Challenge your deep understanding of Python internals frequently targeted in technical interviews: Python Global Interpreter Lock (GIL), iterator protocol vs generator yield, args/kwargs decorators, `__new__` vs `__init__`, and garbage collection.',
  category: {
    id: 'cat-interview-preparation',
    name: 'Interview Preparation',
    slug: 'interview-preparation',
    description: 'Python programming language, standard libraries, and data structures.',
    icon: 'Terminal',
    color: '#3b82f6',
  },
  tags: [
    { id: 'tag-py', name: 'Python', slug: 'python' },
    { id: 'tag-py-int', name: 'Interview', slug: 'interview' },
    { id: 'tag-py-adv', name: 'Advanced', slug: 'advanced' },
  ],
  difficulty: 'advanced',
  estimatedMinutes: 12,
  questionCount: 5,
  language: 'python',
  passingScorePercentage: 75,
  featured: true,
  createdAt: '2026-01-20T00:00:00.000Z',
  questions: [
    {
      id: 'q-pyi-1',
      question: 'What is the fundamental difference between a regular function with `return` and a generator function with `yield`?',
      type: 'single-choice',
      options: [
        { id: 'opt-pyi-1a', text: 'Generators execute in a separate operating system thread automatically' },
        { id: 'opt-pyi-1b', text: '`yield` pauses function execution and saves its local state, producing values lazily on demand when `next()` is called' },
        { id: 'opt-pyi-1c', text: 'Generators can only produce integer sequences' },
        { id: 'opt-pyi-1d', text: 'Functions with `return` cannot be converted to lists' },
      ],
      correctAnswer: 'opt-pyi-1b',
      explanation: 'A generator function produces a generator iterator object. When invoked with `next()`, it executes until hitting `yield`, emitting the current value and pausing its execution frame and local variables, resuming on the subsequent `next()` call without loading all elements into memory.',
      hint: 'Think about memory efficiency and lazy evaluation over large or infinite sequences.',
      difficulty: 'intermediate',
      topic: 'Generators',
      tags: ['Generators', 'Yield', 'Iterators'],
      estimatedTime: 50,
      points: 1,
    },
    {
      id: 'q-pyi-2',
      question: 'What is the purpose of `functools.wraps` when writing custom function decorators?',
      type: 'code-snippet',
      codeSnippet: `from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper`,
      codeLanguage: 'python',
      options: [
        { id: 'opt-pyi-2a', text: 'It compiles the wrapper function into C bytecode for 10x performance' },
        { id: 'opt-pyi-2b', text: 'It preserves the original function metadata like `__name__`, `__doc__`, and signature' },
        { id: 'opt-pyi-2c', text: 'It prevents the decorator from accepting keyword arguments' },
        { id: 'opt-pyi-2d', text: 'It automatically catches all uncaught runtime exceptions' },
      ],
      correctAnswer: 'opt-pyi-2b',
      explanation: 'Without `@wraps(func)`, decorated functions inherit the generic metadata of the inner `wrapper` function (e.g. `fn.__name__` becomes "wrapper"). `@wraps` copies docstrings, function names, and parameter signatures back from the original target function.',
      hint: 'Think about debugging, logging, and reflection tools inspecting function names.',
      difficulty: 'advanced',
      topic: 'Decorators',
      tags: ['Decorators', 'Functools', 'Metaprogramming'],
      estimatedTime: 60,
      points: 1,
    },
    {
      id: 'q-pyi-3',
      question: 'How does CPython\'s Global Interpreter Lock (GIL) affect multi-threaded CPU-bound programs?',
      type: 'single-choice',
      options: [
        { id: 'opt-pyi-3a', text: 'It allows multiple threads to run Python bytecode in true parallel across all CPU cores simultaneously' },
        { id: 'opt-pyi-3b', text: 'It restricts bytecode execution to one native thread at a time, so CPU-bound threads do not achieve multi-core speedup' },
        { id: 'opt-pyi-3c', text: 'It converts multi-threading into distributed cloud computing' },
        { id: 'opt-pyi-3d', text: 'It only affects I/O bound network requests' },
      ],
      correctAnswer: 'opt-pyi-3b',
      explanation: 'The GIL is a mutex that prevents multiple native threads from executing CPython bytecode concurrently. While multi-threading is effective for I/O-bound tasks (where threads release the GIL while waiting for network/disk), CPU-bound concurrency requires the `multiprocessing` module or sub-interpreters to utilize multiple cores.',
      hint: 'Consider whether CPU-bound Python threads can achieve multi-core scaling under CPython.',
      difficulty: 'advanced',
      topic: 'Concurrency & GIL',
      tags: ['GIL', 'Threading', 'CPython'],
      estimatedTime: 55,
      points: 1,
    },
    {
      id: 'q-pyi-4',
      question: 'What is the role of `__new__` versus `__init__` in Python class instantiation?',
      type: 'single-choice',
      options: [
        { id: 'opt-pyi-4a', text: '`__new__` creates and returns the new instance; `__init__` initializes the created instance' },
        { id: 'opt-pyi-4b', text: '`__init__` allocates memory; `__new__` destroys instances' },
        { id: 'opt-pyi-4c', text: '`__new__` is only used for unit testing' },
        { id: 'opt-pyi-4d', text: 'There is no difference; they are aliases for each other' },
      ],
      correctAnswer: 'opt-pyi-4a',
      explanation: '`__new__(cls, ...)` is the static constructor method responsible for creating and returning a new instance of the class (crucial for subclassing immutable types like tuple or implementing Singletons). `__init__(self, ...)` is the initializer that configures attributes on that instance once created.',
      hint: 'One is responsible for instance creation, the other for initialization.',
      difficulty: 'advanced',
      topic: 'Object Model',
      tags: ['OOP', 'Dunder Methods', 'Instantiation'],
      estimatedTime: 50,
      points: 1,
    },
    {
      id: 'q-pyi-5',
      question: 'Which context manager protocol methods must an object implement to be used in a `with` statement?',
      type: 'code-snippet',
      codeSnippet: `class ManagedResource:
    def __enter__(self):
        # acquire
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # cleanup
        pass`,
      codeLanguage: 'python',
      options: [
        { id: 'opt-pyi-5a', text: '`__open__` and `__close__`' },
        { id: 'opt-pyi-5b', text: '`__start__` and `__stop__`' },
        { id: 'opt-pyi-5c', text: '`__enter__` and `__exit__`' },
        { id: 'opt-pyi-5d', text: '`__before__` and `__after__`' },
      ],
      correctAnswer: 'opt-pyi-5c',
      explanation: 'Python context managers adhere to the Context Management Protocol by defining `__enter__()` (which prepares the resource and returns the target) and `__exit__(exc_type, exc_val, exc_tb)` (which ensures deterministic cleanup, even if an exception occurs).',
      hint: 'Look for standard dunder methods used by the `with` keyword.',
      difficulty: 'intermediate',
      topic: 'Context Managers',
      tags: ['Context Manager', 'With Statement', 'Protocols'],
      estimatedTime: 45,
      points: 1,
    },
  ],
}
