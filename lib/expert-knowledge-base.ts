import { realAPIClient } from "./real-api-client";

/**
 * Expert Knowledge Base for Lia
 * Provides expert-level knowledge across all domains
 */

export interface KnowledgeEntry {
  id: string;
  domain: string;
  topic: string;
  content: string;
  keywords: string[];
  relatedTopics: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  lastUpdated: number;
  confidence: number;
}

export interface ExpertQuery {
  domain: string;
  topic: string;
  question?: string;
  depth?: "overview" | "detailed" | "expert";
}

export interface ExpertResponse {
  domain: string;
  topic: string;
  content: string;
  references: string[];
  relatedTopics: string[];
  confidence: number;
}

class ExpertKnowledgeBase {
  private knowledge: Map<string, KnowledgeEntry[]> = new Map();
  private domains: string[] = [
    "programming",
    "mathematics",
    "physics",
    "chemistry",
    "biology",
    "history",
    "literature",
    "philosophy",
    "psychology",
    "economics",
    "business",
    "law",
    "medicine",
    "engineering",
    "art",
    "music",
    "sports",
    "technology",
    "science",
    "social-sciences",
  ];

  async initialize(): Promise<void> {
    try {
      // Load knowledge base from API
      for (const domain of this.domains) {
        await this.loadDomainKnowledge(domain);
      }

      console.log("Expert Knowledge Base initialized");
    } catch (error) {
      console.error("Failed to initialize Expert Knowledge Base:", error);
    }
  }

  private async loadDomainKnowledge(domain: string): Promise<void> {
    try {
      const response = await realAPIClient.getExpertKnowledge(domain, domain);
      this.knowledge.set(domain, this.parseKnowledge(response.content, domain));
    } catch (error) {
      console.warn(`Failed to load knowledge for domain '${domain}':`, error);
      // Initialize with default knowledge
      this.knowledge.set(domain, this.getDefaultKnowledge(domain));
    }
  }

  private parseKnowledge(content: string, domain: string): KnowledgeEntry[] {
    const entries: KnowledgeEntry[] = [];

    // Parse content into knowledge entries
    const sections = content.split("\n\n");

    for (const section of sections) {
      const lines = section.split("\n");
      const title = lines[0] || "Unknown";

      entries.push({
        id: `${domain}-${Date.now()}-${Math.random()}`,
        domain,
        topic: title,
        content: section,
        keywords: this.extractKeywords(section),
        relatedTopics: [],
        difficulty: "intermediate",
        lastUpdated: Date.now(),
        confidence: 0.85,
      });
    }

    return entries;
  }

  private extractKeywords(text: string): string[] {
    // Extract important keywords from text
    const words = text.split(/\s+/);
    const keywords: string[] = [];

    for (const word of words) {
      if (word.length > 5 && !this.isCommonWord(word)) {
        keywords.push(word.toLowerCase());
      }
    }

    return keywords.slice(0, 10);
  }

  private isCommonWord(word: string): boolean {
    const commonWords = ["the", "this", "that", "with", "from", "have", "been", "were", "which", "their"];
    return commonWords.includes(word.toLowerCase());
  }

  private getDefaultKnowledge(domain: string): KnowledgeEntry[] {
    const defaults: Record<string, KnowledgeEntry[]> = {
      programming: [
        {
          id: "prog-1",
          domain: "programming",
          topic: "Object-Oriented Programming",
          content: "OOP is a paradigm based on objects and classes...",
          keywords: ["OOP", "classes", "inheritance", "polymorphism"],
          relatedTopics: ["Design Patterns", "SOLID Principles"],
          difficulty: "intermediate",
          lastUpdated: Date.now(),
          confidence: 0.95,
        },
        {
          id: "prog-2",
          domain: "programming",
          topic: "Functional Programming",
          content: "Functional programming treats computation as the evaluation of mathematical functions...",
          keywords: ["functional", "immutable", "pure functions", "lambda"],
          relatedTopics: ["Recursion", "Higher-order functions"],
          difficulty: "advanced",
          lastUpdated: Date.now(),
          confidence: 0.9,
        },
      ],
      mathematics: [
        {
          id: "math-1",
          domain: "mathematics",
          topic: "Calculus",
          content: "Calculus is the mathematical study of continuous change...",
          keywords: ["calculus", "derivatives", "integrals", "limits"],
          relatedTopics: ["Analysis", "Differential Equations"],
          difficulty: "advanced",
          lastUpdated: Date.now(),
          confidence: 0.92,
        },
      ],
      technology: [
        {
          id: "tech-1",
          domain: "technology",
          topic: "Artificial Intelligence",
          content: "AI is the simulation of human intelligence by machines...",
          keywords: ["AI", "machine learning", "neural networks", "deep learning"],
          relatedTopics: ["Machine Learning", "Natural Language Processing"],
          difficulty: "advanced",
          lastUpdated: Date.now(),
          confidence: 0.88,
        },
      ],
    };

    return defaults[domain] || [];
  }

  /**
   * Query expert knowledge
   */
  async queryExpert(query: ExpertQuery): Promise<ExpertResponse> {
    try {
      // Try to get from real API first
      try {
        const response = await realAPIClient.getExpertKnowledge(query.topic, query.domain);
        return {
          domain: query.domain,
          topic: query.topic,
          content: response.content,
          references: [],
          relatedTopics: [],
          confidence: 0.9,
        };
      } catch (apiError) {
        // Fallback to local knowledge base
        console.warn("Real API query failed, using local knowledge:", apiError);
        return this.queryLocal(query);
      }
    } catch (error) {
      console.error("Expert query failed:", error);
      return {
        domain: query.domain,
        topic: query.topic,
        content: "I don't have enough information on this topic.",
        references: [],
        relatedTopics: [],
        confidence: 0.3,
      };
    }
  }

  private queryLocal(query: ExpertQuery): ExpertResponse {
    const domainKnowledge = this.knowledge.get(query.domain) || [];

    // Find matching entries
    const matches = domainKnowledge.filter(
      (entry) =>
        entry.topic.toLowerCase().includes(query.topic.toLowerCase()) ||
        entry.keywords.some((kw) => query.topic.toLowerCase().includes(kw))
    );

    if (matches.length === 0) {
      return {
        domain: query.domain,
        topic: query.topic,
        content: `No specific information found on ${query.topic} in ${query.domain}.`,
        references: [],
        relatedTopics: [],
        confidence: 0.2,
      };
    }

    const bestMatch = matches[0];

    return {
      domain: query.domain,
      topic: query.topic,
      content: bestMatch.content,
      references: bestMatch.relatedTopics,
      relatedTopics: bestMatch.relatedTopics,
      confidence: bestMatch.confidence,
    };
  }

  /**
   * Get expert in specific domain
   */
  async getExpertInDomain(domain: string): Promise<string> {
    const expertise = this.knowledge.get(domain);

    if (!expertise || expertise.length === 0) {
      return `I'm not yet an expert in ${domain}, but I'm learning.`;
    }

    const topics = expertise.map((e) => e.topic).slice(0, 5);
    return `I have expertise in ${domain}, particularly in: ${topics.join(", ")}`;
  }

  /**
   * Learn new knowledge
   */
  async learnNewKnowledge(entry: KnowledgeEntry): Promise<boolean> {
    try {
      const domainKnowledge = this.knowledge.get(entry.domain) || [];
      domainKnowledge.push(entry);
      this.knowledge.set(entry.domain, domainKnowledge);

      console.log(`Learned new knowledge: ${entry.topic} in ${entry.domain}`);
      return true;
    } catch (error) {
      console.error("Failed to learn new knowledge:", error);
      return false;
    }
  }

  /**
   * Get all domains
   */
  getDomains(): string[] {
    return [...this.domains];
  }

  /**
   * Get knowledge entries for domain
   */
  getKnowledgeForDomain(domain: string): KnowledgeEntry[] {
    return this.knowledge.get(domain) || [];
  }

  /**
   * Search across all knowledge
   */
  search(query: string): KnowledgeEntry[] {
    const results: KnowledgeEntry[] = [];
    const queryLower = query.toLowerCase();

    for (const entries of this.knowledge.values()) {
      for (const entry of entries) {
        if (
          entry.topic.toLowerCase().includes(queryLower) ||
          entry.content.toLowerCase().includes(queryLower) ||
          entry.keywords.some((kw) => kw.includes(queryLower))
        ) {
          results.push(entry);
        }
      }
    }

    return results;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalDomains: number;
    totalEntries: number;
    averageConfidence: number;
  } {
    let totalEntries = 0;
    let totalConfidence = 0;

    for (const entries of this.knowledge.values()) {
      totalEntries += entries.length;
      for (const entry of entries) {
        totalConfidence += entry.confidence;
      }
    }

    return {
      totalDomains: this.domains.length,
      totalEntries,
      averageConfidence: totalEntries > 0 ? totalConfidence / totalEntries : 0,
    };
  }
}

export const expertKnowledgeBase = new ExpertKnowledgeBase();
