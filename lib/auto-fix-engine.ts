import { realAPIClient } from "./real-api-client";

/**
 * Auto-Fix and Self-Coding Engine for Lia
 * Automatically detects and fixes errors, and can self-modify code
 */

export interface CodeIssue {
  type: "error" | "warning" | "suggestion";
  line: number;
  column: number;
  message: string;
  code: string;
  fix?: string;
}

export interface FixResult {
  success: boolean;
  originalCode: string;
  fixedCode: string;
  issues: CodeIssue[];
  appliedFixes: string[];
  errors?: string[];
}

export interface SelfModificationRequest {
  capability: string;
  improvement: string;
  targetCode: string;
}

export interface SelfModificationResult {
  success: boolean;
  originalCode: string;
  modifiedCode: string;
  changes: string[];
  testsPassed: boolean;
}

class AutoFixEngine {
  private fixHistory: FixResult[] = [];
  private readonly MAX_HISTORY = 100;

  /**
   * Analyze code and detect issues
   */
  async analyzeCode(code: string, language: string): Promise<CodeIssue[]> {
    try {
      const response = await realAPIClient.analyzeCode(code, language);
      return response.issues || [];
    } catch (error) {
      console.error("Code analysis failed:", error);
      return this.performLocalAnalysis(code, language);
    }
  }

  /**
   * Perform local code analysis (fallback)
   */
  private performLocalAnalysis(code: string, language: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Check for common issues
    const lines = code.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for undefined variables
      if (language === "javascript" || language === "typescript") {
        if (line.includes("undefined") && !line.includes("=== undefined")) {
          issues.push({
            type: "warning",
            line: i + 1,
            column: line.indexOf("undefined"),
            message: "Potential undefined variable",
            code: "undefined-var",
          });
        }

        // Check for missing semicolons
        if (line.trim() && !line.trim().endsWith(";") && !line.trim().endsWith("{") && !line.trim().endsWith("}")) {
          issues.push({
            type: "suggestion",
            line: i + 1,
            column: line.length,
            message: "Missing semicolon",
            code: "missing-semicolon",
            fix: line + ";",
          });
        }
      }

      // Check for syntax errors
      if (line.includes("{{") || line.includes("}}")) {
        issues.push({
          type: "error",
          line: i + 1,
          column: line.indexOf("{"),
          message: "Potential syntax error",
          code: "syntax-error",
        });
      }
    }

    return issues;
  }

  /**
   * Auto-fix code issues
   */
  async autoFixCode(code: string, language: string): Promise<FixResult> {
    try {
      const issues = await this.analyzeCode(code, language);

      if (issues.length === 0) {
        return {
          success: true,
          originalCode: code,
          fixedCode: code,
          issues: [],
          appliedFixes: [],
        };
      }

      // Try real API auto-fix
      try {
        const response = await realAPIClient.autoFixCode(code, language);
        const fixResult: FixResult = {
          success: true,
          originalCode: code,
          fixedCode: response.fixed,
          issues,
          appliedFixes: issues.map((issue) => issue.code),
        };

        this.addToHistory(fixResult);
        return fixResult;
      } catch (apiError) {
        // Fallback to local fixes
        console.warn("Real API auto-fix failed, using local fixes:", apiError);
        return this.performLocalFixes(code, issues);
      }
    } catch (error) {
      console.error("Auto-fix failed:", error);
      return {
        success: false,
        originalCode: code,
        fixedCode: code,
        issues: [],
        appliedFixes: [],
        errors: [String(error)],
      };
    }
  }

  /**
   * Perform local code fixes
   */
  private performLocalFixes(code: string, issues: CodeIssue[]): FixResult {
    let fixedCode = code;
    const appliedFixes: string[] = [];

    for (const issue of issues) {
      if (issue.fix) {
        const lines = fixedCode.split("\n");
        if (issue.line - 1 < lines.length) {
          lines[issue.line - 1] = issue.fix;
          fixedCode = lines.join("\n");
          appliedFixes.push(issue.code);
        }
      }
    }

    const result: FixResult = {
      success: appliedFixes.length > 0,
      originalCode: code,
      fixedCode,
      issues,
      appliedFixes,
    };

    this.addToHistory(result);
    return result;
  }

  /**
   * Self-modify code for improvement
   */
  async selfModifyCode(request: SelfModificationRequest): Promise<SelfModificationResult> {
    try {
      console.log(`Self-modifying capability '${request.capability}' for: ${request.improvement}`);

      // Analyze current code
      const issues = await this.analyzeCode(request.targetCode, "typescript");

      // Generate improved version
      const improvedCode = await this.generateImprovement(
        request.targetCode,
        request.improvement,
        issues
      );

      // Test improved code
      const testsPassed = await this.testCode(improvedCode);

      if (testsPassed) {
        return {
          success: true,
          originalCode: request.targetCode,
          modifiedCode: improvedCode,
          changes: [request.improvement],
          testsPassed: true,
        };
      } else {
        return {
          success: false,
          originalCode: request.targetCode,
          modifiedCode: request.targetCode,
          changes: [],
          testsPassed: false,
        };
      }
    } catch (error) {
      console.error("Self-modification failed:", error);
      return {
        success: false,
        originalCode: request.targetCode,
        modifiedCode: request.targetCode,
        changes: [],
        testsPassed: false,
      };
    }
  }

  /**
   * Generate improved code
   */
  private async generateImprovement(
    code: string,
    improvement: string,
    issues: CodeIssue[]
  ): Promise<string> {
    // Create improved version based on improvement description
    let improvedCode = code;

    if (improvement.includes("performance")) {
      improvedCode = this.optimizeForPerformance(code);
    } else if (improvement.includes("readability")) {
      improvedCode = this.optimizeForReadability(code);
    } else if (improvement.includes("security")) {
      improvedCode = this.optimizeForSecurity(code);
    } else if (improvement.includes("maintainability")) {
      improvedCode = this.optimizeForMaintainability(code);
    }

    return improvedCode;
  }

  private optimizeForPerformance(code: string): string {
    // Add performance optimizations
    let optimized = code;

    // Replace inefficient patterns
    optimized = optimized.replace(/for\s*\(\s*let\s+i\s*=\s*0\s*;\s*i\s*<\s*arr\.length\s*;\s*i\+\+\s*\)/g, "for (const item of arr)");

    return optimized;
  }

  private optimizeForReadability(code: string): string {
    // Add comments and improve formatting
    let optimized = code;

    // Add section comments
    const sections = optimized.split("\n\n");
    optimized = sections
      .map((section, i) => `// Section ${i + 1}\n${section}`)
      .join("\n\n");

    return optimized;
  }

  private optimizeForSecurity(code: string): string {
    // Add security checks
    let optimized = code;

    // Add input validation
    optimized = optimized.replace(/function\s+(\w+)\s*\(/g, "function $1(input) { if (!input) throw new Error('Invalid input'); ");

    return optimized;
  }

  private optimizeForMaintainability(code: string): string {
    // Improve code structure
    let optimized = code;

    // Add type hints
    optimized = optimized.replace(/const\s+(\w+)\s*=/g, "const $1: any =");

    return optimized;
  }

  /**
   * Test code execution
   */
  private async testCode(code: string): Promise<boolean> {
    try {
      // Try to execute code in sandbox
      const result = await realAPIClient.executeCode(code, "typescript");
      return !result.error;
    } catch (error) {
      console.warn("Code test failed:", error);
      return false;
    }
  }

  /**
   * Get fix history
   */
  getFixHistory(): FixResult[] {
    return [...this.fixHistory];
  }

  /**
   * Clear fix history
   */
  clearFixHistory(): void {
    this.fixHistory = [];
  }

  private addToHistory(result: FixResult): void {
    this.fixHistory.push(result);

    // Keep only recent history
    if (this.fixHistory.length > this.MAX_HISTORY) {
      this.fixHistory.shift();
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalFixes: number;
    successfulFixes: number;
    successRate: number;
  } {
    const totalFixes = this.fixHistory.length;
    const successfulFixes = this.fixHistory.filter((r) => r.success).length;

    return {
      totalFixes,
      successfulFixes,
      successRate: totalFixes > 0 ? (successfulFixes / totalFixes) * 100 : 0,
    };
  }
}

export const autoFixEngine = new AutoFixEngine();
