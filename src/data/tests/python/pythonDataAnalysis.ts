import { buildExpandedTest } from '../testBuilder'

const dataCat = {
  id: 'cat-data-analytics',
  name: 'Data & Analytics',
  slug: 'data-analytics',
  description: 'SQL queries, analytics pipelines, Business Intelligence, and data manipulation.',
  color: '#0ea5e9',
  icon: 'Database',
}

export const pythonDataAnalysisTest = buildExpandedTest(
  'python-data-analysis',
  'python-data-analysis-test',
  'Python for Data Analysis Test',
  'Pandas, NumPy, data cleaning, groupby, merge/join, vectorization, and exploratory data analysis patterns.',
  'Comprehensive assessment of Python data analysis skills using Pandas and NumPy. Topics include DataFrame operations, data cleaning pipelines, groupby aggregations, merge strategies, time series indexing, and performance optimization through vectorization.',
  dataCat,
  'python',
  'intermediate',
  30,
  [
    {
      topic: 'Pandas – Series vs DataFrame',
      prompt: 'What is the structural difference between a Pandas Series and a DataFrame?',
      options: [
        'Both are identical one-dimensional arrays',
        'A Series is a one-dimensional labeled array (one column with an index); a DataFrame is a two-dimensional tabular structure (multiple Series sharing the same index, each column being one Series)',
        'A DataFrame is a list of Series stored in memory; a Series is a database cursor',
        'Series supports only numeric data; DataFrames support all types',
      ],
      correct: 1,
      explanation:
        'A `pd.Series` is essentially a 1D array with a labeled index. A `pd.DataFrame` is a 2D labeled data structure where each column is a Series sharing the same index. You can think of a DataFrame as a dict of Series with aligned indexes.',
      hint: 'Series = 1D column with index; DataFrame = 2D table = collection of Series.',
      difficulty: 'beginner',
      tags: ['Pandas', 'Series', 'DataFrame'],
    },
    {
      topic: 'Pandas – Reading Data',
      prompt: 'Which Pandas function reads a CSV file into a DataFrame, and what is the `usecols` parameter for?',
      options: [
        'pd.load_csv(); usecols filters rows',
        'pd.read_csv(); usecols specifies a list of column names or indices to load, reducing memory by not loading irrelevant columns',
        'pd.import_csv(); usecols sets the column data types',
        'pd.read_csv(); usecols sets the index column',
      ],
      correct: 1,
      explanation:
        '`pd.read_csv(filepath, usecols=[\'name\', \'salary\'])` reads only the specified columns into memory — critical for large files with many irrelevant columns. Other useful parameters: `dtype` (column types), `parse_dates` (auto-parse date strings), `chunksize` (streaming large files), `skiprows`, `nrows`.',
      hint: 'usecols is a whitelist of columns to load — saves memory on large files.',
      difficulty: 'beginner',
      tags: ['Pandas', 'read_csv', 'Data Loading'],
    },
    {
      topic: 'Pandas – Selecting Data',
      prompt: 'What is the difference between `.loc[]` and `.iloc[]` for selecting DataFrame rows?',
      options: [
        'loc uses column names; iloc uses row numbers — both are equivalent for integer indexes',
        'loc selects by label (row index value); iloc selects by integer position (0-based). When the index is non-default, they diverge significantly',
        'iloc is deprecated in recent Pandas versions',
        'They are identical in all cases',
      ],
      correct: 1,
      explanation:
        '`.loc[label]` uses the DataFrame index labels for selection. `.iloc[n]` uses 0-based integer positions. When a DataFrame has a string index like `df.index = [\'a\', \'b\', \'c\']`, `df.loc[\'b\']` returns the "b" row, but `df.iloc[1]` also returns the second row — they happen to agree only when the index is a RangeIndex.',
      hint: 'loc = label-based; iloc = position-based (integer location).',
      difficulty: 'intermediate',
      tags: ['Pandas', 'loc', 'iloc', 'Indexing'],
    },
    {
      topic: 'Pandas – Boolean Indexing',
      prompt: 'How do you select all rows where salary > 70000 AND department == "Engineering"?',
      codeSnippet: `import pandas as pd
df = pd.read_csv('employees.csv')
# How to filter?`,
      codeLanguage: 'python',
      options: [
        'df[salary > 70000 and department == "Engineering"]',
        'df[(df["salary"] > 70000) & (df["department"] == "Engineering")]',
        'df.filter(salary > 70000, department == "Engineering")',
        'df.where("salary > 70000 AND department == \'Engineering\'")',
      ],
      correct: 1,
      explanation:
        'Pandas boolean indexing uses bitwise operators `&` (AND), `|` (OR), `~` (NOT) — not Python\'s `and`/`or` (which fail on arrays). Each condition must be wrapped in parentheses due to operator precedence. `.query()` method also works: `df.query("salary > 70000 and department == \'Engineering\'")`.',
      hint: 'Use & not and; wrap each condition in parentheses.',
      difficulty: 'beginner',
      tags: ['Pandas', 'Boolean Indexing', 'Filtering'],
    },
    {
      topic: 'Pandas – Missing Values',
      prompt: 'What is the difference between `df.dropna()` and `df.fillna()` for handling missing values?',
      options: [
        'dropna() fills with zeros; fillna() removes rows',
        'dropna() removes rows (or columns) containing NaN values; fillna() replaces NaN values with a specified value (constant, mean, forward-fill, back-fill)',
        'Both remove missing values but with different thresholds',
        'fillna() is only for categorical columns',
      ],
      correct: 1,
      explanation:
        '`dropna()` removes rows or columns with NaN values (controllable with `axis`, `thresh`, `subset`). `fillna()` imputes missing values: `df[\'age\'].fillna(df[\'age\'].mean())`, `fillna(method=\'ffill\')` (forward fill from previous value), `fillna(method=\'bfill\')` (backward fill). Choice depends on analysis requirements.',
      hint: 'dropna = eliminate NaN rows/cols; fillna = substitute NaN with a value.',
      difficulty: 'beginner',
      tags: ['Missing Values', 'dropna', 'fillna'],
    },
    {
      topic: 'Pandas – groupby',
      prompt: 'What does `df.groupby("department")["salary"].agg(["mean", "count", "max"])` return?',
      options: [
        'A single scalar mean salary across all departments',
        'A DataFrame with one row per department, containing three columns: mean salary, employee count, and max salary for each department',
        'Three separate Series objects',
        'An error because agg() does not accept lists',
      ],
      correct: 1,
      explanation:
        '`groupby().agg()` applies multiple aggregation functions simultaneously. Passing a list produces a DataFrame with one row per group and one column per aggregation function. Passing a dict maps column names to specific functions: `agg({"salary": "mean", "bonus": "sum"})`.',
      hint: 'agg with a list = multiple aggregations per group in one call.',
      difficulty: 'intermediate',
      tags: ['groupby', 'agg', 'Aggregation'],
    },
    {
      topic: 'Pandas – merge vs join',
      prompt: 'What is the difference between `pd.merge()` and `df.join()` in Pandas?',
      options: [
        'They are identical; join is just shorthand for merge',
        'merge() is more flexible: joins on any columns with full control (how, on, left_on, right_on); join() is a convenience method that joins on the index by default (or a specified key column on the left)',
        'join() is for horizontal concatenation; merge() for vertical',
        'merge() only supports inner joins; join() supports all join types',
      ],
      correct: 1,
      explanation:
        '`pd.merge()` is the full-featured SQL-like join: specify any column(s) as join keys, choose join type (inner, left, right, outer), handle key naming collisions. `df.join()` is a shorthand for merging on the index: `df1.join(df2)` joins where df2\'s index matches df1\'s index. For column-based joins, `merge()` is preferred.',
      hint: 'merge = full control; join = index-based convenience.',
      difficulty: 'intermediate',
      tags: ['merge', 'join', 'Pandas'],
    },
    {
      topic: 'Pandas – pivot_table',
      prompt: 'What does `df.pivot_table(values="sales", index="region", columns="quarter", aggfunc="sum")` produce?',
      options: [
        'A flat list of sales values sorted by region',
        'A cross-tabulation: rows = regions, columns = quarters, each cell = the sum of sales for that region/quarter combination',
        'A pivot chart rendered in matplotlib',
        'An error because index and columns cannot be specified simultaneously',
      ],
      correct: 1,
      explanation:
        '`pivot_table()` creates a spreadsheet-style pivot table. `values` is the measure to aggregate, `index` defines the rows, `columns` defines the column headers, `aggfunc` defines the aggregation (default: mean). Multiple values and functions can be specified. Missing combinations produce NaN (fill with `fill_value`).',
      hint: 'pivot_table = SQL GROUP BY region, quarter with SUM, displayed as a 2D matrix.',
      difficulty: 'intermediate',
      tags: ['pivot_table', 'Cross-tabulation', 'Pandas'],
    },
    {
      topic: 'Pandas – apply vs vectorization',
      prompt: 'Why is using vectorized Pandas/NumPy operations preferred over `df.apply(lambda ...)`?',
      options: [
        'apply() uses more readable code so it should always be preferred',
        'Vectorized operations (e.g. df["col"] * 2, np.sqrt(df["col"])) execute in optimised C code beneath NumPy, processing entire arrays at once; apply() calls a Python function row-by-row, incurring Python interpreter overhead and being 10–100x slower on large data',
        'apply() is faster because it runs in parallel threads',
        'Vectorized operations only work for numeric columns',
      ],
      correct: 1,
      explanation:
        'NumPy and Pandas vectorized operations bypass Python interpreter overhead by operating on entire arrays in compiled C/Fortran code. `apply(lambda)` iterates in Python space, which is orders of magnitude slower for large DataFrames. Use `apply` for complex multi-column logic with no vectorized alternative, or use `swifter` / `pandarallel` for parallel apply.',
      hint: 'Vectorized = C speed on arrays; apply = Python loop overhead.',
      difficulty: 'intermediate',
      tags: ['Vectorization', 'apply', 'Performance'],
    },
    {
      topic: 'NumPy – Broadcasting',
      prompt: 'What is NumPy broadcasting, and what does `arr + 10` do to a (3, 4) array?',
      options: [
        'Broadcasting is invalid; arrays must have the same shape for arithmetic',
        'Broadcasting is a rule that allows NumPy to perform element-wise operations on arrays of different shapes by "stretching" the smaller array; arr + 10 adds 10 to every single element of the (3,4) array without creating a copy of the scalar',
        'Broadcasting converts the array to a list before adding',
        '`arr + 10` works only if arr is one-dimensional',
      ],
      correct: 1,
      explanation:
        'NumPy broadcasting stretches smaller dimensions to match larger ones. The scalar `10` is treated as a (1,) array that broadcasts to (3, 4). More complex: adding a (3, 1) array to a (3, 4) array broadcasts along axis 1. Broadcasting avoids expensive memory copies and is fundamental to vectorised computation.',
      hint: 'Broadcasting = operate on differently-shaped arrays without copying data.',
      difficulty: 'intermediate',
      tags: ['NumPy', 'Broadcasting', 'Vectorization'],
    },
    {
      topic: 'NumPy – Array vs List performance',
      prompt: 'Why are NumPy arrays more memory-efficient and faster than Python lists for numerical data?',
      options: [
        'NumPy arrays compress data with built-in zip compression',
        'NumPy arrays store homogeneous data in contiguous memory blocks with a fixed C dtype, enabling SIMD CPU vectorisation and cache efficiency; Python lists store references to heterogeneous Python objects, each with overhead',
        'NumPy arrays are stored on the GPU automatically',
        'Python lists are always faster for small data',
      ],
      correct: 1,
      explanation:
        'A Python list of 1000 integers allocates 1000+ Python objects (each 28 bytes) scattered in heap memory. A NumPy int64 array of 1000 elements uses a contiguous 8KB block. Contiguous memory enables CPU cache efficiency, SIMD vectorisation, and operations in optimised C/Fortran. This can give 100x+ speedups for numerical operations.',
      hint: 'Contiguous memory + fixed dtype = cache-friendly + SIMD vectorisation.',
      difficulty: 'intermediate',
      tags: ['NumPy', 'Performance', 'Memory'],
    },
    {
      topic: 'Pandas – String Operations',
      prompt: 'How do you convert all values in a string column to uppercase efficiently in Pandas?',
      options: [
        'df["name"].apply(str.upper)',
        'df["name"].str.upper()',
        'df["name"].map(str.upper)',
        'All three are equivalent; str accessor is marginally faster',
      ],
      correct: 3,
      explanation:
        'All three work. `str.upper()` uses the vectorised `.str` accessor, which is the idiomatic Pandas way and handles NaN values gracefully. `.apply(str.upper)` and `.map(str.upper)` are row-wise Python iteration. The `.str` accessor is preferable because it propagates NaN and enables chaining: `df["name"].str.strip().str.lower()`.',
      hint: 'The .str accessor is the Pandas idiomatic way for string operations.',
      difficulty: 'intermediate',
      tags: ['Pandas', 'String Operations', 'str accessor'],
    },
    {
      topic: 'Pandas – Time Series',
      prompt: 'What does `df.resample("M").mean()` do on a time-indexed DataFrame?',
      options: [
        'It multiplies all values by M (months)',
        'It resamples the time-indexed data to monthly frequency, computing the mean of all values within each calendar month',
        'It sorts data by the month column',
        'resample only works for numerical data',
      ],
      correct: 1,
      explanation:
        '`resample()` is a time-based groupby for DatetimeIndex-indexed DataFrames. `"M"` = month-end frequency. Common offsets: "D" (day), "W" (week), "Q" (quarter), "Y" (year). After `resample()`, apply aggregation: `.mean()`, `.sum()`, `.first()`, `.ohlc()`. Useful for converting daily data to monthly summaries.',
      hint: 'resample = time-based groupby; "M" = monthly aggregation.',
      difficulty: 'intermediate',
      tags: ['Time Series', 'resample', 'DatetimeIndex'],
    },
    {
      topic: 'Pandas – concat vs merge',
      prompt: 'When should you use `pd.concat()` instead of `pd.merge()`?',
      options: [
        'concat is for joining on columns; merge is for stacking rows',
        'concat stacks DataFrames vertically (row concatenation, axis=0) or horizontally (column concatenation, axis=1) without key-based matching; merge performs relational JOIN operations matching rows based on key column values',
        'They produce identical results for DataFrames with the same index',
        'concat only supports two DataFrames; merge supports multiple',
      ],
      correct: 1,
      explanation:
        '`pd.concat([df1, df2], axis=0)` stacks DataFrames end-to-end (append rows). `pd.concat([df1, df2], axis=1)` places them side-by-side (add columns). No key matching occurs — alignment is by index. `pd.merge()` performs SQL-like JOIN matching rows on specified keys. Use concat for combining same-schema data; merge for relational joins.',
      hint: 'concat = stack; merge = key-based relational join.',
      difficulty: 'intermediate',
      tags: ['concat', 'merge', 'Pandas'],
    },
    {
      topic: 'Pandas – value_counts',
      prompt: 'What does `df["status"].value_counts(normalize=True)` return?',
      options: [
        'The sum of all status values',
        'The count of each unique status value, with normalize=True converting counts to relative frequencies (proportions that sum to 1.0)',
        'The unique status values in sorted order',
        'A boolean mask of where status is not null',
      ],
      correct: 1,
      explanation:
        '`value_counts()` counts the frequency of each unique value in a Series. By default, sorted descending. `normalize=True` converts to relative frequencies (proportions). Useful for quick categorical analysis: `df["grade"].value_counts()` shows how many A, B, C grades exist; normalize=True shows proportions.',
      hint: 'normalize=True divides each count by total to get proportions.',
      difficulty: 'beginner',
      tags: ['value_counts', 'Categorical', 'EDA'],
    },
    {
      topic: 'Exploratory Data Analysis – describe()',
      prompt: 'What statistical summary does `df.describe()` provide for numerical columns?',
      options: [
        'Mean and median only',
        'count, mean, std, min, 25th percentile (Q1), 50th percentile (median), 75th percentile (Q3), max — key statistics for quickly understanding distribution and detecting outliers',
        'Only unique value counts and missing value percentages',
        'Correlation matrix between all numerical columns',
      ],
      correct: 1,
      explanation:
        '`describe()` computes the 8-number summary for numerical columns. By passing `percentiles=[0.10, 0.25, 0.75, 0.90]` you can customise the percentile cutpoints. For categorical columns, `describe(include="object")` gives: count, unique, top (most frequent), freq.',
      hint: 'count, mean, std, min, Q1, median, Q3, max = the 8-number summary.',
      difficulty: 'beginner',
      tags: ['EDA', 'describe()', 'Statistics'],
    },
    {
      topic: 'Pandas – duplicated and drop_duplicates',
      prompt: 'How do you keep only the first occurrence of duplicate rows in a DataFrame?',
      options: [
        'df.remove_duplicates()',
        'df.drop_duplicates(keep="first")',
        'df.unique()',
        'df.distinct()',
      ],
      correct: 1,
      explanation:
        '`drop_duplicates(keep="first")` (default) removes all but the first occurrence of duplicate rows. `keep="last"` keeps the last. `keep=False` drops all duplicates including originals. Specify `subset=["col1", "col2"]` to check duplicates only across certain columns. `duplicated()` returns a boolean mask without removing rows.',
      hint: 'drop_duplicates = remove duplicate rows; keep controls which to retain.',
      difficulty: 'beginner',
      tags: ['Duplicates', 'Data Cleaning', 'Pandas'],
    },
    {
      topic: 'Pandas – melt (wide to long)',
      prompt: 'What transformation does `pd.melt()` perform on a DataFrame?',
      options: [
        'Converts a long-format DataFrame to wide format',
        'Unpivots a wide-format DataFrame (multiple columns) to long format (single value column + identifier variable column), making it suitable for analysis and visualisation tools that prefer tidy data',
        'Aggregates multiple columns into one using mean',
        'melt() only works for date columns',
      ],
      correct: 1,
      explanation:
        '`pd.melt(df, id_vars=["name"], value_vars=["Q1", "Q2", "Q3"])` converts Q1, Q2, Q3 columns into rows, with a "variable" column (quarter name) and "value" column (the sales number). Long format is the "tidy data" format expected by seaborn, matplotlib, and statistical libraries.',
      hint: 'melt = wide to long; pivot = long to wide.',
      difficulty: 'intermediate',
      tags: ['melt', 'Tidy Data', 'Reshaping'],
    },
    {
      topic: 'Pandas – chaining and method fluency',
      prompt: 'What benefit does Pandas method chaining provide?',
      codeSnippet: `result = (df
    .query("department == 'Engineering'")
    .assign(salary_k=lambda x: x['salary'] / 1000)
    .groupby('level')['salary_k']
    .mean()
    .round(2))`,
      codeLanguage: 'python',
      options: [
        'Chaining is slower than storing intermediate DataFrames in variables',
        'Chaining produces a readable, step-by-step transformation pipeline without storing intermediate variables, making code easier to follow as a sequence of transformation steps',
        'Chaining only works for groupby operations',
        'Chaining requires explicit copy() calls between steps to avoid SettingWithCopyWarning',
      ],
      correct: 1,
      explanation:
        'Method chaining in Pandas creates a declarative transformation pipeline. Each method returns the DataFrame for the next call. Benefits: no intermediate variable names needed, transformations read top-to-bottom like a recipe, and immutability prevents unintended mutation. `.pipe()` can inject custom functions into chains.',
      hint: 'Chaining = readable, step-by-step transformation pipeline.',
      difficulty: 'intermediate',
      tags: ['Method Chaining', 'Pandas', 'Code Quality'],
    },
  ],
  { featured: true, aliases: ['python data analysis', 'pandas', 'numpy', 'python pandas', 'data analysis python'] }
)
