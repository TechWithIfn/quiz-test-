import { buildExpandedTest } from '../testBuilder'

const programmingCat = {
  id: 'cat-programming',
  name: 'Programming',
  slug: 'programming',
  description: 'Core programming languages, data structures, and computer science concepts.',
  color: '#3b82f6',
  icon: 'Terminal',
}

export const javaFundamentalsTest = buildExpandedTest(
  'java-fundamentals',
  'java-test',
  'Java Fundamentals Test',
  'Core Java concepts: OOP, collections, exceptions, generics, concurrency, and JVM internals for beginners through intermediate developers.',
  'Assess your Java programming depth across object-oriented principles, the Collections Framework, checked vs unchecked exceptions, generic type erasure, thread synchronization, and core JVM mechanics.',
  programmingCat,
  'java',
  'intermediate',
  35,
  [
    {
      topic: 'OOP – Encapsulation',
      prompt: 'What is encapsulation in Java, and how is it primarily achieved?',
      options: [
        'Binding methods and data together in a class, enforced by declaring fields private and exposing public getters/setters',
        'Storing multiple objects in a single array',
        'Running multiple threads simultaneously inside a class',
        'Compiling Java code into native machine code',
      ],
      correct: 0,
      explanation:
        'Encapsulation bundles state (fields) and behaviour (methods) inside a class and restricts direct field access from outside. The standard idiom is to mark fields `private` and provide controlled `public` getter/setter methods.',
      hint: 'Think about access modifiers and class boundaries.',
      difficulty: 'beginner',
      tags: ['OOP', 'Encapsulation', 'Access Modifiers'],
    },
    {
      topic: 'OOP – Inheritance vs Composition',
      prompt: 'Why is composition generally preferred over inheritance in large Java codebases?',
      options: [
        'Composition creates stronger coupling than inheritance',
        'Java does not support inheritance',
        'Composition allows behaviour reuse without tight coupling to a parent class hierarchy, making classes easier to change and test independently',
        'Inheritance is always faster at runtime',
      ],
      correct: 2,
      explanation:
        '"Favour composition over inheritance" (GoF) because subclassing tightly couples the child to the parent\'s implementation. Changing the parent class can break all subclasses (fragile base class problem). Composition allows flexible behaviour assembly through interfaces.',
      hint: 'Consider what happens when you need to change the parent class.',
      difficulty: 'intermediate',
      tags: ['OOP', 'Design Principles', 'Composition'],
    },
    {
      topic: 'Polymorphism – Method Overloading vs Overriding',
      prompt: 'At what time is the method to invoke resolved for overloaded methods versus overridden methods in Java?',
      options: [
        'Both are resolved at compile time',
        'Overloading is resolved at compile time (static dispatch); overriding is resolved at runtime (dynamic dispatch)',
        'Both are resolved at runtime via the JVM',
        'Overriding is resolved at compile time; overloading at runtime',
      ],
      correct: 1,
      explanation:
        'Method overloading (same name, different parameter list) is statically resolved at compile time based on the declared type. Method overriding (same name+signature in a subclass) uses dynamic dispatch – the JVM selects the most specific runtime type\'s method.',
      hint: 'Think about static vs dynamic binding.',
      difficulty: 'intermediate',
      tags: ['Polymorphism', 'Method Resolution', 'OOP'],
    },
    {
      topic: 'Abstract Class vs Interface',
      prompt: 'When should you use an abstract class instead of an interface in Java 8+?',
      options: [
        'Abstract classes should always be used instead of interfaces',
        'When you need to define common state (instance fields), constructors, or share substantial concrete method implementations among closely related subclasses',
        'When you need multiple inheritance of type',
        'When you want to prevent subclassing entirely',
      ],
      correct: 1,
      explanation:
        'Abstract classes can hold instance fields, constructors, and concrete methods – ideal for sharing implementation among siblings in a class hierarchy. Interfaces define contracts (type), support multiple inheritance of type, and since Java 8 can have default/static methods but still cannot hold instance state.',
      hint: 'Consider whether related classes need to share state or just a contract.',
      difficulty: 'intermediate',
      tags: ['Abstract Class', 'Interface', 'Design'],
    },
    {
      topic: 'String Immutability',
      prompt: 'Why are Java String objects immutable, and what does `s.concat("!")` return?',
      options: [
        'Strings are mutable; concat modifies s in place and returns void',
        'Strings are immutable; concat returns a new String object containing the concatenated value; the original s is unchanged',
        'Strings are immutable; concat throws UnsupportedOperationException',
        'Strings are immutable; concat modifies an internal buffer shared across instances',
      ],
      correct: 1,
      explanation:
        'Java String is immutable: once created, its character array cannot change. Every String method that appears to modify the string actually returns a new String object. This enables safe sharing, caching (String pool), and thread-safety.',
      hint: 'All String methods that appear to alter content actually return a new String.',
      difficulty: 'beginner',
      tags: ['String', 'Immutability', 'Memory'],
    },
    {
      topic: 'Collections – List vs Set',
      prompt: 'What are the key behavioural differences between `ArrayList` and `HashSet` in Java?',
      options: [
        'ArrayList maintains insertion order and allows duplicates; HashSet does not maintain order and does not allow duplicate elements',
        'ArrayList is thread-safe; HashSet is not',
        'HashSet is backed by an array; ArrayList by a hash table',
        'Both maintain insertion order',
      ],
      correct: 0,
      explanation:
        '`ArrayList` implements `List`: ordered, indexed, allows duplicates. `HashSet` implements `Set`: backed by a `HashMap`, no guaranteed order, rejects duplicate elements (based on `hashCode()` + `equals()`).',
      hint: 'Think about order guarantee and uniqueness requirements.',
      difficulty: 'beginner',
      tags: ['Collections', 'List', 'Set'],
    },
    {
      topic: 'Collections – HashMap internals',
      prompt: 'What happens in Java\'s `HashMap` when two keys produce the same `hashCode()` value?',
      options: [
        'A `HashCollisionException` is thrown immediately',
        'The second key silently overwrites the first regardless of `equals()`',
        'A collision occurs; entries are stored in the same bucket as a linked list (or balanced tree in Java 8+ when the chain exceeds 8 entries)',
        'The `HashMap` automatically resizes to prevent any collision',
      ],
      correct: 2,
      explanation:
        'A `HashMap` uses `hashCode()` to find a bucket. Collisions (same bucket, different keys) are handled by chaining: entries in the same bucket form a linked list. Since Java 8, long chains (≥ 8 entries) are converted to a red-black tree for O(log n) lookup.',
      hint: 'HashMap uses separate chaining to resolve hash collisions.',
      difficulty: 'intermediate',
      tags: ['HashMap', 'Collections', 'Hashing'],
    },
    {
      topic: 'Checked vs Unchecked Exceptions',
      prompt: 'What is the difference between a checked exception and an unchecked exception in Java?',
      options: [
        'Checked exceptions extend `RuntimeException`; unchecked exceptions extend `Exception`',
        'Checked exceptions must be declared in the `throws` clause or handled; unchecked exceptions (extending `RuntimeException`) do not require this',
        'There is no practical difference; the compiler treats all exceptions equally',
        'Unchecked exceptions always crash the JVM',
      ],
      correct: 1,
      explanation:
        'Checked exceptions (e.g. `IOException`, `SQLException`) extend `Exception` and the compiler enforces that they are either caught or declared with `throws`. Unchecked exceptions extend `RuntimeException` (e.g. `NullPointerException`, `IllegalArgumentException`) and represent programming errors that need not be explicitly declared.',
      hint: 'Consider what the Java compiler forces you to handle at compile time.',
      difficulty: 'beginner',
      tags: ['Exceptions', 'Checked', 'RuntimeException'],
    },
    {
      topic: 'try-with-resources',
      prompt: 'What requirement must a class satisfy to be used in a Java try-with-resources statement?',
      codeSnippet: `try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
    String line = br.readLine();
}`,
      codeLanguage: 'java',
      options: [
        'It must extend `AbstractResource`',
        'It must implement the `AutoCloseable` interface (or `Closeable`)',
        'It must be declared as `static final`',
        'It must override `Object.finalize()`',
      ],
      correct: 1,
      explanation:
        'Try-with-resources (Java 7+) automatically calls `close()` on resources when the block exits. For this to work, the resource class must implement `AutoCloseable` (or its subinterface `Closeable`). The `close()` method is guaranteed to be called even if an exception is thrown.',
      hint: 'Look for the interface that guarantees `close()` is called automatically.',
      difficulty: 'intermediate',
      tags: ['Exceptions', 'AutoCloseable', 'Resources'],
    },
    {
      topic: 'Generics – Type Erasure',
      prompt: 'What is Java generics "type erasure", and what practical implication does it have?',
      options: [
        'Generics are fully preserved at runtime; `List<String>` and `List<Integer>` are distinct types at runtime',
        'Java erases generic type parameters at compile time, so at runtime `List<String>` and `List<Integer>` both become `List` (raw type); you cannot call `instanceof List<String>`',
        'Type erasure deletes the class file entirely',
        'Type erasure only affects primitive types',
      ],
      correct: 1,
      explanation:
        'Java generics use type erasure for backward compatibility: the compiler inserts casts and removes generic type information, so at runtime all generic types become their raw type or bound. This means you cannot use generic types in `instanceof` checks or create arrays of generic types.',
      hint: 'Consider whether JVM bytecode retains generic type parameters.',
      difficulty: 'advanced',
      tags: ['Generics', 'Type Erasure', 'JVM'],
    },
    {
      topic: 'Static vs Instance Members',
      prompt: 'Can a static method in Java access instance (non-static) fields of its class directly?',
      options: [
        'Yes, static methods have full access to instance fields',
        'No, static methods belong to the class and have no implicit `this` reference; accessing instance fields requires an explicit object reference',
        'Yes, but only if the field is `public`',
        'Yes, but only for fields declared in the same method',
      ],
      correct: 1,
      explanation:
        'Static methods are associated with the class, not any particular instance. They have no `this` reference, so they cannot directly access instance fields or instance methods. To access non-static members from a static context, you must have an explicit object reference.',
      hint: 'Think about whether a static method knows which object instance to refer to.',
      difficulty: 'beginner',
      tags: ['Static', 'Instance', 'OOP'],
    },
    {
      topic: 'final keyword',
      prompt: 'What are the three distinct uses of the `final` keyword in Java?',
      options: [
        'final class (cannot be subclassed), final method (cannot be overridden), final variable (cannot be reassigned)',
        'final is only used to prevent variable reassignment',
        'final class (executes last), final method (executes after super), final variable (computes lazily)',
        'final is equivalent to `const` in JavaScript',
      ],
      correct: 0,
      explanation:
        '`final` has three uses: (1) `final class` prevents subclassing (e.g. `String`, `Integer`); (2) `final method` prevents overriding in subclasses; (3) `final variable` can be assigned only once (compile-time constant if primitive/String literal).',
      hint: 'Think about what final prevents in each context: inheritance, overriding, reassignment.',
      difficulty: 'beginner',
      tags: ['final', 'Immutability', 'OOP'],
    },
    {
      topic: 'Concurrency – synchronized',
      prompt: 'What does declaring a Java method `synchronized` guarantee?',
      options: [
        'The method executes asynchronously in a background thread',
        'Only one thread at a time can execute the method on the same object instance; other threads block until the lock is released',
        'All threads execute the method simultaneously but in order',
        'The method is compiled to native code for better performance',
      ],
      correct: 1,
      explanation:
        'A `synchronized` method acquires the intrinsic lock (monitor) of the object (`this`) before executing. Only one thread can hold this lock at a time; other threads attempting to call any synchronized method on the same object will block until the lock is released.',
      hint: 'Synchronized implies mutual exclusion using an object-level monitor lock.',
      difficulty: 'intermediate',
      tags: ['Concurrency', 'synchronized', 'Thread Safety'],
    },
    {
      topic: 'Concurrency – volatile',
      prompt: 'What guarantee does the `volatile` keyword provide in Java?',
      options: [
        'It makes the variable thread-safe for compound operations like `count++`',
        'It guarantees that writes to the variable are immediately visible to all threads by reading/writing directly to main memory, not CPU caches',
        'It prevents the variable from being garbage collected',
        'It is equivalent to `synchronized`',
      ],
      correct: 1,
      explanation:
        '`volatile` ensures memory visibility: reads and writes bypass CPU caches and go directly to main memory, so all threads see the most recent value. However, it does not make compound operations (like `i++`) atomic; use `AtomicInteger` or `synchronized` for atomicity.',
      hint: 'volatile solves visibility, but not atomicity of compound operations.',
      difficulty: 'intermediate',
      tags: ['volatile', 'Concurrency', 'Memory Model'],
    },
    {
      topic: 'equals() and hashCode() Contract',
      prompt: 'What is the required contract between `equals()` and `hashCode()` in Java?',
      options: [
        'If `a.equals(b)` is true, then `a.hashCode()` must equal `b.hashCode()`; the converse is not required',
        'If `a.hashCode() == b.hashCode()`, then `a.equals(b)` must be true',
        'equals() and hashCode() are completely independent',
        'hashCode() must return the object\'s memory address',
      ],
      correct: 0,
      explanation:
        'The Java contract: objects that are equal (`a.equals(b) == true`) must have the same `hashCode()`. The reverse is not required (hash collisions are allowed). Violating this contract breaks collection classes like `HashMap` and `HashSet` that use hashCode to locate buckets then equals to confirm identity.',
      hint: 'Equal objects must have equal hash codes, but not vice versa.',
      difficulty: 'intermediate',
      tags: ['equals', 'hashCode', 'Collections'],
    },
    {
      topic: 'Java Memory Model – Stack vs Heap',
      prompt: 'In the Java Memory Model, where are local primitive variables stored versus object instances?',
      options: [
        'Both local variables and objects are stored in the heap',
        'Local primitive variables are stored in the thread stack; object instances are allocated in the heap',
        'Primitive variables are stored in the CPU registers; objects in the stack',
        'There is no stack in Java; all data goes to the heap',
      ],
      correct: 1,
      explanation:
        'Each thread has its own stack holding stack frames: local primitive variables and references. Object instances (regardless of where the reference lives) are always allocated on the heap, which is shared across threads. Escape analysis can sometimes optimise short-lived objects to the stack.',
      hint: 'Think about which memory region is thread-local vs shared.',
      difficulty: 'intermediate',
      tags: ['JVM', 'Memory Model', 'Stack', 'Heap'],
    },
    {
      topic: 'Garbage Collection',
      prompt: 'What is the primary criterion for an object to become eligible for garbage collection in Java?',
      options: [
        'The object\'s field count exceeds 10',
        'The object has been in the heap for more than 60 seconds',
        'No live references (reachable from GC roots like stack frames, static fields, or JNI) point to the object',
        'The programmer explicitly calls `delete obj`',
      ],
      correct: 2,
      explanation:
        'The JVM\'s garbage collector uses reachability analysis: an object is live if it is reachable from a GC root (active thread stack frames, static fields, JNI references). Objects with no path to any GC root become unreachable and are eligible for collection.',
      hint: 'Garbage collection is about reachability, not manual deallocation.',
      difficulty: 'intermediate',
      tags: ['GC', 'JVM', 'Memory Management'],
    },
    {
      topic: 'Lambda Expressions – Functional Interfaces',
      prompt: 'What is a functional interface in Java, and why is the `@FunctionalInterface` annotation used?',
      options: [
        'An interface with exactly one abstract method; the annotation is a compiler check that enforces this constraint',
        'An interface that can only be implemented by lambda expressions at compile time',
        'An interface that contains only default methods',
        'An interface stored in a special memory pool',
      ],
      correct: 0,
      explanation:
        'A functional interface has exactly one abstract method (SAM – Single Abstract Method). Lambdas and method references can be used wherever a functional interface is expected. `@FunctionalInterface` is optional but causes a compile error if the interface has more than one abstract method, serving as documentation and a safety check.',
      hint: 'Think about what SAM stands for and the minimum contract for lambdas.',
      difficulty: 'intermediate',
      tags: ['Lambda', 'Functional Interface', 'Java 8'],
    },
    {
      topic: 'Stream API – Lazy Evaluation',
      prompt: 'Are intermediate stream operations in Java (e.g. `filter()`, `map()`) executed eagerly or lazily?',
      options: [
        'Eagerly – each intermediate operation processes all elements immediately',
        'Lazily – intermediate operations are not executed until a terminal operation (e.g. `collect()`, `forEach()`, `count()`) is called',
        'Lazily, but only when the stream has more than 100 elements',
        'Eagerly for filter; lazily for map',
      ],
      correct: 1,
      explanation:
        'Java Streams use lazy evaluation: intermediate operations (filter, map, flatMap, sorted, etc.) build a pipeline of operations but do not process elements immediately. Execution is triggered only by a terminal operation, allowing the runtime to optimise processing (e.g., short-circuiting with `findFirst()`).',
      hint: 'Without a terminal operation, a stream does nothing.',
      difficulty: 'intermediate',
      tags: ['Stream API', 'Lazy Evaluation', 'Java 8'],
    },
    {
      topic: 'Optional – Null Safety',
      prompt: 'What is the primary purpose of `Optional<T>` introduced in Java 8?',
      options: [
        'It is a collection class that holds up to one element',
        'To explicitly model the possible absence of a value and eliminate ambiguous null return values, encouraging safer null handling',
        'To improve performance by caching expensive computations',
        'To allow methods to return multiple types',
      ],
      correct: 1,
      explanation:
        '`Optional<T>` wraps a value that may or may not be present. Rather than returning null (which can cause `NullPointerException` if unchecked), returning `Optional` makes the possibility of absence explicit at the API level, encouraging callers to handle the empty case via `isPresent()`, `orElse()`, `orElseThrow()`, etc.',
      hint: 'Think about how Optional makes null handling more intentional.',
      difficulty: 'intermediate',
      tags: ['Optional', 'Null Safety', 'Java 8'],
    },
    {
      topic: 'Collections – Iterator vs For-Each',
      prompt: 'When should you use an explicit `Iterator` instead of an enhanced for-each loop over a collection?',
      options: [
        'Always – explicit Iterator is more readable',
        'When you need to remove elements from the collection while iterating (using `iterator.remove()` to avoid `ConcurrentModificationException`)',
        'When the collection has more than 1000 elements',
        'Never – for-each loops can remove elements safely',
      ],
      correct: 1,
      explanation:
        'Removing elements from a collection inside a for-each loop throws `ConcurrentModificationException`. To safely remove elements during iteration, use an explicit `Iterator` and call `iterator.remove()` which removes the last element returned without modifying the collection externally.',
      hint: 'Think about what happens when you call collection.remove() inside a for-each loop.',
      difficulty: 'intermediate',
      tags: ['Iterator', 'Collections', 'ConcurrentModificationException'],
    },
    {
      topic: 'Interface Default Methods',
      prompt: 'What problem do default methods in Java 8 interfaces solve?',
      options: [
        'They allow interfaces to hold instance state',
        'They provide a way to add new methods to existing interfaces without breaking all implementing classes (backward compatibility)',
        'They replace abstract classes entirely',
        'They make interface methods optional to implement',
      ],
      correct: 1,
      explanation:
        'Before Java 8, adding a new method to an interface broke all existing implementations. Default methods provide a concrete implementation inside the interface, so existing classes that don\'t override the method inherit the default behaviour, maintaining backward compatibility.',
      hint: 'Think about adding methods to the Java Collections API after millions of classes implemented it.',
      difficulty: 'intermediate',
      tags: ['Interface', 'Default Methods', 'Java 8'],
    },
    {
      topic: 'String Pool',
      prompt: 'What is the Java String pool and when does `str.intern()` become useful?',
      options: [
        'The String pool is a thread-local cache; intern() is used for security',
        'The String pool is a special heap region caching String literals; `intern()` looks up or adds a string to the pool, allowing reference equality (`==`) to be used for pool-cached strings',
        'The String pool stores encrypted strings for security',
        'The String pool holds only strings shorter than 20 characters',
      ],
      correct: 1,
      explanation:
        'Java maintains a String constant pool (in the heap since Java 7) for String literals. Two literal strings with the same content share the same object reference. `intern()` can be used to explicitly add dynamically created strings to the pool, allowing `==` comparison (though `equals()` is always preferred for correctness).',
      hint: 'String literals in code are automatically pooled; new String(...) is not.',
      difficulty: 'intermediate',
      tags: ['String Pool', 'Interning', 'Memory'],
    },
    {
      topic: 'Enum in Java',
      prompt: 'What capability makes Java `enum` types more powerful than simple integer constants?',
      options: [
        'Enums are compiled to faster bytecode than constants',
        'Enum values can have fields, constructors, and methods, making them full-featured classes with identity guarantees and type safety',
        'Enums are automatically serialized to JSON',
        'Enums support negative values unlike int constants',
      ],
      correct: 1,
      explanation:
        'Java enums are full classes that implicitly extend `java.lang.Enum`. Each enum constant is a singleton instance of that enum class. Enums can have fields, constructors, and even abstract methods overridden per-constant, making them far richer than simple integer constants.',
      hint: 'Java enum values are objects, not just named numbers.',
      difficulty: 'intermediate',
      tags: ['Enum', 'Type Safety', 'OOP'],
    },
    {
      topic: 'Autoboxing & Unboxing',
      prompt: 'What hidden pitfall exists when comparing two `Integer` objects using `==` in Java?',
      codeSnippet: `Integer a = 127;
Integer b = 127;
Integer c = 128;
Integer d = 128;
System.out.println(a == b); // ?
System.out.println(c == d); // ?`,
      codeLanguage: 'java',
      options: [
        'Both print true',
        'Both print false',
        'First prints true (cache range), second prints false (outside cache)',
        'First prints false, second prints true',
      ],
      correct: 2,
      explanation:
        'Java caches `Integer` objects in the range -128 to 127. `Integer` autoboxing returns the same cached instance for values in this range, making `==` return `true`. Values outside the cache (like 128) create new heap objects, so `==` compares references (false). Always use `.equals()` for Integer comparison.',
      hint: 'Java caches Integer objects between -128 and 127 by default.',
      difficulty: 'intermediate',
      tags: ['Autoboxing', 'Integer Cache', 'Wrapper Types'],
    },
    {
      topic: 'try-catch-finally execution order',
      prompt: 'What is printed by this try-catch-finally block?',
      codeSnippet: `public static void test() {
    try {
        System.out.print("try ");
        if (true) throw new RuntimeException();
    } catch (RuntimeException e) {
        System.out.print("catch ");
        return;
    } finally {
        System.out.print("finally");
    }
}`,
      codeLanguage: 'java',
      options: [
        '"try catch"',
        '"try catch finally"',
        '"try finally"',
        '"catch finally"',
      ],
      correct: 1,
      explanation:
        'The `finally` block always executes before a method returns (or throws), even when `return` is inside a `catch` block. Execution: try → exception → catch (prints "catch", prepares to return) → finally (prints "finally") → actual return.',
      hint: 'finally executes even when return is inside catch.',
      difficulty: 'intermediate',
      tags: ['Exceptions', 'finally', 'Control Flow'],
    },
    {
      topic: 'Comparable vs Comparator',
      prompt: 'What is the difference between implementing `Comparable<T>` and using `Comparator<T>` to sort objects?',
      options: [
        '`Comparable` defines the natural ordering within the class itself; `Comparator` defines an external, potentially multiple alternative orderings',
        '`Comparable` is for primitive types; `Comparator` is for objects',
        '`Comparator` sorts ascending; `Comparable` sorts descending',
        'They are identical; one is just an older API',
      ],
      correct: 0,
      explanation:
        '`Comparable<T>` (method `compareTo()`) is implemented by the class itself to define its natural ordering (e.g. String alphabetical, Integer numerical). `Comparator<T>` is a separate strategy object for defining custom or alternative orderings without modifying the class, useful when you need multiple sort orders or cannot modify the class.',
      hint: 'Comparable is intrinsic; Comparator is external strategy.',
      difficulty: 'intermediate',
      tags: ['Comparable', 'Comparator', 'Sorting'],
    },
    {
      topic: 'Java – Pass by Value',
      prompt: 'Is Java "pass by reference" or "pass by value" when passing objects to methods?',
      options: [
        'Pass by reference – the method receives the actual object',
        'Pass by value – the method receives a copy of the object reference (not the object itself); the reference copy points to the same heap object',
        'Pass by reference for primitives, pass by value for objects',
        'Pass by value for primitives, pass by reference for objects',
      ],
      correct: 1,
      explanation:
        'Java is always pass-by-value. For objects, the value passed is a copy of the reference (pointer). This means the method can mutate the object\'s fields via the reference, but reassigning the reference inside the method does not affect the caller\'s reference.',
      hint: 'Think about what happens when you assign `param = new Obj()` inside a method.',
      difficulty: 'intermediate',
      tags: ['Pass by Value', 'References', 'Memory'],
    },
    {
      topic: 'Collections – LinkedList vs ArrayList performance',
      prompt: 'Which data structure should you prefer for frequent random-access reads versus frequent middle insertions?',
      options: [
        'LinkedList for both',
        'ArrayList for random access (O(1) by index); LinkedList for frequent insertions in the middle (O(1) once position is found)',
        'ArrayList for both',
        'LinkedList for random access; ArrayList for insertions',
      ],
      correct: 1,
      explanation:
        '`ArrayList` backed by an array offers O(1) random access by index, but O(n) insertion in the middle (shifts elements). `LinkedList` backed by a doubly-linked list requires O(n) to find the position but O(1) actual insertion/deletion once the node is located. In practice, ArrayList usually outperforms LinkedList even for insertions due to cache locality.',
      hint: 'Consider memory layout and cache locality, not just asymptotic complexity.',
      difficulty: 'intermediate',
      tags: ['ArrayList', 'LinkedList', 'Performance'],
    },
    {
      topic: 'Java – Threads – Creating Threads',
      prompt: 'What are two ways to create a thread in Java, and which is generally preferred?',
      options: [
        'Extending Thread class or implementing Runnable/Callable; implementing Runnable is preferred as it separates task logic from thread management and allows future use with ExecutorService',
        'Extending Thread class or using reflection; reflection is preferred',
        'Both are identical in capability and usage',
        'Using Thread.new() or Process.spawn()',
      ],
      correct: 0,
      explanation:
        'You can create threads by: (1) extending `Thread` and overriding `run()`, or (2) implementing `Runnable` (or `Callable`) and passing it to a `Thread`. Implementing `Runnable` is preferred because it keeps task logic decoupled from threading infrastructure and allows the same task to be executed by thread pools or `ExecutorService`.',
      hint: 'Implementing Runnable gives more flexibility than extending Thread.',
      difficulty: 'beginner',
      tags: ['Threading', 'Runnable', 'Concurrency'],
    },
  ],
  { featured: true, aliases: ['java', 'java programming', 'java interview', 'core java'] }
)
