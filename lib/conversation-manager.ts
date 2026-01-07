import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Conversation {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  messages: ConversationMessage[];
  metadata?: Record<string, any>;
  pinned?: boolean;
  archived?: boolean;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ConversationSummary {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  pinned?: boolean;
  archived?: boolean;
}

const CONVERSATIONS_STORAGE_KEY = "lia_conversations";
const ACTIVE_CONVERSATION_KEY = "lia_active_conversation";

export class ConversationManager {
  private conversations: Map<string, Conversation> = new Map();
  private activeConversationId: string | null = null;

  async initialize(): Promise<void> {
    await this.loadConversations();
    await this.loadActiveConversation();
  }

  async createConversation(title: string, description?: string): Promise<Conversation> {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const conversation: Conversation = {
      id,
      title,
      description,
      createdAt: now,
      updatedAt: now,
      messages: [],
      metadata: {},
      pinned: false,
      archived: false,
    };

    this.conversations.set(id, conversation);
    await this.saveConversations();

    return conversation;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId);

    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
      await AsyncStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }

    await this.saveConversations();
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversations.get(conversationId) || null;
  }

  async listConversations(archived: boolean = false): Promise<ConversationSummary[]> {
    const summaries: ConversationSummary[] = [];

    this.conversations.forEach((conv) => {
      if (conv.archived === archived) {
        summaries.push({
          id: conv.id,
          title: conv.title,
          description: conv.description,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messageCount: conv.messages.length,
          pinned: conv.pinned,
          archived: conv.archived,
        });
      }
    });

    return summaries.sort((a, b) => {
      // Pinned conversations first
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      // Then by last updated
      return b.updatedAt - a.updatedAt;
    });
  }

  async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    metadata?: Record<string, any>
  ): Promise<ConversationMessage | null> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      return null;
    }

    const message: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now(),
      metadata,
    };

    conversation.messages.push(message);
    conversation.updatedAt = Date.now();

    await this.saveConversations();

    return message;
  }

  async getMessages(conversationId: string, limit?: number, offset?: number): Promise<ConversationMessage[]> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      return [];
    }

    let messages = conversation.messages;

    if (offset !== undefined) {
      messages = messages.slice(offset);
    }

    if (limit !== undefined) {
      messages = messages.slice(0, limit);
    }

    return messages;
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      return;
    }

    conversation.messages = conversation.messages.filter((m) => m.id !== messageId);
    conversation.updatedAt = Date.now();

    await this.saveConversations();
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation | null> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      return null;
    }

    const updated = {
      ...conversation,
      ...updates,
      id: conversation.id, // Prevent ID changes
      createdAt: conversation.createdAt, // Prevent creation time changes
      updatedAt: Date.now(),
    };

    this.conversations.set(conversationId, updated);
    await this.saveConversations();

    return updated;
  }

  async setActiveConversation(conversationId: string): Promise<void> {
    if (this.conversations.has(conversationId)) {
      this.activeConversationId = conversationId;
      await AsyncStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId);
    }
  }

  getActiveConversationId(): string | null {
    return this.activeConversationId;
  }

  async getActiveConversation(): Promise<Conversation | null> {
    if (!this.activeConversationId) {
      return null;
    }

    return this.getConversation(this.activeConversationId);
  }

  async pinConversation(conversationId: string, pinned: boolean): Promise<void> {
    await this.updateConversation(conversationId, { pinned });
  }

  async archiveConversation(conversationId: string, archived: boolean): Promise<void> {
    await this.updateConversation(conversationId, { archived });
  }

  async searchConversations(query: string): Promise<ConversationSummary[]> {
    const results: ConversationSummary[] = [];
    const lowerQuery = query.toLowerCase();

    this.conversations.forEach((conv) => {
      if (
        conv.title.toLowerCase().includes(lowerQuery) ||
        conv.description?.toLowerCase().includes(lowerQuery) ||
        conv.messages.some((m) => m.content.toLowerCase().includes(lowerQuery))
      ) {
        results.push({
          id: conv.id,
          title: conv.title,
          description: conv.description,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messageCount: conv.messages.length,
          pinned: conv.pinned,
          archived: conv.archived,
        });
      }
    });

    return results;
  }

  async exportConversation(conversationId: string): Promise<string | null> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      return null;
    }

    return JSON.stringify(conversation, null, 2);
  }

  async importConversation(data: string): Promise<Conversation | null> {
    try {
      const conversation = JSON.parse(data) as Conversation;

      // Generate new ID to avoid conflicts
      conversation.id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.conversations.set(conversation.id, conversation);
      await this.saveConversations();

      return conversation;
    } catch (error) {
      console.error("Failed to import conversation:", error);
      return null;
    }
  }

  async clearAllConversations(): Promise<void> {
    this.conversations.clear();
    this.activeConversationId = null;
    await AsyncStorage.removeItem(CONVERSATIONS_STORAGE_KEY);
    await AsyncStorage.removeItem(ACTIVE_CONVERSATION_KEY);
  }

  private async saveConversations(): Promise<void> {
    try {
      const data = Array.from(this.conversations.values());
      await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
  }

  private async loadConversations(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);

      if (data) {
        const conversations = JSON.parse(data) as Conversation[];
        conversations.forEach((conv) => {
          this.conversations.set(conv.id, conv);
        });
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }

  private async loadActiveConversation(): Promise<void> {
    try {
      const id = await AsyncStorage.getItem(ACTIVE_CONVERSATION_KEY);

      if (id && this.conversations.has(id)) {
        this.activeConversationId = id;
      }
    } catch (error) {
      console.error("Failed to load active conversation:", error);
    }
  }

  getStatistics(): {
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  } {
    let totalMessages = 0;

    this.conversations.forEach((conv) => {
      totalMessages += conv.messages.length;
    });

    return {
      totalConversations: this.conversations.size,
      totalMessages,
      averageMessagesPerConversation: this.conversations.size > 0 ? totalMessages / this.conversations.size : 0,
    };
  }
}

export const conversationManager = new ConversationManager();
