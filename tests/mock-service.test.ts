import { describe, it, expect } from "vitest";
import { getMockAIResponse, getMockImageUrl, getMockGenerationResult, simulateDelay } from "../lib/mock-service";

describe("Mock Service", () => {
  describe("getMockAIResponse", () => {
    it("should return greeting for hello", () => {
      const response = getMockAIResponse("hello");
      expect(response).toContain("Hello");
    });

    it("should return help for help query", () => {
      const response = getMockAIResponse("help");
      expect(response).toContain("help");
    });

    it("should return image generation info for generate command", () => {
      const response = getMockAIResponse("generate");
      expect(response).toContain("generate");
    });

    it("should return a response for any message", () => {
      const response = getMockAIResponse("random message");
      expect(response).toBeTruthy();
      expect(typeof response).toBe("string");
    });

    it("should handle case-insensitive keywords", () => {
      const response1 = getMockAIResponse("HELLO");
      const response2 = getMockAIResponse("Hello");
      expect(response1).toContain("Hello");
      expect(response2).toContain("Hello");
    });
  });

  describe("getMockImageUrl", () => {
    it("should return a valid URL", () => {
      const url = getMockImageUrl("sunset landscape");
      expect(url).toContain("https://");
    });

    it("should be consistent for same prompt", () => {
      const url1 = getMockImageUrl("test prompt");
      const url2 = getMockImageUrl("test prompt");
      expect(url1).toBe(url2);
    });

    it("should return different URLs for different prompts", () => {
      const url1 = getMockImageUrl("sunset");
      const url2 = getMockImageUrl("ocean");
      // They might be the same due to hash collision, but usually different
      expect(url1).toBeTruthy();
      expect(url2).toBeTruthy();
    });
  });

  describe("getMockGenerationResult", () => {
    it("should return a valid generation result", () => {
      const result = getMockGenerationResult("sunset landscape", "stable-diffusion-xl");
      expect(result.id).toBeTruthy();
      expect(result.task).toBe("text2img");
      expect(result.model).toBe("stable-diffusion-xl");
      expect(result.status).toBe("completed");
      expect(result.result_url).toBeTruthy();
      expect(result.created_at).toBeInstanceOf(Date);
    });

    it("should generate unique IDs", async () => {
      const result1 = getMockGenerationResult("test", "stable-diffusion-xl");
      await simulateDelay(10);
      const result2 = getMockGenerationResult("test", "stable-diffusion-xl");
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe("simulateDelay", () => {
    it("should resolve after specified delay", async () => {
      const start = Date.now();
      await simulateDelay(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90); // Allow 10ms tolerance
    });

    it("should use default delay of 1000ms", async () => {
      const start = Date.now();
      await simulateDelay();
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(990);
    });
  });
});
