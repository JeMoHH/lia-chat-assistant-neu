export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

const SNIPPETS: CodeSnippet[] = [
  // JavaScript
  {
    id: "js-hello",
    title: "Hello World",
    description: "Classic Hello World program",
    language: "javascript",
    code: 'console.log("Hello, World!");',
    tags: ["beginner", "hello"],
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "js-arrow",
    title: "Arrow Function",
    description: "Modern arrow function syntax",
    language: "javascript",
    code: "const greet = (name) => `Hello, ${name}!`;\nconsole.log(greet('World'));",
    tags: ["functions", "modern"],
    category: "functions",
    difficulty: "beginner",
  },
  {
    id: "js-async",
    title: "Async/Await",
    description: "Async function with await",
    language: "javascript",
    code: "async function fetchData() {\n  try {\n    const response = await fetch('https://api.example.com/data');\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}",
    tags: ["async", "promises", "api"],
    category: "async",
    difficulty: "intermediate",
  },

  // Python
  {
    id: "py-hello",
    title: "Hello World",
    description: "Classic Hello World program",
    language: "python",
    code: 'print("Hello, World!")',
    tags: ["beginner", "hello"],
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "py-list",
    title: "List Operations",
    description: "Common list operations",
    language: "python",
    code: "numbers = [1, 2, 3, 4, 5]\nsquared = [x**2 for x in numbers]\nprint(squared)",
    tags: ["lists", "comprehension"],
    category: "data-structures",
    difficulty: "beginner",
  },
  {
    id: "py-class",
    title: "Class Definition",
    description: "Define and use a class",
    language: "python",
    code: "class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def greet(self):\n        return f'Hello, I am {self.name}'\n\nperson = Person('Alice', 30)\nprint(person.greet())",
    tags: ["oop", "class"],
    category: "oop",
    difficulty: "intermediate",
  },

  // Bash
  {
    id: "bash-hello",
    title: "Hello World",
    description: "Classic Hello World script",
    language: "bash",
    code: '#!/bin/bash\necho "Hello, World!"',
    tags: ["beginner", "hello"],
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "bash-loop",
    title: "For Loop",
    description: "Simple for loop",
    language: "bash",
    code: "#!/bin/bash\nfor i in {1..5}; do\n  echo \"Number: $i\"\ndone",
    tags: ["loops", "iteration"],
    category: "control-flow",
    difficulty: "beginner",
  },

  // Go
  {
    id: "go-hello",
    title: "Hello World",
    description: "Classic Hello World program",
    language: "go",
    code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    tags: ["beginner", "hello"],
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "go-goroutine",
    title: "Goroutine",
    description: "Concurrent execution with goroutines",
    language: "go",
    code: 'package main\n\nimport (\n    "fmt"\n    "time"\n)\n\nfunc main() {\n    go func() {\n        fmt.Println("Goroutine")\n    }()\n    time.Sleep(1 * time.Second)\n}',
    tags: ["concurrency", "goroutines"],
    category: "concurrency",
    difficulty: "advanced",
  },

  // Rust
  {
    id: "rust-hello",
    title: "Hello World",
    description: "Classic Hello World program",
    language: "rust",
    code: 'fn main() {\n    println!("Hello, World!");\n}',
    tags: ["beginner", "hello"],
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "rust-ownership",
    title: "Ownership",
    description: "Understanding Rust ownership",
    language: "rust",
    code: 'fn main() {\n    let s1 = String::from("hello");\n    let s2 = s1; // s1 is no longer valid\n    println!("{}", s2);\n}',
    tags: ["ownership", "memory"],
    category: "memory",
    difficulty: "intermediate",
  },

  // C++
  {
    id: "cpp-hello",
    title: "Hello World",
    description: "Classic Hello World program",
    language: "cpp",
    code: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    tags: ["beginner", "hello"],
    category: "basics",
    difficulty: "beginner",
  },

  // Java
  {
    id: "java-hello",
    title: "Hello World",
    description: "Classic Hello World program",
    language: "java",
    code: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    tags: ["beginner", "hello"],
    category: "basics",
    difficulty: "beginner",
  },

  // PHP
  {
    id: "php-hello",
    title: "Hello World",
    description: "Classic Hello World program",
    language: "php",
    code: '<?php\necho "Hello, World!";\n?>',
    tags: ["beginner", "hello"],
    category: "basics",
    difficulty: "beginner",
  },

  // Swift
  {
    id: "swift-hello",
    title: "Hello World",
    description: "Classic Hello World program",
    language: "swift",
    code: 'print("Hello, World!")',
    tags: ["beginner", "hello"],
    category: "basics",
    difficulty: "beginner",
  },

  // Kotlin
  {
    id: "kotlin-hello",
    title: "Hello World",
    description: "Classic Hello World program",
    language: "kotlin",
    code: 'fun main() {\n    println("Hello, World!")\n}',
    tags: ["beginner", "hello"],
    category: "basics",
    difficulty: "beginner",
  },

  // HTML
  {
    id: "html-basic",
    title: "Basic HTML",
    description: "Basic HTML structure",
    language: "html",
    code: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
    tags: ["beginner", "structure"],
    category: "markup",
    difficulty: "beginner",
  },

  // CSS
  {
    id: "css-style",
    title: "Basic Styling",
    description: "Basic CSS styling",
    language: "css",
    code: "body {\n    font-family: Arial, sans-serif;\n    background-color: #f0f0f0;\n    margin: 0;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}",
    tags: ["beginner", "styling"],
    category: "styling",
    difficulty: "beginner",
  },

  // SQL
  {
    id: "sql-select",
    title: "SELECT Query",
    description: "Basic SELECT query",
    language: "sql",
    code: "SELECT * FROM users WHERE age > 18 ORDER BY name;",
    tags: ["beginner", "database"],
    category: "database",
    difficulty: "beginner",
  },
];

export function getAllSnippets(): CodeSnippet[] {
  return SNIPPETS;
}

export function getSnippetsByLanguage(language: string): CodeSnippet[] {
  return SNIPPETS.filter((s) => s.language === language);
}

export function getSnippetsByCategory(category: string): CodeSnippet[] {
  return SNIPPETS.filter((s) => s.category === category);
}

export function getSnippetsByDifficulty(difficulty: string): CodeSnippet[] {
  return SNIPPETS.filter((s) => s.difficulty === difficulty);
}

export function searchSnippets(query: string): CodeSnippet[] {
  const lowerQuery = query.toLowerCase();
  return SNIPPETS.filter(
    (s) =>
      s.title.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  );
}

export function getSnippetById(id: string): CodeSnippet | undefined {
  return SNIPPETS.find((s) => s.id === id);
}

export function getCategories(): string[] {
  return [...new Set(SNIPPETS.map((s) => s.category))];
}

export function getDifficulties(): string[] {
  return [...new Set(SNIPPETS.map((s) => s.difficulty))];
}
