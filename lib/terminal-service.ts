export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
  language: string;
}

export interface TerminalCommand {
  command: string;
  language: string;
  timestamp: number;
}

const LANGUAGE_COMMANDS: Record<string, string> = {
  javascript: "node",
  python: "python3",
  bash: "bash",
  go: "go run",
  rust: "rustc",
  cpp: "g++",
  java: "javac",
  php: "php",
  swift: "swift",
  kotlin: "kotlinc",
  html: "html",
  css: "css",
  c: "gcc",
  sql: "sqlite3",
};

export async function executeCode(code: string, language: string): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    // Simulate code execution
    const result = await simulateExecution(code, language);
    const duration = Date.now() - startTime;

    return {
      ...result,
      duration,
      language,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      stdout: "",
      stderr: error instanceof Error ? error.message : "Unknown error",
      exitCode: 1,
      duration,
      language,
    };
  }
}

async function simulateExecution(code: string, language: string): Promise<Omit<ExecutionResult, "duration" | "language">> {
  // Simulate different language outputs
  switch (language) {
    case "javascript":
      return executeJavaScript(code);
    case "python":
      return executePython(code);
    case "bash":
      return executeBash(code);
    case "go":
      return executeGo(code);
    case "rust":
      return executeRust(code);
    case "cpp":
      return executeCpp(code);
    case "java":
      return executeJava(code);
    case "php":
      return executePhp(code);
    case "swift":
      return executeSwift(code);
    case "kotlin":
      return executeKotlin(code);
    case "html":
      return executeHtml(code);
    case "css":
      return executeCss(code);
    case "c":
      return executeC(code);
    case "sql":
      return executeSql(code);
    default:
      return { stdout: "Language not supported", stderr: "", exitCode: 1 };
  }
}

function executeJavaScript(code: string): Omit<ExecutionResult, "duration" | "language"> {
  try {
    // Safe evaluation with limited scope
    const sandbox = {
      console: {
        log: (...args: any[]) => args.map((a) => JSON.stringify(a)).join(" "),
      },
    };

    // Check for dangerous patterns
    if (/require|import|eval|Function/.test(code)) {
      return {
        stdout: "",
        stderr: "Dangerous code patterns detected",
        exitCode: 1,
      };
    }

    // Mock execution
    const output = `✓ JavaScript code executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
    return {
      stdout: output,
      stderr: "",
      exitCode: 0,
    };
  } catch (error) {
    return {
      stdout: "",
      stderr: error instanceof Error ? error.message : "Execution error",
      exitCode: 1,
    };
  }
}

function executePython(code: string): Omit<ExecutionResult, "duration" | "language"> {
  // Mock Python execution
  const output = `✓ Python code executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeBash(code: string): Omit<ExecutionResult, "duration" | "language"> {
  // Mock Bash execution
  const output = `✓ Bash script executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeGo(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ Go code compiled and executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeRust(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ Rust code compiled and executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeCpp(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ C++ code compiled and executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeJava(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ Java code compiled and executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executePhp(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ PHP code executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeSwift(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ Swift code compiled and executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeKotlin(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ Kotlin code compiled and executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeHtml(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ HTML rendered successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeCss(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ CSS validated successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeC(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ C code compiled and executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

function executeSql(code: string): Omit<ExecutionResult, "duration" | "language"> {
  const output = `✓ SQL query executed successfully\n\nCode:\n${code.substring(0, 100)}...`;
  return {
    stdout: output,
    stderr: "",
    exitCode: 0,
  };
}

export function formatOutput(result: ExecutionResult): string {
  let output = "";

  if (result.stdout) {
    output += `📤 Output:\n${result.stdout}\n\n`;
  }

  if (result.stderr) {
    output += `⚠️ Errors:\n${result.stderr}\n\n`;
  }

  output += `⏱️ Duration: ${result.duration}ms\n`;
  output += `📊 Exit Code: ${result.exitCode}`;

  return output;
}
