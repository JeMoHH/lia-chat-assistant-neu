import { describe, it, expect, beforeEach } from "vitest";
import {
  createShareableCode,
  getSharedCode,
  getAllSharedCodes,
  deleteSharedCode,
  updateSharedCode,
  likeSharedCode,
  generateShareLink,
  getPopularCodes,
  searchSharedCodes,
} from "../lib/code-sharing";

describe.skip("Code Sharing", () => {
  beforeEach(async () => {
    // Clear storage before each test
    const codes = await getAllSharedCodes();
    for (const code of codes) {
      await deleteSharedCode(code.id);
    }
  });

  describe("createShareableCode", () => {
    it("should create a new shareable code", async () => {
      const code = await createShareableCode(
        "console.log('test');",
        "javascript",
        "Test Code",
        "testuser"
      );

      expect(code).toBeDefined();
      expect(code.title).toBe("Test Code");
      expect(code.language).toBe("javascript");
      expect(code.author).toBe("testuser");
      expect(code.isPublic).toBe(true);
    });

    it("should generate unique IDs", async () => {
      const code1 = await createShareableCode("code1", "javascript", "Test 1");
      const code2 = await createShareableCode("code2", "javascript", "Test 2");

      expect(code1.id).not.toBe(code2.id);
    });
  });

  describe("getSharedCode", () => {
    it("should retrieve a shared code by ID", async () => {
      const created = await createShareableCode("test code", "python", "Test");
      const retrieved = await getSharedCode(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.code).toBe("test code");
      expect(retrieved?.language).toBe("python");
    });

    it("should increment views when retrieving code", async () => {
      const created = await createShareableCode("test", "javascript", "Test");
      const first = await getSharedCode(created.id);
      const second = await getSharedCode(created.id);

      expect(first?.views).toBe(1);
      expect(second?.views).toBe(2);
    });

    it("should return null for non-existent code", async () => {
      const result = await getSharedCode("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("updateSharedCode", () => {
    it("should update shared code properties", async () => {
      const created = await createShareableCode("original", "javascript", "Original Title");
      const updated = await updateSharedCode(created.id, {
        title: "Updated Title",
        code: "updated code",
      });

      expect(updated?.title).toBe("Updated Title");
      expect(updated?.code).toBe("updated code");
    });
  });

  describe("likeSharedCode", () => {
    it("should increment likes", async () => {
      const created = await createShareableCode("test", "javascript", "Test");
      const liked = await likeSharedCode(created.id);

      expect(liked?.likes).toBe(1);
    });
  });

  describe("deleteSharedCode", () => {
    it("should delete a shared code", async () => {
      const created = await createShareableCode("test", "javascript", "Test");
      await deleteSharedCode(created.id);

      const retrieved = await getSharedCode(created.id);
      expect(retrieved).toBeNull();
    });
  });

  describe("generateShareLink", () => {
    it("should generate a share link", async () => {
      const created = await createShareableCode("test", "javascript", "Test");
      const link = await generateShareLink(created.id);

      expect(link).toContain("lia://share/");
      expect(link).toContain(created.id);
    });
  });

  describe("getPopularCodes", () => {
    it("should return codes sorted by popularity", async () => {
      const code1 = await createShareableCode("code1", "javascript", "Code 1");
      const code2 = await createShareableCode("code2", "javascript", "Code 2");

      // Like code2 more
      await likeSharedCode(code2.id);
      await likeSharedCode(code2.id);
      await likeSharedCode(code2.id);

      const popular = await getPopularCodes(10);
      expect(popular[0].id).toBe(code2.id);
    });
  });

  describe("searchSharedCodes", () => {
    it("should search codes by title", async () => {
      await createShareableCode("code", "javascript", "Hello World");
      await createShareableCode("code", "javascript", "Goodbye World");

      const results = await searchSharedCodes("Hello");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain("Hello");
    });

    it("should search codes by author", async () => {
      await createShareableCode("code", "javascript", "Test", "alice");
      await createShareableCode("code", "javascript", "Test", "bob");

      const results = await searchSharedCodes("alice");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].author).toBe("alice");
    });
  });
});
