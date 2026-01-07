/**
 * Mock Service for Lia Chat Assistant
 * Provides realistic mock responses for AI chat and image generation
 * Used when backend is unavailable
 */

const mockResponses = [
  "That's an interesting question! Let me help you with that.",
  "I can definitely assist you with that. Here's what I know...",
  "Great question! This is a common topic. Let me explain...",
  "I'd be happy to help! Based on your question, I think...",
  "That's a thoughtful inquiry. Here's my perspective...",
  "Absolutely! I can provide some insights on that.",
  "Interesting point! Let me share what I know about this.",
  "I understand what you're asking. Here's what I can tell you...",
];

const mockImageUrls = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop",
  "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=512&h=512&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop",
];

export function getMockAIResponse(userMessage: string): string {
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  const keywords = userMessage.toLowerCase().split(" ");

  // Generate contextual responses based on keywords
  if (keywords.includes("hello") || keywords.includes("hi")) {
    return "Hello! 👋 I'm Lia, your AI assistant. How can I help you today?";
  }

  if (keywords.includes("generate") || keywords.includes("image")) {
    return "I can help you generate images! Use the /generate command followed by your description. For example: /generate sunset landscape";
  }

  if (keywords.includes("help") || keywords.includes("what") || keywords.includes("can")) {
    return "I can help you with:\n• Answering questions\n• Generating images (use /generate)\n• Using various tools\n• And much more!\n\nWhat would you like to do?";
  }

  if (keywords.includes("thanks") || keywords.includes("thank")) {
    return "You're welcome! 😊 Is there anything else I can help you with?";
  }

  return randomResponse + " Feel free to ask me anything!";
}

export function getMockImageUrl(prompt: string): string {
  const hash = prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return mockImageUrls[hash % mockImageUrls.length];
}

export function getMockGenerationResult(prompt: string, model: string) {
  return {
    id: `mock-${Date.now()}`,
    task: "text2img" as const,
    model: model as any,
    result_url: getMockImageUrl(prompt),
    created_at: new Date(),
    status: "completed" as const,
  };
}

export async function simulateDelay(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
