import { Router } from "express";
import { invokeLLM } from "../_core/llm.js";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Call LLM with the user's message
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are Lia, an AI assistant with access to various tools and capabilities. You are helpful, friendly, and knowledgeable. Respond naturally and conversationally.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({ response: response.choices[0]?.message?.content || "Sorry, I couldn't process that." });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
});

export default router;
