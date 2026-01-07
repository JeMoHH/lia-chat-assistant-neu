import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Chat, Message } from "@/types/chat";
import type { GenerationResult } from "@/types/generation";
import { sendImageGenerationNotification } from "@/lib/notifications";

export interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
}

type ChatAction =
  | { type: "SET_CHATS"; payload: Chat[] }
  | { type: "ADD_CHAT"; payload: Chat }
  | { type: "SET_CURRENT_CHAT"; payload: string }
  | { type: "ADD_MESSAGE"; payload: { chatId: string; message: Message } }
  | { type: "UPDATE_MESSAGE"; payload: { chatId: string; messageId: string; content: string } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "DELETE_CHAT"; payload: string };

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  createNewChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  getCurrentChat: () => Chat | undefined;
  generateImage: (prompt: string, model: string) => Promise<GenerationResult | null>;
} | null>(null);

const STORAGE_KEY = "@lia_chats";

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_CHATS":
      return { ...state, chats: action.payload };
    case "ADD_CHAT":
      return { ...state, chats: [action.payload, ...state.chats], currentChatId: action.payload.id };
    case "SET_CURRENT_CHAT":
      return { ...state, currentChatId: action.payload };
    case "ADD_MESSAGE":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId
            ? { ...chat, messages: [...chat.messages, action.payload.message], updatedAt: new Date() }
            : chat
        ),
      };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === action.payload.messageId ? { ...msg, content: action.payload.content, isTyping: false } : msg
                ),
              }
            : chat
        ),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "DELETE_CHAT":
      return {
        ...state,
        chats: state.chats.filter((chat) => chat.id !== action.payload),
        currentChatId: state.currentChatId === action.payload ? null : state.currentChatId,
      };
    default:
      return state;
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, {
    chats: [],
    currentChatId: null,
    isLoading: false,
  });

  // Load chats from AsyncStorage on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Save chats to AsyncStorage whenever they change
  useEffect(() => {
    if (state.chats.length > 0) {
      saveChats();
    }
  }, [state.chats]);

  const loadChats = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const chats = parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        dispatch({ type: "SET_CHATS", payload: chats });
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const saveChats = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.chats));
    } catch (error) {
      console.error("Failed to save chats:", error);
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: "ADD_CHAT", payload: newChat });
  };

  const getCurrentChat = () => {
    return state.chats.find((chat) => chat.id === state.currentChatId);
  };

  const generateImage = async (prompt: string, model: string): Promise<GenerationResult | null> => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:3000";
      const response = await fetch(`${apiUrl}/api/generation/text2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          width: 512,
          height: 512,
          steps: 20,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Generation failed: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Image generation error:", error instanceof Error ? error.message : String(error));
      return null;
    }
  };

  const sendMessage = async (content: string) => {
    if (!state.currentChatId || !content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    dispatch({ type: "ADD_MESSAGE", payload: { chatId: state.currentChatId, message: userMessage } });

    // Check for /generate command
    if (content.trim().startsWith("/generate ")) {
      const prompt = content.trim().substring(9);
      const typingMessage: Message = {
        id: `typing-${Date.now()}`,
        role: "assistant",
        content: "Generating image...",
        timestamp: new Date(),
        isTyping: true,
      };

      dispatch({ type: "ADD_MESSAGE", payload: { chatId: state.currentChatId, message: typingMessage } });

      const result = await generateImage(prompt, "stable-diffusion-xl");
      if (result?.result_url) {
        // Send notification
        await sendImageGenerationNotification(prompt, result.result_url);
        
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            chatId: state.currentChatId,
            messageId: typingMessage.id,
            content: `![Generated Image](${result.result_url})\n\n✅ Image generated with ${result.model}`,
          },
        });
      } else {
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            chatId: state.currentChatId,
            messageId: typingMessage.id,
            content: "❌ Failed to generate image. Please try again.",
          },
        });
      }
      return;
    }

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    };

    dispatch({ type: "ADD_MESSAGE", payload: { chatId: state.currentChatId, message: typingMessage } });

    try {
      // Call AI backend
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:3000";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();

      // Update typing message with actual response
      dispatch({
        type: "UPDATE_MESSAGE",
        payload: {
          chatId: state.currentChatId,
          messageId: typingMessage.id,
          content: data.response || "Sorry, I couldn't process that.",
        },
      });

      // Update chat title if it's the first message
      const currentChat = state.chats.find((c) => c.id === state.currentChatId);
      if (currentChat && currentChat.messages.length <= 2) {
        const updatedChats = state.chats.map((chat) =>
          chat.id === state.currentChatId ? { ...chat, title: content.slice(0, 50) } : chat
        );
        dispatch({ type: "SET_CHATS", payload: updatedChats });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to send message:", errorMessage);
      
      // Provide helpful fallback response
      let fallbackContent = "Sorry, I encountered an error. Please try again.";
      if (errorMessage.includes("Network")) {
        fallbackContent = "Network connection issue. Please check your internet connection and try again.";
      }
      
      dispatch({
        type: "UPDATE_MESSAGE",
        payload: {
          chatId: state.currentChatId,
          messageId: typingMessage.id,
          content: fallbackContent,
        },
      });
    }
  };

  return (
    <ChatContext.Provider value={{ state, dispatch, createNewChat, sendMessage, getCurrentChat, generateImage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
