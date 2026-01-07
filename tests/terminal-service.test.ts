import { describe, it, expect } from "vitest";
import { executeCode, formatOutput } from "../lib/terminal-service";

describe("Terminal Service", () => {
  describe("executeCode", () => {
    it("should execute JavaScript code", async () => {
      const code = "console.log('test');";
      const result = await executeCode(code, "javascript");
      expect(result.language).toBe("javascript");
      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it("should execute Python code", async () => {
      const code = "print('test')";
      const result = await executeCode(code, "python");
      expect(result.language).toBe("python");
      expect(result.exitCode).toBe(0);
    });

    it("should execute Bash code", async () => {
      const code = "echo 'test'";
      const result = await executeCode(code, "bash");
      expect(result.language).toBe("bash");
      expect(result.exitCode).toBe(0);
    });

    it("should include stdout in result", async () => {
      const code = "console.log('output');";
      const result = await executeCode(code, "javascript");
      expect(result.stdout).toBeTruthy();
    });

    it("should measure execution duration", async () => {
      const code = "console.log('test');";
      const result = await executeCode(code, "javascript");
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe("formatOutput", () => {
    it("should format successful output", () => {
      const result = {
        stdout: "Hello World",
        stderr: "",
        exitCode: 0,
        duration: 100,
        language: "javascript",
      };
      const formatted = formatOutput(result);
      expect(formatted).toContain("Output");
      expect(formatted).toContain("Hello World");
      expect(formatted).toContain("100ms");
    });

    it("should format error output", () => {
      const result = {
        stdout: "",
        stderr: "Error: undefined variable",
        exitCode: 1,
        duration: 50,
        language: "javascript",
      };
      const formatted = formatOutput(result);
      expect(formatted).toContain("Errors");
      expect(formatted).toContain("Error: undefined variable");
    });

    it("should include exit code in output", () => {
      const result = {
        stdout: "test",
        stderr: "",
        exitCode: 0,
        duration: 100,
        language: "python",
      };
      const formatted = formatOutput(result);
      expect(formatted).toContain("Exit Code");
      expect(formatted).toContain("0");
    });
  });
});
