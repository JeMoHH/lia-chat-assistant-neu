export interface CodeIssue {
  line: number;
  column: number;
  severity: "error" | "warning" | "info";
  message: string;
  code: string;
  fix?: string;
}

export interface AnalysisResult {
  language: string;
  issues: CodeIssue[];
  metrics: {
    lines: number;
    complexity: number;
    maintainability: number;
  };
}

const COMMON_ISSUES: Record<string, CodeIssue[]> = {
  javascript: [
    { line: 0, column: 0, severity: "warning", message: "Missing semicolon", code: "MISSING_SEMICOLON", fix: "Add ;" },
    { line: 0, column: 0, severity: "error", message: "Undefined variable", code: "UNDEFINED_VAR", fix: "Define variable" },
    { line: 0, column: 0, severity: "warning", message: "Unused variable", code: "UNUSED_VAR", fix: "Remove variable" },
  ],
  python: [
    { line: 0, column: 0, severity: "error", message: "Indentation error", code: "INDENT_ERROR", fix: "Fix indentation" },
    { line: 0, column: 0, severity: "warning", message: "Missing docstring", code: "MISSING_DOCSTRING", fix: "Add docstring" },
  ],
  bash: [
    { line: 0, column: 0, severity: "warning", message: "Quote variable", code: "UNQUOTED_VAR", fix: 'Use "$var"' },
  ],
};

export function analyzeCode(code: string, language: string): AnalysisResult {
  const lines = code.split("\n");
  const issues: CodeIssue[] = [];

  // Basic syntax checks
  issues.push(...checkSyntax(code, language));

  // Style checks
  issues.push(...checkStyle(code, language));

  // Security checks
  issues.push(...checkSecurity(code, language));

  // Calculate metrics
  const metrics = {
    lines: lines.length,
    complexity: calculateComplexity(code),
    maintainability: calculateMaintainability(code, issues),
  };

  return {
    language,
    issues: issues.slice(0, 10), // Limit to 10 issues
    metrics,
  };
}

function checkSyntax(code: string, language: string): CodeIssue[] {
  const issues: CodeIssue[] = [];

  if (language === "javascript" || language === "cpp" || language === "java" || language === "c") {
    // Check for unmatched braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push({
        line: 1,
        column: 0,
        severity: "error",
        message: `Unmatched braces: ${openBraces} open, ${closeBraces} close`,
        code: "UNMATCHED_BRACES",
        fix: "Balance braces",
      });
    }

    // Check for unmatched parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push({
        line: 1,
        column: 0,
        severity: "error",
        message: `Unmatched parentheses: ${openParens} open, ${closeParens} close`,
        code: "UNMATCHED_PARENS",
        fix: "Balance parentheses",
      });
    }
  }

  if (language === "python") {
    // Check for indentation issues
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const leadingSpaces = line.match(/^ */)?.[0].length || 0;
      if (leadingSpaces % 4 !== 0 && line.trim().length > 0) {
        issues.push({
          line: i + 1,
          column: leadingSpaces,
          severity: "error",
          message: "Indentation must be multiple of 4",
          code: "INDENT_ERROR",
          fix: "Fix indentation to multiple of 4",
        });
      }
    }
  }

  return issues;
}

function checkStyle(code: string, language: string): CodeIssue[] {
  const issues: CodeIssue[] = [];

  if (language === "javascript") {
    // Check for var usage
    if (/\bvar\s+\w+/.test(code)) {
      issues.push({
        line: 1,
        column: 0,
        severity: "warning",
        message: "Use 'const' or 'let' instead of 'var'",
        code: "VAR_USAGE",
        fix: "Replace 'var' with 'const' or 'let'",
      });
    }

    // Check for console.log in production
    if (/console\.log/.test(code)) {
      issues.push({
        line: 1,
        column: 0,
        severity: "warning",
        message: "Remove console.log from production code",
        code: "CONSOLE_LOG",
        fix: "Remove console.log statements",
      });
    }
  }

  if (language === "python") {
    // Check for print statements
    if (/print\(/.test(code)) {
      issues.push({
        line: 1,
        column: 0,
        severity: "info",
        message: "Consider using logging instead of print",
        code: "PRINT_USAGE",
        fix: "Use logging module",
      });
    }
  }

  return issues;
}

function checkSecurity(code: string, language: string): CodeIssue[] {
  const issues: CodeIssue[] = [];

  if (language === "javascript" || language === "php") {
    // Check for eval usage
    if (/eval\(/.test(code)) {
      issues.push({
        line: 1,
        column: 0,
        severity: "error",
        message: "Avoid using eval() - security risk",
        code: "EVAL_USAGE",
        fix: "Replace eval with safer alternatives",
      });
    }

    // Check for hardcoded credentials
    if (/password\s*=|api[_-]?key\s*=|secret\s*=/.test(code)) {
      issues.push({
        line: 1,
        column: 0,
        severity: "error",
        message: "Hardcoded credentials detected",
        code: "HARDCODED_CREDENTIALS",
        fix: "Use environment variables for sensitive data",
      });
    }
  }

  if (language === "sql") {
    // Check for SQL injection
    if (/SELECT.*\+|UNION|DROP|DELETE|UPDATE/.test(code)) {
      issues.push({
        line: 1,
        column: 0,
        severity: "warning",
        message: "Use parameterized queries to prevent SQL injection",
        code: "SQL_INJECTION_RISK",
        fix: "Use prepared statements",
      });
    }
  }

  return issues;
}

function calculateComplexity(code: string): number {
  let complexity = 1;

  // Count control flow statements
  complexity += (code.match(/if\s*\(/g) || []).length;
  complexity += (code.match(/for\s*\(/g) || []).length;
  complexity += (code.match(/while\s*\(/g) || []).length;
  complexity += (code.match(/switch\s*\(/g) || []).length;
  complexity += (code.match(/catch\s*\(/g) || []).length;

  return Math.min(complexity, 10); // Cap at 10
}

function calculateMaintainability(code: string, issues: CodeIssue[]): number {
  let score = 100;

  // Deduct for errors
  score -= issues.filter((i) => i.severity === "error").length * 10;

  // Deduct for warnings
  score -= issues.filter((i) => i.severity === "warning").length * 5;

  // Deduct for code length
  const lines = code.split("\n").length;
  if (lines > 100) score -= 10;
  if (lines > 500) score -= 20;

  return Math.max(score, 0);
}

export function suggestFix(issue: CodeIssue, code: string): string {
  if (issue.fix) {
    return issue.fix;
  }

  switch (issue.code) {
    case "UNMATCHED_BRACES":
      return "Check for missing or extra braces in your code";
    case "UNMATCHED_PARENS":
      return "Check for missing or extra parentheses in your code";
    case "UNDEFINED_VAR":
      return "Define the variable before using it";
    case "UNUSED_VAR":
      return "Remove unused variables to clean up code";
    default:
      return "Review the code around this issue";
  }
}
