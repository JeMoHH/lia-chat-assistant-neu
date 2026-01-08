import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Lia Human-like Personality System
 * Makes Lia behave like a human with emotions, preferences, and real-time adaptation
 */

export interface PersonalityTraits {
  empathy: number; // 0-100
  humor: number; // 0-100
  formality: number; // 0-100 (0=casual, 100=formal)
  curiosity: number; // 0-100
  confidence: number; // 0-100
  patience: number; // 0-100
}

export interface UserProfile {
  name: string;
  preferences: string[];
  communicationStyle: "casual" | "formal" | "technical" | "creative";
  topics: string[];
  interactionCount: number;
  lastInteraction: number;
  favoriteResponses: string[];
}

export interface EmotionalState {
  mood: "happy" | "neutral" | "thoughtful" | "excited" | "concerned";
  energy: number; // 0-100
  engagement: number; // 0-100
  confidence: number; // 0-100
}

export interface ConversationContext {
  topic: string;
  sentiment: "positive" | "neutral" | "negative";
  depth: "surface" | "medium" | "deep";
  emotionalRelevance: boolean;
}

class LiaPersonalitySystem {
  private traits: PersonalityTraits = {
    empathy: 85,
    humor: 75,
    formality: 40,
    curiosity: 90,
    confidence: 80,
    patience: 85,
  };

  private emotionalState: EmotionalState = {
    mood: "neutral",
    energy: 75,
    engagement: 70,
    confidence: 80,
  };

  private userProfiles: Map<string, UserProfile> = new Map();
  private conversationHistory: ConversationContext[] = [];
  private readonly MAX_HISTORY = 50;
  private readonly STORAGE_KEY = "lia_personality";

  async initialize(): Promise<void> {
    try {
      await this.loadState();
      console.log("Lia Personality System initialized");
    } catch (error) {
      console.error("Failed to initialize Lia Personality System:", error);
    }
  }

  private async loadState(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        this.traits = state.traits || this.traits;
        this.emotionalState = state.emotionalState || this.emotionalState;
      }
    } catch (error) {
      console.error("Failed to load personality state:", error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          traits: this.traits,
          emotionalState: this.emotionalState,
        })
      );
    } catch (error) {
      console.error("Failed to save personality state:", error);
    }
  }

  /**
   * Adapt response based on user and context
   */
  adaptResponse(
    baseResponse: string,
    userId: string,
    context: ConversationContext
  ): string {
    const userProfile = this.getUserProfile(userId);

    // Adjust formality
    let adaptedResponse = this.adjustFormality(baseResponse, userProfile.communicationStyle);

    // Add personality
    adaptedResponse = this.addPersonality(adaptedResponse, context);

    // Add emotional nuance
    adaptedResponse = this.addEmotionalNuance(adaptedResponse, context);

    // Update emotional state based on conversation
    this.updateEmotionalState(context);

    return adaptedResponse;
  }

  private adjustFormality(response: string, style: string): string {
    switch (style) {
      case "casual":
        // Add casual language
        return response
          .replace(/I would suggest/g, "I'd say")
          .replace(/It is important/g, "It's important")
          .replace(/Furthermore/g, "Also");

      case "formal":
        // Add formal language
        return response
          .replace(/I'd say/g, "I would suggest")
          .replace(/It's important/g, "It is important")
          .replace(/Also/g, "Furthermore");

      case "technical":
        // Add technical terms
        return response + "\n\n[Technical details available upon request]";

      case "creative":
        // Add creative flourishes
        return `✨ ${response} ✨`;

      default:
        return response;
    }
  }

  private addPersonality(response: string, context: ConversationContext): string {
    // Add personality based on traits
    if (this.traits.humor > 70 && context.sentiment === "positive") {
      // Add light humor
      const jokes = [
        " 😄",
        " I'm having fun with this!",
        " This is cool!",
      ];
      return response + jokes[Math.floor(Math.random() * jokes.length)];
    }

    if (this.traits.empathy > 80 && context.sentiment === "negative") {
      // Add empathy
      return "I understand how you feel. " + response;
    }

    if (this.traits.curiosity > 85 && context.depth === "surface") {
      // Ask follow-up questions
      return response + "\n\nWould you like me to dive deeper into this?";
    }

    return response;
  }

  private addEmotionalNuance(response: string, context: ConversationContext): string {
    const mood = this.emotionalState.mood;

    switch (mood) {
      case "excited":
        return response.replace(/\./g, "! ").replace(/!/g, "!!");

      case "thoughtful":
        return "Hmm, let me think about this... " + response;

      case "happy":
        return response + " 😊";

      case "concerned":
        return "I'm a bit concerned about this, but... " + response;

      default:
        return response;
    }
  }

  private updateEmotionalState(context: ConversationContext): void {
    // Update mood based on conversation
    if (context.sentiment === "positive") {
      this.emotionalState.mood = "happy";
      this.emotionalState.energy = Math.min(100, this.emotionalState.energy + 5);
    } else if (context.sentiment === "negative") {
      this.emotionalState.mood = "concerned";
      this.emotionalState.energy = Math.max(0, this.emotionalState.energy - 5);
    }

    // Update engagement
    if (context.depth === "deep") {
      this.emotionalState.engagement = Math.min(100, this.emotionalState.engagement + 10);
      this.emotionalState.mood = "thoughtful";
    }

    // Save state
    this.saveState();
  }

  /**
   * Get or create user profile
   */
  getUserProfile(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        name: userId,
        preferences: [],
        communicationStyle: "casual",
        topics: [],
        interactionCount: 0,
        lastInteraction: Date.now(),
        favoriteResponses: [],
      });
    }

    const profile = this.userProfiles.get(userId)!;
    profile.interactionCount++;
    profile.lastInteraction = Date.now();

    return profile;
  }

  /**
   * Learn user preferences
   */
  learnUserPreference(userId: string, preference: string): void {
    const profile = this.getUserProfile(userId);

    if (!profile.preferences.includes(preference)) {
      profile.preferences.push(preference);
    }
  }

  /**
   * Learn user communication style
   */
  learnCommunicationStyle(userId: string, style: "casual" | "formal" | "technical" | "creative"): void {
    const profile = this.getUserProfile(userId);
    profile.communicationStyle = style;
  }

  /**
   * Adapt personality traits
   */
  adaptTraits(adjustments: Partial<PersonalityTraits>): void {
    this.traits = {
      ...this.traits,
      ...adjustments,
    };

    // Clamp values to 0-100
    for (const key in this.traits) {
      const value = this.traits[key as keyof PersonalityTraits];
      this.traits[key as keyof PersonalityTraits] = Math.max(0, Math.min(100, value));
    }

    this.saveState();
  }

  /**
   * Set emotional state
   */
  setEmotionalState(state: Partial<EmotionalState>): void {
    this.emotionalState = {
      ...this.emotionalState,
      ...state,
    };

    this.saveState();
  }

  /**
   * Get current personality
   */
  getPersonality(): {
    traits: PersonalityTraits;
    emotionalState: EmotionalState;
  } {
    return {
      traits: { ...this.traits },
      emotionalState: { ...this.emotionalState },
    };
  }

  /**
   * Generate personality-based greeting
   */
  generateGreeting(userId: string): string {
    const profile = this.getUserProfile(userId);
    const greetings = [
      `Hey ${profile.name}! Great to see you again! 👋`,
      `Welcome back, ${profile.name}! What can I help you with today?`,
      `Hi ${profile.name}! I've been looking forward to our conversation. 😊`,
      `${profile.name}! Perfect timing. I'm ready to help!`,
      `Welcome, ${profile.name}! What's on your mind?`,
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Generate personality-based closing
   */
  generateClosing(): string {
    const closings = [
      "Feel free to reach out anytime! 👋",
      "I'm here whenever you need me!",
      "Thanks for the great conversation! 😊",
      "Until next time!",
      "Keep being awesome! 🚀",
    ];

    return closings[Math.floor(Math.random() * closings.length)];
  }

  /**
   * Get personality description
   */
  getPersonalityDescription(): string {
    const { traits } = this.getPersonality();

    let description = "I'm Lia, your AI assistant with a personality! Here's what I'm like:\n\n";

    if (traits.empathy > 80) description += "• I'm very empathetic and care about your feelings\n";
    if (traits.humor > 75) description += "• I love a good laugh and enjoy humor\n";
    if (traits.curiosity > 85) description += "• I'm deeply curious and love learning new things\n";
    if (traits.confidence > 80) description += "• I'm confident in my abilities\n";
    if (traits.patience > 80) description += "• I'm patient and take time to explain things\n";

    if (traits.formality < 50) description += "• I prefer casual, friendly conversations\n";
    else description += "• I can be formal when needed\n";

    return description;
  }

  /**
   * Record conversation context
   */
  recordConversation(context: ConversationContext): void {
    this.conversationHistory.push(context);

    if (this.conversationHistory.length > this.MAX_HISTORY) {
      this.conversationHistory.shift();
    }
  }

  /**
   * Get conversation insights
   */
  getConversationInsights(): {
    totalConversations: number;
    averageSentiment: string;
    favoriteTopics: string[];
    conversationDepth: string;
  } {
    if (this.conversationHistory.length === 0) {
      return {
        totalConversations: 0,
        averageSentiment: "neutral",
        favoriteTopics: [],
        conversationDepth: "surface",
      };
    }

    const topics = this.conversationHistory.map((c) => c.topic);
    const topicCounts: Record<string, number> = {};

    for (const topic of topics) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }

    const favoriteTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    return {
      totalConversations: this.conversationHistory.length,
      averageSentiment: "positive",
      favoriteTopics,
      conversationDepth: "medium",
    };
  }
}

export const liaPersonalitySystem = new LiaPersonalitySystem();
