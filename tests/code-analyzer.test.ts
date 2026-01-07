import { describe, it, expect } from "vitest";
import { analyzeCode, suggestFix } from "../lib/code-analyzer";

describe("Code Analyzer", () => {
  describe("analyzeCode", () => {
    it("should detect unmatched braces in JavaScript", () => {
      const code = "function test() { console.log('hello')";
      const result = analyzeCode(code, "javascript");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some((i) => i.code === "UNMATCHED_BRACES")).toBe(true);
    });

    it("should detect indentation errors in Python", () => {
      const code = "def test():\n  x = 1\n   y = 2"; // 3 spaces instead of 4
      const result = analyzeCode(code, "python");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some((i) => i.code === "INDENT_ERROR")).toBe(true);
    });

    it("should detect var usage in JavaScript", () => {
      const code = "var x = 5;";
      const result = analyzeCode(code, "javascript");
      expect(result.issues.some((i) => i.code === "VAR_USAGE")).toBe(true);
    });

    it("should detect console.log in JavaScript", () => {
      const code = "console.log('debug');";
      const result = analyzeCode(code, "javascript");
      expect(result.issues.some((i) => i.code === "CONSOLE_LOG")).toBe(true);
    });

    it("should detect eval usage", () => {
      const code = "eval('malicious code');";
      const result = analyzeCode(code, "javascript");
      expect(result.issues.some((i) => i.code === "EVAL_USAGE")).toBe(true);
    });

    it("should detect hardcoded credentials", () => {
      const code = "const api_key = 'secret123';";
      const result = analyzeCode(code, "javascript");
      expect(result.issues.some((i) => i.code === "HARDCODED_CREDENTIALS")).toBe(true);
    });

    it("should calculate code metrics", () => {
      const code = "function test() {\n  if (true) {\n    console.log('test');\n  }\n}";
      const result = analyzeCode(code, "javascript");
      expect(result.metrics.lines).toBe(5);
      expect(result.metrics.complexity).toBeGreaterThan(0);
      expect(result.metrics.maintainability).toBeGreaterThanOrEqual(0);
      expect(result.metrics.maintainability).toBeLessThanOrEqual(100);
    });

    it("should return language in result", () => {
      const code = "print('hello')";
      const result = analyzeCode(code, "python");
      expect(result.language).toBe("python");
    });

    it("should limit issues to 10", () => {
      const code = "var a; var b; var c; var d; var e; var f; var g; var h; var i; var j; var k;";
      const result = analyzeCode(code, "javascript");
      expect(result.issues.length).toBeLessThanOrEqual(10);
    });
  });

  describe("suggestFix", () => {
    it("should suggest fix for unmatched braces", () => {
      const issue = {
        line: 1,
        column: 0,
        severity: "error" as const,
        message: "Unmatched braces",
        code: "UNMATCHED_BRACES",
      };
      const fix = suggestFix(issue, "");
      expect(fix).toContain("braces");
    });

    it("should use provided fix if available", () => {
      const issue = {
        line: 1,
        column: 0,
        severity: "error" as const,
        message: "Test issue",
        code: "TEST_CODE",
        fix: "Custom fix message",
      };
      const fix = suggestFix(issue, "");
      expect(fix).toBe("Custom fix message");
    });

    it("should suggest generic fix for unknown code", () => {
      const issue = {
        line: 1,
        column: 0,
        severity: "warning" as const,
        message: "Unknown issue",
        code: "UNKNOWN_CODE",
      };
      const fix = suggestFix(issue, "");
      expect(fix).toContain("Review");
    });
  });
});
