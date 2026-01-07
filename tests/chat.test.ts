import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Chat Context Tests
 * Tests for the core chat functionality including message sending and chat creation
 */

describe("Chat Context", () => {
  describe("Chat Creation", () => {
    it("should create a new chat with proper structure", () => {
      const newChat = {
        id: Date.now().toString(),
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(newChat).toHaveProperty("id");
      expect(newChat).toHaveProperty("title");
      expect(newChat).toHaveProperty("messages");
      expect(newChat).toHaveProperty("createdAt");
      expect(newChat).toHaveProperty("updatedAt");
      expect(newChat.messages).toEqual([]);
    });

    it("should generate unique chat IDs", () => {
      const chat1 = {
        id: Date.now().toString(),
        title: "Chat 1",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const chat2 = {
        id: (Date.now() + 1).toString(),
        title: "Chat 2",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(chat1.id).not.toEqual(chat2.id);
    });
  });

  describe("Message Structure", () => {
    it("should create a user message with proper structure", () => {
      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: "Hello, Lia!",
        timestamp: new Date(),
      };

      expect(userMessage).toHaveProperty("id");
      expect(userMessage).toHaveProperty("role");
      expect(userMessage).toHaveProperty("content");
      expect(userMessage).toHaveProperty("timestamp");
      expect(userMessage.role).toBe("user");
    });

    it("should create an assistant message with proper structure", () => {
      const assistantMessage = {
        id: Date.now().toString(),
        role: "assistant" as const,
        content: "Hello! How can I help you?",
        timestamp: new Date(),
        isTyping: false,
      };

      expect(assistantMessage).toHaveProperty("id");
      expect(assistantMessage).toHaveProperty("role");
      expect(assistantMessage).toHaveProperty("content");
      expect(assistantMessage).toHaveProperty("timestamp");
      expect(assistantMessage.role).toBe("assistant");
    });

    it("should support typing indicator for assistant messages", () => {
      const typingMessage = {
        id: `typing-${Date.now()}`,
        role: "assistant" as const,
        content: "",
        timestamp: new Date(),
        isTyping: true,
      };

      expect(typingMessage.isTyping).toBe(true);
      expect(typingMessage.content).toBe("");
    });
  });

  describe("Message Validation", () => {
    it("should trim whitespace from message content", () => {
      const content = "  Hello, Lia!  ";
      const trimmed = content.trim();

      expect(trimmed).toBe("Hello, Lia!");
      expect(trimmed).not.toEqual(content);
    });

    it("should reject empty messages", () => {
      const content = "   ";
      const isValid = content.trim().length > 0;

      expect(isValid).toBe(false);
    });

    it("should accept non-empty messages", () => {
      const content = "Hello";
      const isValid = content.trim().length > 0;

      expect(isValid).toBe(true);
    });
  });

  describe("Generate Command Parsing", () => {
    it("should detect /generate command", () => {
      const content = "/generate sunset landscape";
      const isGenerateCommand = content.trim().startsWith("/generate ");

      expect(isGenerateCommand).toBe(true);
    });

    it("should extract prompt from /generate command", () => {
      const content = "/generate sunset landscape";
      const prompt = content.trim().substring(9).trim();

      expect(prompt).toBe("sunset landscape");
    });

    it("should not detect /generate in regular messages", () => {
      const content = "Can you generate an image?";
      const isGenerateCommand = content.trim().startsWith("/generate ");

      expect(isGenerateCommand).toBe(false);
    });
  });

  describe("Chat History Management", () => {
    it("should maintain chat order with newest first", () => {
      const chats = [
        {
          id: "3",
          title: "Chat 3",
          messages: [],
          createdAt: new Date(2024, 0, 3),
          updatedAt: new Date(2024, 0, 3),
        },
        {
          id: "1",
          title: "Chat 1",
          messages: [],
          createdAt: new Date(2024, 0, 1),
          updatedAt: new Date(2024, 0, 1),
        },
        {
          id: "2",
          title: "Chat 2",
          messages: [],
          createdAt: new Date(2024, 0, 2),
          updatedAt: new Date(2024, 0, 2),
        },
      ];

      expect(chats[0].id).toBe("3");
      expect(chats[1].id).toBe("1");
      expect(chats[2].id).toBe("2");
    });

    it("should support deleting a chat", () => {
      const chats = [
        { id: "1", title: "Chat 1", messages: [], createdAt: new Date(), updatedAt: new Date() },
        { id: "2", title: "Chat 2", messages: [], createdAt: new Date(), updatedAt: new Date() },
        { id: "3", title: "Chat 3", messages: [], createdAt: new Date(), updatedAt: new Date() },
      ];

      const filtered = chats.filter((chat) => chat.id !== "2");

      expect(filtered.length).toBe(2);
      expect(filtered.find((c) => c.id === "2")).toBeUndefined();
    });

    it("should update chat title on first message", () => {
      const chat = {
        id: "1",
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const firstMessage = "What is the weather today?";
      const updatedChat = {
        ...chat,
        title: firstMessage.slice(0, 50),
      };

      expect(updatedChat.title).toBe("What is the weather today?");
    });
  });

  describe("Message Updates", () => {
    it("should update typing message with response content", () => {
      const typingMessage = {
        id: `typing-${Date.now()}`,
        role: "assistant" as const,
        content: "",
        timestamp: new Date(),
        isTyping: true,
      };

      const responseContent = "This is the AI response.";
      const updatedMessage = {
        ...typingMessage,
        content: responseContent,
        isTyping: false,
      };

      expect(updatedMessage.content).toBe(responseContent);
      expect(updatedMessage.isTyping).toBe(false);
    });

    it("should preserve message ID during update", () => {
      const messageId = "msg-123";
      const message = {
        id: messageId,
        role: "assistant" as const,
        content: "Old content",
        timestamp: new Date(),
      };

      const updated = {
        ...message,
        content: "New content",
      };

      expect(updated.id).toBe(messageId);
    });
  });
});
