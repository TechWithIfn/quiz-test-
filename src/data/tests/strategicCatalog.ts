import { buildExpandedTest } from './testBuilder'
import { RawTest } from '@/types/content'

const programmingCat = {
  id: 'cat-programming',
  name: 'Programming',
  slug: 'programming',
  description: 'Core programming languages, data structures, and computer science concepts.',
  color: '#3b82f6',
  icon: 'Terminal',
}

const dataCat = {
  id: 'cat-data-analytics',
  name: 'Data & Analytics',
  slug: 'data-analytics',
  description: 'SQL queries, analytics pipelines, Business Intelligence, and data manipulation.',
  color: '#0ea5e9',
  icon: 'Database',
}

const webCat = {
  id: 'cat-web-development',
  name: 'Web Development',
  slug: 'web-development',
  description: 'Frontend and backend web technologies: HTML, CSS, JavaScript, React, and Node.js.',
  color: '#0284c7',
  icon: 'Globe',
}

const interviewCat = {
  id: 'cat-interview-preparation',
  name: 'Interview Preparation',
  slug: 'interview-preparation',
  description: 'Technical, aptitude, logical reasoning, and HR interview assessments.',
  color: '#8b5cf6',
  icon: 'Briefcase',
}

// 1. Python OOP Test
export const pythonOopTest: RawTest = buildExpandedTest(
  'python-oop',
  'python-oop-test',
  'Python OOP Test',
  'Object-oriented programming in Python: inheritance, polymorphism, encapsulation, dunder methods, and dataclasses.',
  'Master object-oriented design in Python. Practice class definitions, multiple inheritance with Method Resolution Order (MRO), abstract base classes (ABCs), property decorators, and encapsulation techniques.',
  programmingCat,
  'python',
  'intermediate',
  15,
  [
    {
      topic: 'Inheritance & MRO',
      prompt: 'In Python 3 multiple inheritance, which algorithm determines the Method Resolution Order (MRO)?',
      options: ['C3 Linearization', 'Depth-First Search (DFS) strictly', 'Breadth-First Search (BFS) strictly', 'Alphabetical Order'],
      correct: 0,
      explanation: 'Python uses the C3 Linearization algorithm (implemented in Python 2.3+) to compute a consistent, monotonic Method Resolution Order that respects local precedence and monotonicity.',
      hint: 'Think about the standard linearization algorithm used by `cls.__mro__`.',
    },
    {
      topic: 'Encapsulation & Name Mangling',
      prompt: 'What happens behind the scenes when a class attribute is prefixed with double underscores (e.g. `__secret`)?',
      options: ['It becomes completely private and physically inaccessible from C runtime', 'Python performs name mangling, rewriting it to `_ClassName__secret`', 'It converts into a static class variable', 'It raises an AttributeError upon instantiation'],
      correct: 1,
      explanation: 'Python does not enforce true private variables at the memory level; instead, identifiers with leading double underscores undergo name mangling to `_ClassName__identifier` to prevent accidental namespace collisions in subclasses.',
      hint: 'Check how Python renames double-underscore attributes on the instance dictionary.',
    },
    {
      topic: 'Abstract Base Classes',
      prompt: 'Which module and decorator in the Python standard library are used to define abstract methods that subclasses must implement?',
      options: ['`abc` module with `@abstractmethod`', '`interfaces` module with `@must_override`', '`types` module with `@virtual`', '`typing` module with `@abstract`'],
      correct: 0,
      explanation: 'The standard `abc` (Abstract Base Classes) module provides `ABC` and `@abstractmethod`. Instantiating a class that inherits from `ABC` without overriding all abstract methods raises a `TypeError`.',
      hint: 'ABC stands for Abstract Base Classes.',
    },
    {
      topic: 'Properties & Descriptors',
      prompt: 'What is the primary benefit of using the `@property` decorator over traditional getter methods?',
      options: ['It speeds up bytecode execution by compiling to C inline', 'It allows method calls to be accessed cleanly with attribute syntax (`obj.attr`) while encapsulating getter/setter logic', 'It enforces strict runtime typing on returned values', 'It makes the instance immutable'],
      correct: 1,
      explanation: 'The `@property` decorator exposes method calls as standard attribute accesses, allowing developers to add validation, caching, or computation logic without changing the public interface.',
      hint: 'Consider how `obj.temperature` is read versus `obj.get_temperature()`.',
    },
    {
      topic: 'Dataclasses',
      prompt: 'What code does the `@dataclass` decorator automatically generate on a class in Python 3.7+?',
      options: ['Only a `__init__` constructor', 'Special methods such as `__init__`, `__repr__`, and `__eq__` based on defined class annotations', 'A relational database schema table', 'Thread synchronization locks around all methods'],
      correct: 1,
      explanation: 'The `dataclasses.dataclass` decorator inspects type annotations and automatically synthesizes `__init__`, `__repr__`, `__eq__`, and optionally comparison methods, saving boilerplate.',
      hint: 'Think about common repetitive methods written for data containers.',
    },
    {
      topic: 'Polymorphism & Duck Typing',
      prompt: 'What core Python philosophy describes the practice of checking for specific methods or behavior rather than the explicit class type (`isinstance`)?',
      options: ['Strict nominal subtyping', 'Duck Typing ("If it walks like a duck and quacks like a duck...")', 'Static polymorphism', 'Structural C-binding'],
      correct: 1,
      explanation: 'Duck typing in Python focuses on whether an object adheres to an interface or protocol (e.g. having `__iter__` or `read()`), rather than checking its explicit nominal inheritance tree.',
      hint: 'Think of the famous waterfowl adage for dynamic interfaces.',
    },
  ],
  { featured: true, aliases: ['python oop', 'python classes', 'python inheritance'] }
)

// 2. Python Output & Tricky Questions Test
export const pythonOutputTest: RawTest = buildExpandedTest(
  'python-output',
  'python-output-test',
  'Python Output & Code Tracing Test',
  'Test your ability to predict output and trace tricky Python execution behavior, closures, scopes, and evaluation gotchas.',
  'Diagnose subtle Python runtime quirks: late-binding closures, boolean short-circuiting, list multiplication aliasing, integer interning, and exception handling control flow.',
  programmingCat,
  'python',
  'intermediate',
  12,
  [
    {
      topic: 'Closures & Late Binding',
      prompt: 'What will be the printed output of this closure loop?',
      codeSnippet: `funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])`,
      codeLanguage: 'python',
      options: ['[0, 1, 2]', '[2, 2, 2]', '[3, 3, 3]', '[0, 0, 0]'],
      correct: 1,
      explanation: 'In Python, closures bind variables by reference (late binding). When the lambdas execute after the loop finishes, `i` has its final loop value of 2, so every lambda evaluates to 2.',
      hint: 'Python closures look up variable values in the enclosing scope at invocation time, not definition time.',
    },
    {
      topic: 'List Multiplication & Aliasing',
      prompt: 'What is the output of modifying the first nested list?',
      codeSnippet: `matrix = [[0] * 2] * 2
matrix[0][0] = 99
print(matrix)`,
      codeLanguage: 'python',
      options: ['[[99, 0], [0, 0]]', '[[99, 0], [99, 0]]', '[[99, 99], [0, 0]]', '[[99, 99], [99, 99]]'],
      correct: 1,
      explanation: 'The outer multiplication `[[0] * 2] * 2` creates a list containing two references to the *same* inner list object in memory. Mutating `matrix[0][0]` mutates the shared list, appearing in both rows.',
      hint: 'Multiplying a list containing a mutable object duplicates the reference, not the underlying object.',
    },
    {
      topic: 'Boolean Short-Circuiting',
      prompt: 'What does the expression evaluate to in Python?',
      codeSnippet: `result = [] or 'default' and 42
print(result)`,
      codeLanguage: 'python',
      options: ['True', '42', "'default'", '[]'],
      correct: 1,
      explanation: '`and` has higher precedence than `or`. `"default" and 42` evaluates to `42` (truthy right operand). Then `[] or 42` evaluates to `42` because `[]` is falsy.',
      hint: 'In Python, logical operators return the operand object itself, not a strict boolean literal.',
    },
    {
      topic: 'Integer Interning',
      prompt: 'What is printed by these identity comparisons in CPython?',
      codeSnippet: `a = 256
b = 256
c = 300
d = 300
print(a is b, c is d)`,
      codeLanguage: 'python',
      options: ['True True', 'True False (in standard interactive session)', 'False False', 'False True'],
      correct: 1,
      explanation: 'CPython pre-allocates and interns small integers in the range [-5, 256]. Thus `256 is 256` is always True. Values outside this range (like 300) create distinct heap objects in interactive REPL environments.',
      hint: 'CPython caches a specific small range of frequently used integer objects.',
    },
    {
      topic: 'Exception Control Flow',
      prompt: 'What does the function return?',
      codeSnippet: `def compute():
    try:
        return 1
    finally:
        return 2

print(compute())`,
      codeLanguage: 'python',
      options: ['1', '2', 'None', 'SyntaxError: multiple returns'],
      correct: 1,
      explanation: 'The `finally` block always executes before leaving a `try` block. If the `finally` clause executes a `return` statement, it discards any return value or pending exception from the `try` clause.',
      hint: 'The `finally` block guaranteed execution overrides any preceding `try` return value.',
    },
  ],
  { featured: true, aliases: ['python output', 'python tricky questions', 'python quirks'] }
)

// 3. SQL Window Functions Test
export const sqlWindowFunctionsTest: RawTest = buildExpandedTest(
  'sql-window-functions',
  'sql-window-functions-test',
  'SQL Window Functions Test',
  'Master analytical SQL queries: ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, running totals, and partition framing.',
  'Assess advanced SQL analytical querying skills across PostgreSQL, MySQL 8+, SQLite, and SQL Server. Learn partitioning, sliding frame clauses (`ROWS BETWEEN`), and lead/lag time-series calculations.',
  dataCat,
  'sql',
  'advanced',
  15,
  [
    {
      topic: 'Ranking Functions',
      prompt: 'Given salaries of [100, 100, 80], what ranks will `RANK()` and `DENSE_RANK()` produce over `ORDER BY salary DESC`?',
      options: [
        'RANK: [1, 2, 3]; DENSE_RANK: [1, 1, 2]',
        'RANK: [1, 1, 3]; DENSE_RANK: [1, 1, 2]',
        'RANK: [1, 1, 2]; DENSE_RANK: [1, 1, 3]',
        'Both produce [1, 1, 1]',
      ],
      correct: 1,
      explanation: '`RANK()` assigns the same rank to ties and skips subsequent rank numbers (producing 1, 1, 3). `DENSE_RANK()` assigns ties the same rank but does not skip any ranks (producing 1, 1, 2).',
      hint: 'DENSE rank leaves no gaps in ranking numbers.',
    },
    {
      topic: 'Lead & Lag Functions',
      prompt: 'Which window function retrieves a column value from the immediately preceding row in the specified order without self-joining?',
      options: ['`PREV()`', '`LAG()`', '`LEAD()`', '`OFFSET()`'],
      correct: 1,
      explanation: '`LAG(column, offset, default)` accesses data from a previous row at a specified physical offset within the window partition.',
      hint: 'Think about lagging behind versus leading ahead.',
    },
    {
      topic: 'Running Totals & Default Framing',
      prompt: 'What is the default window frame when an `ORDER BY` is specified inside `OVER (PARTITION BY dep ORDER BY hire_date)` without an explicit `ROWS` or `RANGE` clause?',
      options: [
        '`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`',
        '`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`',
        '`ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`',
        '`RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING`',
      ],
      correct: 0,
      explanation: 'Standard SQL specifies that if `ORDER BY` is supplied without an explicit frame, the default frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, producing an accumulating running total.',
      hint: 'The window accumulates from the start of the partition up to the current row value.',
    },
    {
      topic: 'NTILE Bucketing',
      prompt: 'What does `NTILE(4) OVER (ORDER BY score DESC)` do to a dataset of 100 students?',
      options: [
        'Selects the top 4 scoring students only',
        'Divides the ranked students into 4 equally sized quartiles (1 to 4) of 25 students each',
        'Calculates the 4th percentile',
        'Groups students having scores divisible by 4',
      ],
      correct: 1,
      explanation: '`NTILE(n)` divides an ordered partition into `n` approximately equal buckets or quantiles numbered 1 through `n`.',
      hint: 'Think of quartiles and deciles in statistical grouping.',
    },
    {
      topic: 'Window vs GROUP BY',
      prompt: 'How does a Window Function differ from a standard `GROUP BY` aggregation query?',
      options: [
        'Window functions collapse all grouped rows into a single summary row',
        'Window functions perform calculations across a set of rows while preserving each individual row in the output',
        'Window functions can only run on temporary in-memory views',
        'Window functions cannot be used in PostgreSQL or MySQL',
      ],
      correct: 1,
      explanation: 'Unlike `GROUP BY` which aggregates and collapses rows into one row per group, window functions calculate values across a partition while retaining the individual identity and cardinality of every source row.',
      hint: 'Consider whether the total row count changes after applying a window function.',
    },
  ],
  { featured: true, aliases: ['sql window functions', 'sql over partition', 'sql rank dense_rank'] }
)

// 4. SQL JOINs Deep-Dive Test
export const sqlJoinsTest: RawTest = buildExpandedTest(
  'sql-joins',
  'sql-joins-test',
  'SQL JOINs Deep-Dive Test',
  'Master relational table joining: INNER, LEFT, RIGHT, FULL OUTER, CROSS JOIN, Self-Joins, and join condition optimization.',
  'Deep assessment of relational joins in SQL: matching conditions in `ON` vs `WHERE`, cartesian products in `CROSS JOIN`, hierarchical self-joins, anti-joins, and join performance.',
  dataCat,
  'sql',
  'intermediate',
  12,
  [
    {
      topic: 'Anti-Joins',
      prompt: 'How is an Anti-Join typically written in standard SQL to find all customers who have never placed an order?',
      codeSnippet: `SELECT c.* 
FROM customers c 
LEFT JOIN orders o ON c.id = o.customer_id 
WHERE o.customer_id IS NULL;`,
      codeLanguage: 'sql',
      options: [
        'Using `LEFT JOIN ... WHERE right_table.key IS NULL`',
        'Using `INNER JOIN ... WHERE right_table.key = NULL`',
        'Using `CROSS JOIN ... WHERE c.id != o.customer_id`',
        'Using `FULL JOIN ... WHERE c.id = o.customer_id`',
      ],
      correct: 0,
      explanation: 'An anti-join uses a `LEFT JOIN` combined with a `WHERE right_table.key IS NULL` predicate to filter for left-table records that have no matching entry in the right table.',
      hint: 'Preserve all left rows, then filter for rows where the right side failed to match (resulting in NULL).',
    },
    {
      topic: 'CROSS JOIN',
      prompt: 'If Table A has 10 rows and Table B has 15 rows, how many rows will `SELECT * FROM A CROSS JOIN B` return?',
      options: ['25', '150', '15', '0'],
      correct: 1,
      explanation: 'A `CROSS JOIN` produces the Cartesian product of the two tables, combining every row from Table A with every row from Table B ($10 \\times 15 = 150$).',
      hint: 'Multiply the row counts of both tables together.',
    },
    {
      topic: 'ON vs WHERE in LEFT JOIN',
      prompt: 'What is the critical behavioral difference between placing a filter on the right table in the `ON` clause versus the `WHERE` clause of a `LEFT JOIN`?',
      options: [
        'There is zero difference; the query optimizer produces identical results',
        'A filter in the `ON` clause determines which right-table rows match before joining (preserving all left rows), whereas a filter in `WHERE` filters after joining and can eliminate left rows with NULLs',
        '`ON` cannot filter strings, only primary keys',
        '`WHERE` executes before `ON`',
      ],
      correct: 1,
      explanation: 'Filtering in the `ON` clause only dictates whether a right-table row is attached to the left row. Filtering in the `WHERE` clause acts on the resulting join set, turning a LEFT JOIN into an INNER JOIN if the condition rejects NULL values.',
      hint: 'Think about whether rows from the left table with no matching right row are preserved.',
    },
    {
      topic: 'Self-Joins',
      prompt: 'When is a Self-Join commonly employed in database schema querying?',
      options: [
        'To join tables across two different physical database engines',
        'To query hierarchical or recursive relationships within the same table, such as finding an employee\'s manager',
        'To duplicate database tables for disaster recovery',
        'To bypass primary key indexes',
      ],
      correct: 1,
      explanation: 'A Self-Join joins a table to itself using distinct table aliases (e.g. `employees emp JOIN employees mgr ON emp.manager_id = mgr.id`) to model parent-child and hierarchical relationships.',
      hint: 'Think of an organizational hierarchy where both employees and managers are stored in the same table.',
    },
    {
      topic: 'FULL OUTER JOIN',
      prompt: 'What records are returned by a `FULL OUTER JOIN` between Tables A and B?',
      options: [
        'Only matching rows between A and B',
        'All rows from Table A and all rows from Table B, filling with NULL on either side where matching keys do not exist',
        'Only non-matching rows from both tables',
        'A Cartesian product of all rows',
      ],
      correct: 1,
      explanation: 'A `FULL OUTER JOIN` preserves all rows from both tables, combining matched rows where join criteria meet and inserting `NULL` values where either table lacks a corresponding match.',
      hint: 'Combines the behavior of both a LEFT JOIN and a RIGHT JOIN.',
    },
  ],
  { featured: true, aliases: ['sql joins', 'sql inner join', 'sql left join', 'sql cross join'] }
)

// 5. React Fundamentals & Modern Hooks Test
export const reactCoreTest: RawTest = buildExpandedTest(
  'react-core',
  'react-test',
  'React & Modern Hooks Test',
  'Component lifecycle, useState, useEffect, useMemo, useCallback, useRef, custom hooks, and reconciliation.',
  'Assess production React skills: Virtual DOM diffing, dependency arrays in `useEffect`, memoization trade-offs, state batching, and context performance optimization.',
  webCat,
  'javascript',
  'intermediate',
  15,
  [
    {
      topic: 'Hooks & Dependency Array',
      prompt: 'What happens if you omit the dependency array in a `useEffect(() => { ... })` hook?',
      options: [
        'The effect runs only once when the component mounts',
        'The effect runs after every single render and re-render of the component',
        'The effect never executes',
        'React throws a compile-time SyntaxError',
      ],
      correct: 1,
      explanation: 'Omitting the dependency array causes `useEffect` to execute after initial mount and after every subsequent render. Passing `[]` runs it once on mount; passing `[deps]` runs it only when dependencies change.',
      hint: 'Without an array, React has no list of values to diff between renders.',
    },
    {
      topic: 'useCallback vs useMemo',
      prompt: 'What is the distinction between `useCallback(fn, deps)` and `useMemo(fn, deps)` in React?',
      options: [
        '`useCallback` memoizes the callback function instance itself, while `useMemo` memoizes the computed return value of calling the function',
        '`useCallback` is asynchronous; `useMemo` is synchronous',
        '`useMemo` can only return numbers',
        'They are exact aliases with identical implementation',
      ],
      correct: 0,
      explanation: '`useCallback(fn, deps)` returns a memoized version of the callback function reference to prevent unnecessary child re-renders. `useMemo(() => compute(), deps)` caches and returns the computed result value.',
      hint: 'One memoizes the function reference; the other memoizes the returned result value.',
    },
    {
      topic: 'State Updates & Batching',
      prompt: 'How does React 18 handle multiple state setter calls inside async callbacks, promises, and native event handlers?',
      options: [
        'It immediately re-renders the DOM synchronously after every single setter call',
        'It automatically batches multiple state updates into a single re-render (Automatic Batching)',
        'It rejects concurrent updates with a runtime warning',
        'It forces developers to manually call `flushSync`',
      ],
      correct: 1,
      explanation: 'React 18 introduced Automatic Batching across all contexts (promises, `setTimeout`, native event handlers), grouping multiple state updates into a single render pass for improved performance.',
      hint: 'Look for the Automatic Batching feature introduced in React 18.',
    },
    {
      topic: 'useRef vs useState',
      prompt: 'Why would you use `useRef` instead of `useState` to store a mutable value?',
      options: [
        'Modifying a ref\'s `.current` property does not trigger a component re-render',
        '`useRef` values are automatically saved to localStorage',
        '`useRef` can only store DOM elements',
        '`useRef` is strictly for class components',
      ],
      correct: 0,
      explanation: '`useRef` returns a mutable object whose `.current` property persists across renders without triggering a re-render when mutated. `useState` is used when changes must reflect in the UI.',
      hint: 'Think about storing timer IDs or tracking previous values without causing a UI repaint.',
    },
    {
      topic: 'Virtual DOM & Keys',
      prompt: 'Why is using array index as a `key` prop in dynamic lists considered an anti-pattern when list items can be sorted or filtered?',
      options: [
        'It causes a fatal memory leak in V8 engine',
        'It impairs React\'s reconciliation algorithm, causing stateful child components to retain incorrect internal state or re-render inefficiently',
        'React prohibits numbers as key props',
        'It slows down bundle loading times',
      ],
      correct: 1,
      explanation: 'Keys identify which items have changed, been added, or removed. Using array indices when list order changes confuses React\'s reconciliation diffing, causing state from one element to incorrectly bind to a different element.',
      hint: 'Keys allow React to preserve component identity across list reorderings.',
    },
  ],
  { featured: true, aliases: ['react', 'react hooks', 'react js', 'reactjs'] }
)

// 6. Node.js Backend Fundamentals Test
export const nodejsCoreTest: RawTest = buildExpandedTest(
  'nodejs-core',
  'nodejs-test',
  'Node.js Backend & Architecture Test',
  'Event loop phases, libuv, streams, buffers, cluster module, worker threads, and asynchronous I/O.',
  'Assess backend JavaScript engineering in Node.js: microtask queues vs macrotasks, backpressure in streams, non-blocking I/O, error handling, and thread concurrency.',
  webCat,
  'javascript',
  'intermediate',
  15,
  [
    {
      topic: 'Event Loop & Microtasks',
      prompt: 'In what order do `process.nextTick()`, `Promise.then()`, and `setTimeout(..., 0)` execute in Node.js when scheduled from the same synchronous block?',
      options: [
        '`setTimeout` -> `Promise.then` -> `process.nextTick`',
        '`process.nextTick` -> `Promise.then` -> `setTimeout`',
        '`Promise.then` -> `process.nextTick` -> `setTimeout`',
        'Random order depending on CPU load',
      ],
      correct: 1,
      explanation: 'Node.js processes the `process.nextTick` queue first immediately after current execution, followed by the microtask queue (`Promise.then`), before progressing to the Timers phase (`setTimeout`).',
      hint: '`process.nextTick` resolves before other microtasks, and microtasks resolve before the next event loop phase.',
    },
    {
      topic: 'Streams & Backpressure',
      prompt: 'What is "backpressure" in Node.js readable/writable streams?',
      options: [
        'A network security attack that overflows ports',
        'The condition where data is read faster than the downstream writable stream can write/process, necessitating pausing the readable stream to prevent memory exhaustion',
        'A crash caused by corrupted binary buffers',
        'Database connection pool starvation',
      ],
      correct: 1,
      explanation: 'Backpressure occurs when the readable stream sends data faster than the destination writable stream can consume. The `pipe()` method handles backpressure by pausing reading when the internal buffer fills (`write() returns false`) until a `drain` event fires.',
      hint: 'Think of plumbing where incoming fluid exceeds drainage rate.',
    },
    {
      topic: 'Worker Threads vs Cluster',
      prompt: 'What is the architectural difference between Node.js `worker_threads` and the `cluster` module?',
      options: [
        '`worker_threads` share process memory using `SharedArrayBuffer` within a single process, whereas `cluster` forks distinct operating system processes with separate memory spaces sharing a server port',
        '`cluster` is only supported on Linux',
        '`worker_threads` cannot execute JavaScript code',
        'There is no difference; both create operating system virtual machines',
      ],
      correct: 0,
      explanation: '`cluster` spawns multiple independent OS processes (each with their own V8 instance and memory space) that share server ports. `worker_threads` creates isolated V8 threads within the same process that can share memory via `SharedArrayBuffer`.',
      hint: 'One forks separate OS processes; the other creates threads inside a single process.',
    },
    {
      topic: 'Event Loop Non-Blocking I/O',
      prompt: 'Which underlying C library provides Node.js with its cross-platform asynchronous I/O event loop and thread pool?',
      options: ['libuv', 'OpenSSL', 'V8 engine directly', 'glibc'],
      correct: 0,
      explanation: '`libuv` is the multi-platform C library that handles the event loop, thread pool (for file I/O, DNS, crypto), child processes, and asynchronous network polling (epoll, kqueue, IOCP).',
      hint: 'It is the core C library powering Node\'s asynchronous I/O abstraction.',
    },
    {
      topic: 'Error Handling & Uncaught Exceptions',
      prompt: 'What is the recommended best practice when an `uncaughtException` event is emitted on the global `process` object in production?',
      options: [
        'Ignore it and continue running the application as normal',
        'Log the error, perform necessary synchronous cleanup, and exit the process (`process.exit(1)`), letting a process manager (e.g. PM2, Kubernetes) restart a fresh worker',
        'Catch it and re-bind all event listeners dynamically',
        'Send an HTTP 200 response to all connected clients',
      ],
      correct: 1,
      explanation: 'An uncaught exception indicates the application entered an indeterminate corrupted state. Node.js documentation strongly advises logging the incident and exiting the process immediately so a supervisor can spawn a clean instance.',
      hint: 'A process with an uncaught exception is in an unpredictable state; it must restart.',
    },
  ],
  { featured: true, aliases: ['nodejs', 'node', 'node js', 'express'] }
)

// 7. Data Analyst Interview Comprehensive Test
export const dataAnalystInterviewTest: RawTest = buildExpandedTest(
  'data-analyst-interview',
  'data-analyst-interview-test',
  'Data Analyst Technical Interview Test',
  'Comprehensive assessment: SQL analytics, business metrics (CAC, LTV, churn), statistical distributions, A/B testing, and data cleaning.',
  'Target core technical competencies for Data Analyst and BI Analyst interviews. Practice conversion funnels, cohort analysis, variance vs standard deviation, p-values, and SQL aggregation strategies.',
  interviewCat,
  'general',
  'intermediate',
  20,
  [
    {
      topic: 'Business Metrics',
      prompt: 'If a SaaS product has 1,000 active subscribers at the start of the month, gains 100 new users, and loses 50 existing users during the month, what is the customer churn rate?',
      options: ['5% (50 / 1000)', '10% (100 / 1000)', '4.5% (50 / 1100)', '50% (50 / 100)'],
      correct: 0,
      explanation: 'Customer Churn Rate is calculated as $(\\text{Lost Customers} / \\text{Starting Customers}) \\times 100 = (50 / 1000) \\times 100 = 5\\%$.',
      hint: 'Divide lost customers by the original starting customer base.',
    },
    {
      topic: 'Statistics & A/B Testing',
      prompt: 'In statistical hypothesis testing, what does a p-value of 0.03 indicate when testing at a significance level of $\\alpha = 0.05$?',
      options: [
        'There is a 3% chance the alternative hypothesis is true',
        'Assuming the null hypothesis is true, there is a 3% probability of observing results as extreme as the sample data; we reject the null hypothesis',
        'The test is statistically invalid',
        'The null hypothesis is proven 97% true',
      ],
      correct: 1,
      explanation: 'A p-value measures the probability of obtaining test results at least as extreme as observed data under the assumption that the null hypothesis is true. Since $p < 0.05$, the result is statistically significant and the null hypothesis is rejected.',
      hint: 'When p-value is less than alpha, reject the null hypothesis.',
    },
    {
      topic: 'Data Quality & Imputation',
      prompt: 'When dealing with right-skewed data containing extreme high outliers (e.g. household income), which measure of central tendency is preferred over the mean?',
      options: ['Median', 'Mode', 'Variance', 'Maximum'],
      correct: 0,
      explanation: 'The median is robust against extreme outliers and skewness, representing the 50th percentile of the distribution without being pulled upward by massive outlier values like the mean.',
      hint: 'Think about which metric splits the dataset in half regardless of magnitude.',
    },
    {
      topic: 'SQL Analytics & Cohorts',
      prompt: 'What SQL technique is commonly used to assign users to weekly or monthly cohort buckets based on their registration date?',
      options: ['`DATE_TRUNC(\'month\', created_at)`', '`ORDER BY created_at`', '`STRING_SPLIT(created_at)`', '`COUNT(created_at)`'],
      correct: 0,
      explanation: '`DATE_TRUNC(\'month\', timestamp)` (in PostgreSQL / standard SQL) truncates timestamps to the beginning of the specified month/week, allowing clean grouping into cohort intervals.',
      hint: 'Look for date truncation functions.',
    },
    {
      topic: 'Data Modeling & Schemas',
      prompt: 'In a dimensional Data Warehouse model (Star Schema), what is the difference between a Fact Table and a Dimension Table?',
      options: [
        'Fact tables store numerical, quantitative business measurements (e.g. sales revenue); Dimension tables store descriptive context attributes (e.g. customer name, store location)',
        'Fact tables store images; Dimension tables store text',
        'Dimension tables can only have 1 row',
        'There is no difference; they are exact duplicates',
      ],
      correct: 0,
      explanation: 'In dimensional modeling, Fact tables contain foreign keys and numeric measures (metrics, transactions), while Dimension tables contain context attributes used for filtering and grouping (who, what, where, when).',
      hint: 'Facts represent quantitative transactional measures; dimensions represent descriptive context.',
    },
  ],
  { featured: true, aliases: ['data analyst', 'data analyst interview', 'business analyst'] }
)

// 8. Aptitude & Quantitative Ability Test
export const quantitativeAptitudeTest: RawTest = buildExpandedTest(
  'quantitative-aptitude',
  'quantitative-aptitude-test',
  'Quantitative Aptitude & Problem Solving Test',
  'Core mathematical reasoning: percentages, profit and loss, time and work, speed-distance-time, and probability.',
  'Assess speed and mathematical reasoning required for campus placements and competitive examinations. Solve word problems on ratios, interest calculations, pipes and cisterns, and combinatorial counting.',
  interviewCat,
  'general',
  'intermediate',
  15,
  [
    {
      topic: 'Time and Work',
      prompt: 'Worker A can complete a job in 10 days, and Worker B can complete the same job in 15 days. How many days will it take if they work together?',
      options: ['6 days', '8 days', '12.5 days', '5 days'],
      correct: 0,
      explanation: 'In 1 day, A completes $1/10$ of the work and B completes $1/15$. Combined 1-day rate $= 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6$. Therefore, the total time required is 6 days.',
      hint: 'Add their individual 1-day rates together: $1/A + 1/B$.',
    },
    {
      topic: 'Speed, Distance, and Time',
      prompt: 'A train traveling at 72 km/h crosses a 200-meter long platform in 20 seconds. What is the length of the train?',
      options: ['200 meters', '250 meters', '300 meters', '400 meters'],
      correct: 0,
      explanation: 'Convert speed to m/s: $72 \\times (5/18) = 20\\text{ m/s}$. Total distance covered in 20 seconds $= 20 \\times 20 = 400\\text{ meters}$. Train length $= \\text{Total distance} - \\text{Platform length} = 400 - 200 = 200\\text{ meters}$.',
      hint: 'Convert km/h to m/s by multiplying by $5/18$, then calculate total distance.',
    },
    {
      topic: 'Profit and Loss',
      prompt: 'An item bought for $80 is sold for $100. What is the percentage profit on the cost price?',
      options: ['20%', '25%', '15%', '30%'],
      correct: 1,
      explanation: '$\\text{Profit} = 100 - 80 = 20$. $\\text{Percentage Profit} = (\\text{Profit} / \\text{Cost Price}) \\times 100 = (20 / 80) \\times 100 = 25\\%$.',
      hint: 'Divide profit by the original cost price ($80), not the selling price.',
    },
    {
      topic: 'Probability & Combinatorics',
      prompt: 'What is the probability of getting a sum of 7 when rolling two fair six-sided dice simultaneously?',
      options: ['1/6 (6/36)', '1/12 (3/36)', '7/36', '1/36'],
      correct: 0,
      explanation: 'Total outcomes $= 6 \\times 6 = 36$. Outcomes summing to 7 are: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) — exactly 6 pairs. Probability $= 6/36 = 1/6$.',
      hint: 'Count the number of pairs that add up to 7 out of 36 total outcomes.',
    },
    {
      topic: 'Compound Interest',
      prompt: 'What is the compound interest on $1,000 at 10% per annum compounded annually for 2 years?',
      options: ['$200', '$210', '$220', '$100'],
      correct: 1,
      explanation: '$\\text{Total Amount} = P(1 + r)^t = 1000 \\times (1.10)^2 = 1000 \\times 1.21 = \\$1210$. $\\text{Interest} = 1210 - 1000 = \\$210$. (Simple interest would be $200).',
      hint: 'Apply $P(1 + r)^t - P$.',
    },
  ],
  { featured: true, aliases: ['aptitude', 'quantitative aptitude', 'math aptitude', 'placement aptitude'] }
)

export const STRATEGIC_EXPANDED_TESTS: RawTest[] = [
  pythonOopTest,
  pythonOutputTest,
  sqlWindowFunctionsTest,
  sqlJoinsTest,
  reactCoreTest,
  nodejsCoreTest,
  dataAnalystInterviewTest,
  quantitativeAptitudeTest,
]
