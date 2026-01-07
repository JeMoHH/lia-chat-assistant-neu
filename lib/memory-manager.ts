import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ConversationMemory {
  conversationId: string;
  context: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
  customInstructions?: string;
  metadata?: Record<string, any>;
}

export interface MemoryEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

const MEMORY_STORAGE_PREFIX = "lia_memory_";
const CONVERSATION_MEMORY_PREFIX = "lia_conv_memory_";

export class MemoryManager {
  private conversationMemories: Map<string, ConversationMemory> = new Map();
  private memoryCache: Map<string, MemoryEntry> = new Map();

  async initialize(): Promise<void> {
    await this.loadAllMemories();
  }

  // Conversation-specific memory management
  async setConversationMemory(conversationId: string, memory: Partial<ConversationMemory>): Promise<void> {
    const existing = this.conversationMemories.get(conversationId) || this.getDefaultMemory(conversationId);

    const updated: ConversationMemory = {
      ...existing,
      ...memory,
      conversationId,
    };

    this.conversationMemories.set(conversationId, updated);
    await this.saveConversationMemory(conversationId, updated);
  }

  async getConversationMemory(conversationId: string): Promise<ConversationMemory> {
    let memory = this.conversationMemories.get(conversationId);

    if (!memory) {
      memory = await this.loadConversationMemory(conversationId) || undefined;
    }

    if (!memory) {
      memory = this.getDefaultMemory(conversationId);
      this.conversationMemories.set(conversationId, memory);
    }

    return memory;
  }

  async deleteConversationMemory(conversationId: string): Promise<void> {
    this.conversationMemories.delete(conversationId);
    try {
      await AsyncStorage.removeItem(`${CONVERSATION_MEMORY_PREFIX}${conversationId}`);
    } catch (error) {
      console.error("Failed to delete conversation memory:", error);
    }
  }

  // General memory management
  async setMemory(key: string, value: any, ttl?: number): Promise<void> {
    const entry: MemoryEntry = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
    };

    this.memoryCache.set(key, entry);
    await this.saveMemory(key, entry);
  }

  async getMemory(key: string): Promise<any | null> {
    let entry = this.memoryCache.get(key);

    if (!entry) {
      entry = await this.loadMemory(key) || undefined;
    }

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      await this.deleteMemory(key);
      return null;
    }

    return entry.value;
  }

  async deleteMemory(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(`${MEMORY_STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error("Failed to delete memory:", error);
    }
  }

  async clearMemory(): Promise<void> {
    this.memoryCache.clear();

    try {
      const keys = await AsyncStorage.getAllKeys();
      const memoryKeys = keys.filter((k) => k.startsWith(MEMORY_STORAGE_PREFIX));
      await AsyncStorage.multiRemove(memoryKeys);
    } catch (error) {
      console.error("Failed to clear memory:", error);
    }
  }

  // Context management for conversations
  async updateConversationContext(conversationId: string, context: string): Promise<void> {
    const memory = await this.getConversationMemory(conversationId);
    memory.context = context;
    await this.setConversationMemory(conversationId, memory);
  }

  async getConversationContext(conversationId: string): Promise<string> {
    const memory = await this.getConversationMemory(conversationId);
    return memory.context;
  }

  async appendToContext(conversationId: string, text: string): Promise<void> {
    const memory = await this.getConversationMemory(conversationId);
    memory.context = (memory.context || "") + "\n" + text;
    await this.setConversationMemory(conversationId, memory);
  }

  // System prompt management
  async setSystemPrompt(conversationId: string, prompt: string): Promise<void> {
    const memory = await this.getConversationMemory(conversationId);
    memory.systemPrompt = prompt;
    await this.setConversationMemory(conversationId, memory);
  }

  async getSystemPrompt(conversationId: string): Promise<string> {
    const memory = await this.getConversationMemory(conversationId);
    return memory.systemPrompt;
  }

  // Model parameters management
  async setModelParameters(
    conversationId: string,
    params: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<void> {
    const memory = await this.getConversationMemory(conversationId);

    if (params.temperature !== undefined) {
      memory.temperature = params.temperature;
    }
    if (params.maxTokens !== undefined) {
      memory.maxTokens = params.maxTokens;
    }
    if (params.model !== undefined) {
      memory.model = params.model;
    }

    await this.setConversationMemory(conversationId, memory);
  }

  async getModelParameters(conversationId: string): Promise<{
    temperature: number;
    maxTokens: number;
    model: string;
  }> {
    const memory = await this.getConversationMemory(conversationId);
    return {
      temperature: memory.temperature,
      maxTokens: memory.maxTokens,
      model: memory.model,
    };
  }

  // Custom instructions
  async setCustomInstructions(conversationId: string, instructions: string): Promise<void> {
    const memory = await this.getConversationMemory(conversationId);
    memory.customInstructions = instructions;
    await this.setConversationMemory(conversationId, memory);
  }

  async getCustomInstructions(conversationId: string): Promise<string | undefined> {
    const memory = await this.getConversationMemory(conversationId);
    return memory.customInstructions;
  }

  // Metadata management
  async setMetadata(conversationId: string, key: string, value: any): Promise<void> {
    const memory = await this.getConversationMemory(conversationId);

    if (!memory.metadata) {
      memory.metadata = {};
    }

    memory.metadata[key] = value;
    await this.setConversationMemory(conversationId, memory);
  }

  async getMetadata(conversationId: string, key: string): Promise<any | null> {
    const memory = await this.getConversationMemory(conversationId);

    if (!memory.metadata) {
      return null;
    }

    return memory.metadata[key] || null;
  }

  private getDefaultMemory(conversationId: string): ConversationMemory {
    return {
      conversationId,
      context: "",
      systemPrompt: "You are a helpful AI assistant.",
      temperature: 0.7,
      maxTokens: 2000,
      model: "gpt-3.5-turbo",
      metadata: {},
    };
  }

  private async saveConversationMemory(conversationId: string, memory: ConversationMemory): Promise<void> {
    try {
      await AsyncStorage.setItem(`${CONVERSATION_MEMORY_PREFIX}${conversationId}`, JSON.stringify(memory));
    } catch (error) {
      console.error("Failed to save conversation memory:", error);
    }
  }

  private async loadConversationMemory(conversationId: string): Promise<ConversationMemory | null> {
    try {
      const data = await AsyncStorage.getItem(`${CONVERSATION_MEMORY_PREFIX}${conversationId}`);

      if (data) {
        const memory = JSON.parse(data) as ConversationMemory;
        this.conversationMemories.set(conversationId, memory);
        return memory;
      }
    } catch (error) {
      console.error("Failed to load conversation memory:", error);
    }

    return null;
  }

  private async saveMemory(key: string, entry: MemoryEntry): Promise<void> {
    try {
      await AsyncStorage.setItem(`${MEMORY_STORAGE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error("Failed to save memory:", error);
    }
  }

  private async loadMemory(key: string): Promise<MemoryEntry | null> {
    try {
      const data = await AsyncStorage.getItem(`${MEMORY_STORAGE_PREFIX}${key}`);

      if (data) {
        const entry = JSON.parse(data) as MemoryEntry;
        this.memoryCache.set(key, entry);
        return entry;
      }
    } catch (error) {
      console.error("Failed to load memory:", error);
    }

    return null;
  }

  private async loadAllMemories(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const conversationMemoryKeys = keys.filter((k) => k.startsWith(CONVERSATION_MEMORY_PREFIX));

      for (const key of conversationMemoryKeys) {
        await this.loadMemory(key);
      }
    } catch (error) {
      console.error("Failed to load all memories:", error);
    }
  }

  async getMemoryStats(): Promise<{
    totalMemoryEntries: number;
    totalConversationMemories: number;
    memorySize: number;
  }> {
    let memorySize = 0;

    this.memoryCache.forEach((entry) => {
      memorySize += JSON.stringify(entry).length;
    });

    this.conversationMemories.forEach((memory) => {
      memorySize += JSON.stringify(memory).length;
    });

    return {
      totalMemoryEntries: this.memoryCache.size,
      totalConversationMemories: this.conversationMemories.size,
      memorySize,
    };
  }
}

export const memoryManager = new MemoryManager();
