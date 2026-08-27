import { buildExpandedTest } from '../testBuilder'

const dataCat = {
  id: 'cat-data-analytics',
  name: 'Data & Analytics',
  slug: 'data-analytics',
  description: 'SQL queries, analytics pipelines, Business Intelligence, and data manipulation.',
  color: '#0ea5e9',
  icon: 'Database',
}

export const sqlGroupByTest = buildExpandedTest(
  'sql-group-by',
  'sql-group-by-test',
  'SQL GROUP BY & Aggregation Test',
  'Master GROUP BY, HAVING, aggregate functions, ROLLUP, CUBE, GROUPING SETS, and common analytics patterns.',
  'Deep assessment of SQL aggregation: grouping strategies, HAVING versus WHERE, multiple-column grouping, ROLLUP for subtotals, CUBE for all combinations, NULL handling in aggregation, and efficient GROUP BY query design.',
  dataCat,
  'sql',
  'intermediate',
  20,
  [
    {
      topic: 'GROUP BY – Basics',
      prompt: 'What does `GROUP BY department` do in a SQL query?',
      options: [
        'Sorts the result alphabetically by department',
        'Collapses all rows with the same department value into a single output row, allowing aggregate functions to compute values per department',
        'Filters out rows where department is NULL',
        'Creates a new table for each department',
      ],
      correct: 1,
      explanation:
        '`GROUP BY` partitions the rows of a query into groups sharing identical values in the specified columns. Aggregate functions (COUNT, SUM, AVG, MAX, MIN) then compute one value per group. Non-aggregated columns in SELECT must appear in the GROUP BY clause.',
      hint: 'Think of GROUP BY as "organize rows into buckets, then aggregate each bucket".',
      difficulty: 'beginner',
      tags: ['GROUP BY', 'Aggregation', 'SQL Basics'],
    },
    {
      topic: 'GROUP BY – Multiple Columns',
      prompt: 'What does `GROUP BY department, job_title` produce versus `GROUP BY department` alone?',
      options: [
        'Both produce the same number of rows',
        'GROUP BY department, job_title creates groups for each unique combination of department AND job_title, typically producing more rows with finer-grained aggregation',
        'GROUP BY with two columns creates two separate result sets',
        'The second column acts as a secondary sort only',
      ],
      correct: 1,
      explanation:
        'Multi-column GROUP BY groups by the Cartesian combination of specified columns. `GROUP BY department` yields one row per department. `GROUP BY department, job_title` yields one row per unique (department, job_title) pair – a finer level of granularity.',
      hint: 'More columns = more groups = finer granularity.',
      difficulty: 'beginner',
      tags: ['GROUP BY', 'Multi-column', 'Aggregation'],
    },
    {
      topic: 'HAVING vs WHERE',
      prompt: 'Why can you NOT use `WHERE` to filter on a `COUNT()` result, but you CAN use `HAVING`?',
      options: [
        'WHERE is slower than HAVING for aggregates',
        'WHERE filters rows before grouping (individual row level); COUNT() is calculated after grouping, so it does not exist during the WHERE evaluation phase — HAVING filters after GROUP BY is applied',
        'HAVING is just a more modern syntax for WHERE',
        'COUNT() cannot be used with WHERE due to a SQL syntax restriction',
      ],
      correct: 1,
      explanation:
        'SQL logical processing order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. WHERE runs on individual rows before aggregation — aggregated values like COUNT() don\'t exist yet. HAVING runs after GROUP BY on aggregated results, so `HAVING COUNT(*) > 5` is valid.',
      hint: 'WHERE = before aggregation; HAVING = after aggregation.',
      difficulty: 'intermediate',
      tags: ['HAVING', 'WHERE', 'GROUP BY'],
    },
    {
      topic: 'Aggregate – NULL handling',
      prompt: 'If a column has values [10, 20, NULL, 30], what does `AVG(column)` return?',
      options: [
        '15 (sum 60 / 4 rows including NULL)',
        '20 (sum 60 / 3 non-NULL values)',
        'NULL because the column contains NULL',
        'An error',
      ],
      correct: 1,
      explanation:
        'All aggregate functions except COUNT(*) ignore NULL values. `AVG()` divides the sum of non-NULL values by the count of non-NULL rows. So AVG([10, 20, NULL, 30]) = (10 + 20 + 30) / 3 = 20. Use `COALESCE(col, 0)` before AVG if you want NULLs treated as zero.',
      hint: 'Aggregates (except COUNT(*)) skip NULL values automatically.',
      difficulty: 'intermediate',
      tags: ['NULL', 'AVG', 'Aggregate Functions'],
    },
    {
      topic: 'COUNT(*) vs COUNT(column)',
      prompt: 'A table has 100 rows. Column `phone` is NULL for 30 rows. What do these return?',
      codeSnippet: `SELECT COUNT(*), COUNT(phone) FROM customers;`,
      codeLanguage: 'sql',
      options: [
        'Both return 100',
        'COUNT(*) = 100, COUNT(phone) = 70',
        'COUNT(*) = 70, COUNT(phone) = 100',
        'Both return 70',
      ],
      correct: 1,
      explanation:
        '`COUNT(*)` counts all rows regardless of NULLs (returns 100). `COUNT(phone)` counts only rows where `phone IS NOT NULL` (returns 70). This distinction is critical when checking record completeness or calculating percentages.',
      hint: 'COUNT(*) = total rows; COUNT(col) = non-NULL values in that column.',
      difficulty: 'beginner',
      tags: ['COUNT', 'NULL', 'Aggregation'],
    },
    {
      topic: 'GROUP BY – Column position shorthand',
      prompt: 'Is `GROUP BY 1, 2` valid SQL, and what does it mean?',
      options: [
        'It is invalid SQL syntax',
        'It is valid in most SQL dialects and refers to GROUP BY the 1st and 2nd column in the SELECT list by position — a shorthand, though generally discouraged for readability',
        'It groups by the literal integer values 1 and 2',
        'It creates groups of exactly 1 or 2 rows',
      ],
      correct: 1,
      explanation:
        'Most SQL engines allow referencing SELECT column positions in GROUP BY (and ORDER BY). `GROUP BY 1` means "group by the first column listed in SELECT". While convenient for ad-hoc queries, it reduces readability and breaks if column order changes.',
      hint: 'Positional references are column positions in the SELECT list.',
      difficulty: 'intermediate',
      tags: ['GROUP BY', 'SQL Syntax', 'Best Practices'],
    },
    {
      topic: 'ROLLUP',
      prompt: 'What does `GROUP BY ROLLUP(region, department)` produce that plain `GROUP BY region, department` does not?',
      options: [
        'ROLLUP sorts the results alphabetically',
        'ROLLUP generates subtotal rows at each grouping level: results grouped by (region, department), then by (region) alone, then a grand total row – a hierarchy of aggregations in a single query',
        'ROLLUP creates a new table for each combination',
        'ROLLUP is only available in Oracle SQL',
      ],
      correct: 1,
      explanation:
        '`ROLLUP(region, department)` produces three result sets unioned: (1) by region + department, (2) by region alone (subtotal per region), (3) a grand total row. The NULL values in the grouping column identify subtotal/total rows. Use `GROUPING(col)` function to distinguish NULL group keys from NULL data values.',
      hint: 'ROLLUP adds progressive summary rows up the grouping hierarchy.',
      difficulty: 'advanced',
      tags: ['ROLLUP', 'Subtotals', 'GROUP BY'],
    },
    {
      topic: 'CUBE',
      prompt: 'How does `GROUP BY CUBE(region, department)` differ from `GROUP BY ROLLUP(region, department)`?',
      options: [
        'They are identical in output',
        'CUBE generates all possible grouping combinations (region + department, region alone, department alone, grand total); ROLLUP only generates hierarchical subtotals top-down (region + department, region alone, grand total)',
        'CUBE produces fewer rows than ROLLUP',
        'ROLLUP generates all combinations; CUBE only hierarchical ones',
      ],
      correct: 1,
      explanation:
        '`CUBE` generates the power set of grouping combinations: for (region, department), this means (region, department), (region), (department), and () grand total = 4 groupings. `ROLLUP` only generates the N+1 hierarchical levels: (region, department), (region), (). CUBE is useful for cross-dimensional analysis.',
      hint: 'CUBE = all combinations (power set); ROLLUP = top-down hierarchy.',
      difficulty: 'advanced',
      tags: ['CUBE', 'ROLLUP', 'Aggregation Grouping'],
    },
    {
      topic: 'String Aggregation',
      prompt: 'Which SQL function concatenates grouped values into a comma-separated string in PostgreSQL?',
      options: [
        'GROUP_CONCAT() (MySQL only)',
        'STRING_AGG(column, \',\') in PostgreSQL; GROUP_CONCAT(column) in MySQL',
        'CONCAT_GROUP(column, \',\')',
        'ARRAY_AGG(column)',
      ],
      correct: 1,
      explanation:
        '`STRING_AGG(value, delimiter)` (PostgreSQL, SQL Server 2017+) concatenates non-null values within a group. MySQL uses `GROUP_CONCAT(col SEPARATOR \',\')`. Standard SQL has no built-in string aggregation function, making this a dialect-specific feature.',
      hint: 'The function name differs between PostgreSQL and MySQL.',
      difficulty: 'intermediate',
      tags: ['STRING_AGG', 'GROUP_CONCAT', 'String Aggregation'],
    },
    {
      topic: 'Filtering with HAVING and WHERE together',
      prompt: 'What does this query return?',
      codeSnippet: `SELECT department, COUNT(*) as emp_count
FROM employees
WHERE salary > 50000
GROUP BY department
HAVING COUNT(*) >= 3;`,
      codeLanguage: 'sql',
      options: [
        'All departments where any employee earns over 50k',
        'Departments where at least 3 employees earn over 50k – WHERE filters to high-earners first, then HAVING filters groups with 3+ members',
        'Departments with average salary over 50k',
        'All employees earning over 50k in departments with 3+ total employees',
      ],
      correct: 1,
      explanation:
        'Execution order: (1) WHERE filters individual rows to salary > 50k; (2) GROUP BY groups remaining rows by department; (3) HAVING filters groups to those with 3+ members. Result: departments where at least 3 employees earn over 50k.',
      hint: 'Both WHERE and HAVING are active; they filter at different stages.',
      difficulty: 'intermediate',
      tags: ['WHERE', 'HAVING', 'Combined Filtering'],
    },
    {
      topic: 'MAX and MIN with GROUP BY',
      prompt: 'What does this query return per department?',
      codeSnippet: `SELECT department, MIN(hire_date) AS earliest_hire, MAX(salary) AS top_salary
FROM employees
GROUP BY department;`,
      codeLanguage: 'sql',
      options: [
        'The employee with the lowest salary in each department',
        'Per department: the earliest (oldest) hire date and the highest salary — NOT necessarily from the same employee',
        'The department average salary and total headcount',
        'The single employee with both the earliest hire date and highest salary',
      ],
      correct: 1,
      explanation:
        '`MIN(hire_date)` and `MAX(salary)` are independent aggregate computations. Each returns the aggregate value across all rows in the group — they do not refer to the same row. To find which specific employee has both, you would need a subquery or window function.',
      hint: 'MIN and MAX are computed independently; they may reference different rows.',
      difficulty: 'intermediate',
      tags: ['MIN', 'MAX', 'Aggregation'],
    },
    {
      topic: 'GROUP BY with CASE expression',
      prompt: 'Is it valid to GROUP BY a CASE expression in SQL?',
      codeSnippet: `SELECT
  CASE WHEN salary >= 80000 THEN 'Senior' ELSE 'Junior' END AS level,
  COUNT(*) AS count
FROM employees
GROUP BY CASE WHEN salary >= 80000 THEN 'Senior' ELSE 'Junior' END;`,
      codeLanguage: 'sql',
      options: [
        'No – GROUP BY cannot reference expressions, only column names',
        'Yes – you can GROUP BY any scalar expression, including CASE WHEN statements',
        'Only if you first create a VIEW with the computed column',
        'Only in PostgreSQL, not MySQL or SQL Server',
      ],
      correct: 1,
      explanation:
        'SQL allows grouping by expressions in the GROUP BY clause — including CASE WHEN, arithmetic, and string functions. Some databases (PostgreSQL, MySQL 5.7+) also allow referencing a SELECT alias in GROUP BY (`GROUP BY level`), but standard SQL requires repeating the expression.',
      hint: 'GROUP BY can reference expressions, not just raw column names.',
      difficulty: 'intermediate',
      tags: ['GROUP BY', 'CASE', 'Expressions'],
    },
    {
      topic: 'Aggregate – SUM with DISTINCT',
      prompt: 'What does `SUM(DISTINCT amount)` do differently from `SUM(amount)`?',
      options: [
        'They produce the same result always',
        'SUM(DISTINCT amount) sums only unique values, counting each distinct value only once even if it appears multiple times; SUM(amount) sums all values including duplicates',
        'SUM(DISTINCT) sorts values before summing',
        'SUM(DISTINCT) raises an error on NULL values',
      ],
      correct: 1,
      explanation:
        '`DISTINCT` inside an aggregate function deduplicates values before computing. `SUM(DISTINCT amount)` on [10, 20, 10, 30] = 60 (10+20+30). `SUM(amount)` = 70 (10+20+10+30). Useful when joining tables produces duplicate measure rows.',
      hint: 'DISTINCT inside aggregate removes duplicates before the calculation.',
      difficulty: 'intermediate',
      tags: ['SUM', 'DISTINCT', 'Aggregation'],
    },
    {
      topic: 'GROUPING SETS',
      prompt: 'What does `GROUP BY GROUPING SETS ((region), (department), ())` produce?',
      options: [
        'It is equivalent to GROUP BY region, department',
        'Three separate aggregation levels in one query: subtotals by region, subtotals by department, and a grand total row – providing custom combinations without ROLLUP hierarchy constraints',
        'It randomly selects one of the three groupings to compute',
        'GROUPING SETS is not standard SQL',
      ],
      correct: 1,
      explanation:
        '`GROUPING SETS` is the most flexible aggregation extension, allowing you to specify exactly which grouping combinations to compute. Unlike ROLLUP (hierarchical) or CUBE (all combinations), GROUPING SETS gives you precise control: aggregate by region, separately by department, and a grand total — three result sets in one query.',
      hint: 'GROUPING SETS = precise control over exactly which groupings to compute.',
      difficulty: 'advanced',
      tags: ['GROUPING SETS', 'Advanced Aggregation', 'SQL'],
    },
  ],
  { featured: true, aliases: ['sql group by', 'sql aggregation', 'sql having', 'sql count group'] }
)

export const sqlSubqueriesTest = buildExpandedTest(
  'sql-subqueries',
  'sql-subqueries-test',
  'SQL Subqueries & CTEs Test',
  'Correlated subqueries, scalar subqueries, EXISTS, IN vs EXISTS, CTEs (WITH clause), and recursive CTEs.',
  'Assess advanced SQL query composition techniques: correlated vs uncorrelated subqueries, the EXISTS operator for semi-joins, scalar subquery performance, Common Table Expressions (CTEs) for readability, and recursive CTEs for hierarchical data traversal.',
  dataCat,
  'sql',
  'advanced',
  20,
  [
    {
      topic: 'Subquery – Correlated vs Uncorrelated',
      prompt: 'What is the key difference between a correlated and an uncorrelated subquery?',
      options: [
        'Correlated subqueries use JOINs; uncorrelated use WHERE',
        'An uncorrelated subquery executes once and returns a fixed result used by the outer query; a correlated subquery references columns from the outer query and re-executes once per row of the outer query',
        'Correlated subqueries are always faster than uncorrelated',
        'Uncorrelated subqueries cannot return multiple rows',
      ],
      correct: 1,
      explanation:
        'An uncorrelated subquery is self-contained and executes once. A correlated subquery references outer query columns (e.g. `WHERE e.department_id = d.id`) and must re-run for each row of the outer query, which can be expensive for large tables. The query optimizer often transforms them into JOINs.',
      hint: 'Does the subquery reference the outer query? If yes, it is correlated.',
      difficulty: 'intermediate',
      tags: ['Subquery', 'Correlated', 'Performance'],
    },
    {
      topic: 'EXISTS vs IN',
      prompt: 'For finding customers who have orders, when does `EXISTS` significantly outperform `IN`?',
      options: [
        'EXISTS is always slower than IN',
        'EXISTS performs a semi-join and short-circuits as soon as any match is found; IN first evaluates the full subquery result set. EXISTS is faster when the subquery result set is large, when joins would produce many matches, or when dealing with NULLs',
        'They are always equally performant',
        'IN is faster for large result sets; EXISTS only helps for empty result sets',
      ],
      correct: 1,
      explanation:
        '`EXISTS` uses a semi-join: it stops scanning as soon as the first matching row is found, returning TRUE immediately. `IN` evaluates the entire subquery first. Critically, `IN (NULL, ...)` returns UNKNOWN (never true), but `EXISTS` handles NULLs correctly. EXISTS is typically preferred for correlated existence checks.',
      hint: 'EXISTS short-circuits; IN evaluates everything first.',
      difficulty: 'intermediate',
      tags: ['EXISTS', 'IN', 'Semi-Join', 'Performance'],
    },
    {
      topic: 'NOT IN vs NOT EXISTS with NULLs',
      prompt: 'Why does `NOT IN (subquery)` return no rows when the subquery result contains any NULL value?',
      options: [
        'NULL is treated as an empty string in NOT IN',
        'SQL uses three-valued logic: comparisons with NULL return UNKNOWN. `value NOT IN (1, 2, NULL)` becomes `value <> 1 AND value <> 2 AND value <> NULL`. The last comparison is UNKNOWN, making the whole expression UNKNOWN (not true), so no rows pass',
        'NOT IN automatically excludes NULL values from its list',
        'NOT IN is deprecated; use NOT EXISTS instead',
      ],
      correct: 1,
      explanation:
        'In SQL three-valued logic, any comparison with NULL produces UNKNOWN. `x NOT IN (1, NULL)` evaluates to `x <> 1 AND x <> NULL`. `x <> NULL` is always UNKNOWN, so the AND is UNKNOWN for all x. No rows pass, even those that genuinely have no match. `NOT EXISTS` avoids this issue because it operates at the row level.',
      hint: 'NULL in NOT IN = UNKNOWN = zero rows matched.',
      difficulty: 'advanced',
      tags: ['NOT IN', 'NULL', 'Three-Valued Logic'],
    },
    {
      topic: 'Scalar Subquery',
      prompt: 'What is a scalar subquery, and what happens if it returns more than one row?',
      options: [
        'A scalar subquery returns multiple rows; the outer query gets one per join',
        'A scalar subquery must return exactly one column and one row (or NULL); if it returns multiple rows, SQL raises a runtime error',
        'Scalar subqueries can return unlimited rows in a WHERE clause',
        'Scalar subqueries only work in the FROM clause',
      ],
      correct: 1,
      explanation:
        'A scalar subquery used in SELECT, WHERE, or HAVING must return exactly one column and at most one row. If it returns multiple rows, the database raises a "subquery returns more than one row" error at runtime. To avoid this, use LIMIT 1, aggregate, or restructure as a JOIN.',
      hint: 'Scalar = single value; more than one row = runtime error.',
      difficulty: 'intermediate',
      tags: ['Scalar Subquery', 'Subquery', 'Error Handling'],
    },
    {
      topic: 'CTE – WITH clause',
      prompt: 'What is a Common Table Expression (CTE) and what are its advantages over subqueries in the FROM clause?',
      options: [
        'CTEs are stored permanently in the database like views',
        'A CTE (WITH clause) is a named temporary result set defined at the top of the query; advantages include improved readability, the ability to reference the same CTE multiple times without duplication, and support for recursion',
        'CTEs always have better performance than subqueries',
        'CTEs require a separate database transaction',
      ],
      correct: 1,
      explanation:
        'CTEs (`WITH cte_name AS (SELECT ...)`) are named inline views that exist only for the duration of the query. They improve readability by naming complex subqueries, can be referenced multiple times in the main query (unlike subqueries), enable recursive queries (WITH RECURSIVE), and make complex queries far easier to understand and maintain.',
      hint: 'CTE = named, reusable, readable temporary result set within one query.',
      difficulty: 'intermediate',
      tags: ['CTE', 'WITH clause', 'Readability'],
    },
    {
      topic: 'Recursive CTE',
      prompt: 'What real-world problem is a recursive CTE (WITH RECURSIVE) most suited for?',
      options: [
        'Calculating running totals more efficiently than window functions',
        'Traversing hierarchical or tree-structured data stored in a self-referencing table – such as organizational hierarchies, bill-of-materials, category trees, or folder structures',
        'Replacing GROUP BY ROLLUP for subtotal calculations',
        'Joining more than 5 tables in a single query',
      ],
      correct: 1,
      explanation:
        'Recursive CTEs solve hierarchical traversal: a recursive member references the CTE itself, expanding one level at a time (e.g. "get employee, then their manager, then their manager\'s manager..."). Standard SQL requires a base case (anchor) and recursive case, with a termination condition to prevent infinite recursion.',
      hint: 'Think: "find all descendants in an org chart stored in one employees table".',
      difficulty: 'advanced',
      tags: ['Recursive CTE', 'Hierarchical Data', 'Tree Traversal'],
    },
    {
      topic: 'Subquery in SELECT clause',
      prompt: 'What does a subquery in the SELECT clause compute in this example?',
      codeSnippet: `SELECT
  e.name,
  e.salary,
  (SELECT AVG(salary) FROM employees WHERE department = e.department) AS dept_avg
FROM employees e;`,
      codeLanguage: 'sql',
      options: [
        'The overall company average salary for all employees',
        'For each employee row, the average salary of their specific department – this is a correlated scalar subquery that re-executes per row',
        'A single average for all departments combined',
        'This query raises a syntax error',
      ],
      correct: 1,
      explanation:
        'This correlated scalar subquery re-runs for each employee row, filtering to that employee\'s department. It is equivalent to `AVG(salary) OVER (PARTITION BY department)` using a window function, which is generally more efficient. Both are valid approaches for per-group context values alongside individual row data.',
      hint: 'The subquery references e.department from the outer query — correlated.',
      difficulty: 'advanced',
      tags: ['Correlated Subquery', 'SELECT clause', 'Performance'],
    },
    {
      topic: 'CTE vs Temporary Table',
      prompt: 'When should you use a temporary table instead of a CTE?',
      options: [
        'Always prefer temporary tables; CTEs have no advantages',
        'Temporary tables are beneficial when: the result set is very large, it is used across multiple queries/stored procedures, you need to add indexes to it, or you need the intermediate result to persist beyond a single query',
        'CTEs are permanent; temporary tables last only one session',
        'Temporary tables require special permissions; CTEs do not',
      ],
      correct: 1,
      explanation:
        'CTEs are scoped to a single query and materialised once per query execution (or re-evaluated per reference depending on the optimizer). Temp tables persist for the session, can be indexed, can be populated with INSERT statements, and survive complex stored procedure flows. For expensive intermediate results used multiple times, temp tables often outperform CTEs.',
      hint: 'CTEs = single query; temp tables = multi-query, indexable, persistent in session.',
      difficulty: 'advanced',
      tags: ['CTE', 'Temporary Table', 'Performance'],
    },
    {
      topic: 'Subquery in FROM – Derived Table',
      prompt: 'What is a "derived table" in SQL?',
      options: [
        'A table created automatically from a view',
        'A subquery used in the FROM clause that produces a named inline result set the outer query can SELECT from as if it were a regular table',
        'A base table that inherits columns from another table',
        'A table stored in the database temp schema',
      ],
      correct: 1,
      explanation:
        'A derived table (subquery in FROM) is an inline view: `SELECT * FROM (SELECT ...) AS derived`. It is processed first and the outer query operates on its results. CTEs are the modern replacement for derived tables in most scenarios, but both are logically equivalent (derived tables require inline aliases in SQL Server).',
      hint: 'Derived table = subquery in FROM clause with an alias.',
      difficulty: 'intermediate',
      tags: ['Derived Table', 'Subquery', 'FROM clause'],
    },
    {
      topic: 'Subquery – ANY / ALL operators',
      prompt: 'What does `salary > ALL (SELECT salary FROM managers)` return?',
      options: [
        'Rows where salary equals any manager\'s salary',
        'Rows where the salary is greater than every manager\'s salary (greater than the maximum manager salary)',
        'Rows where salary is greater than the average manager salary',
        'Rows where salary is greater than at least one manager\'s salary',
      ],
      correct: 1,
      explanation:
        '`ALL` requires the condition to be true for every value returned by the subquery. `salary > ALL (manager_salaries)` is equivalent to `salary > MAX(manager_salaries)`. `ANY` (or `SOME`) requires the condition to be true for at least one value: `salary > ANY (...)` = `salary > MIN(...)`.',
      hint: 'ALL = must exceed every value; ANY = must exceed at least one value.',
      difficulty: 'advanced',
      tags: ['ALL', 'ANY', 'Subquery Operators'],
    },
  ],
  { featured: true, aliases: ['sql subquery', 'sql cte', 'sql with clause', 'sql correlated subquery'] }
)
