export interface BugFix {
  id: string;
  originalCode: string;
  fixedCode: string;
  language: string;
  issues: string[];
  fixes: string[];
  confidence: number;
  timestamp: number;
}

export interface BugReport {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning" | "info";
  suggestion?: string;
}

const BUG_PATTERNS: Record<string, { pattern: RegExp; fix: (match: string) => string; message: string }> = {
  // JavaScript/TypeScript patterns
  missingVar: {
    pattern: /(?<!var |let |const )\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=/,
    fix: (match) => `const ${match}`,
    message: "Missing variable declaration",
  },
  unusedVar: {
    pattern: /(?:var|let|const)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=.*?;(?!.*\1)/,
    fix: (match) => "",
    message: "Unused variable declaration",
  },
  missingReturn: {
    pattern: /function\s+\w+\([^)]*\)\s*{(?!.*return)/,
    fix: (match) => match + "\n  return;",
    message: "Function missing return statement",
  },
  // Python patterns
  indentationError: {
    pattern: /^(?![ \t])[^ \t]/m,
    fix: (match) => `  ${match}`,
    message: "Indentation error",
  },
  missingColon: {
    pattern: /(if|else|for|while|def|class)\s+.*[^:]\s*$/m,
    fix: (match) => `${match}:`,
    message: "Missing colon",
  },
  // Common patterns
  trailingComma: {
    pattern: /,\s*[}\]]/,
    fix: (match) => match.replace(/,/, ""),
    message: "Trailing comma",
  },
  doubleQuotes: {
    pattern: /"""/,
    fix: (match) => '"""',
    message: "Mismatched quotes",
  },
};

export class AutoBugFixer {
  private fixes: BugFix[] = [];

  analyzeAndFix(code: string, language: string): BugFix {
    const issues: string[] = [];
    const fixes: string[] = [];
    let fixedCode = code;
    let confidence = 0;

    // Detect common issues
    const detectedIssues = this.detectIssues(code, language);
    issues.push(...detectedIssues.map((issue) => issue.message));

    // Apply fixes
    detectedIssues.forEach((issue) => {
      if (issue.suggestion) {
        fixes.push(issue.suggestion);
        confidence += 0.1;
      }
    });

    // Apply pattern-based fixes
    Object.entries(BUG_PATTERNS).forEach(([key, { pattern, fix, message }]) => {
      if (pattern.test(fixedCode)) {
        issues.push(message);
        fixedCode = fixedCode.replace(pattern, fix);
        fixes.push(`Applied fix for: ${message}`);
        confidence += 0.15;
      }
    });

    // Normalize whitespace
    fixedCode = this.normalizeWhitespace(fixedCode);
    if (fixedCode !== code) {
      fixes.push("Normalized whitespace");
      confidence += 0.05;
    }

    // Check for common syntax errors
    const syntaxIssues = this.checkSyntax(fixedCode, language);
    syntaxIssues.forEach((issue) => {
      issues.push(issue.message);
      if (issue.suggestion) {
        fixes.push(issue.suggestion);
        confidence += 0.1;
      }
    });

    // Ensure confidence is between 0 and 1
    confidence = Math.min(confidence, 1);

    const bugFix: BugFix = {
      id: this.generateId(),
      originalCode: code,
      fixedCode,
      language,
      issues,
      fixes,
      confidence,
      timestamp: Date.now(),
    };

    this.fixes.push(bugFix);
    return bugFix;
  }

  private detectIssues(code: string, language: string): BugReport[] {
    const issues: BugReport[] = [];
    const lines = code.split("\n");

    lines.forEach((line, index) => {
      // Check for common issues
      if (line.trim().length === 0) return;

      // Missing semicolons (JavaScript)
      if (language === "javascript" && !line.trim().endsWith(";") && !line.trim().endsWith("{") && !line.trim().endsWith("}")) {
        issues.push({
          line: index + 1,
          column: line.length,
          message: "Missing semicolon",
          severity: "warning",
          suggestion: "Add semicolon at end of line",
        });
      }

      // Unmatched brackets
      const openBrackets = (line.match(/[{[(/]/g) || []).length;
      const closeBrackets = (line.match(/[}\]]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        issues.push({
          line: index + 1,
          column: line.length,
          message: "Unmatched brackets",
          severity: "error",
          suggestion: "Check bracket matching",
        });
      }

      // Unused console.log
      if (line.includes("console.log") && !line.includes("//")) {
        issues.push({
          line: index + 1,
          column: line.indexOf("console.log"),
          message: "Debug console.log found",
          severity: "info",
          suggestion: "Remove debug statement",
        });
      }
    });

    return issues;
  }

  private checkSyntax(code: string, language: string): BugReport[] {
    const issues: BugReport[] = [];

    try {
      if (language === "javascript" || language === "typescript") {
        // Basic syntax check
        if (code.includes("var ") && !code.includes("const ") && !code.includes("let ")) {
          issues.push({
            line: 1,
            column: 0,
            message: "Using var instead of const/let",
            severity: "warning",
            suggestion: "Replace var with const or let",
          });
        }
      }

      if (language === "python") {
        // Check for common Python issues
        if (code.includes("print ") && !code.includes("print(")) {
          issues.push({
            line: 1,
            column: 0,
            message: "Python 2 print statement",
            severity: "error",
            suggestion: "Use print() function for Python 3",
          });
        }
      }
    } catch {
      // Syntax check failed
    }

    return issues;
  }

  private normalizeWhitespace(code: string): string {
    return code
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .replace(/\n\n+/g, "\n");
  }

  getFixHistory(): BugFix[] {
    return this.fixes;
  }

  getLastFix(): BugFix | null {
    return this.fixes[this.fixes.length - 1] || null;
  }

  clearHistory(): void {
    this.fixes = [];
  }

  private generateId(): string {
    return `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateReport(fix: BugFix): string {
    let report = "=== Automated Bug Fix Report ===\n\n";
    report += `Language: ${fix.language}\n`;
    report += `Confidence: ${(fix.confidence * 100).toFixed(1)}%\n`;
    report += `Timestamp: ${new Date(fix.timestamp).toLocaleString()}\n\n`;

    if (fix.issues.length > 0) {
      report += "Issues Found:\n";
      fix.issues.forEach((issue, i) => {
        report += `  ${i + 1}. ${issue}\n`;
      });
      report += "\n";
    }

    if (fix.fixes.length > 0) {
      report += "Fixes Applied:\n";
      fix.fixes.forEach((fixItem, i) => {
        report += `  ${i + 1}. ${fixItem}\n`;
      });
      report += "\n";
    }

    report += "Original Code:\n";
    report += "─".repeat(40) + "\n";
    report += fix.originalCode + "\n";
    report += "─".repeat(40) + "\n\n";

    report += "Fixed Code:\n";
    report += "─".repeat(40) + "\n";
    report += fix.fixedCode + "\n";
    report += "─".repeat(40) + "\n";

    return report;
  }
}

export const autoBugFixer = new AutoBugFixer();
