import axios, { AxiosInstance, AxiosError } from "axios";

/**
 * Real API Client for Lia
 * Replaces mock responses with actual API calls
 */

export interface APIConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  id: string;
  message: string;
  timestamp: number;
  confidence?: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  size?: string;
}

export interface ImageGenerationResponse {
  id: string;
  url: string;
  timestamp: number;
}

export interface VoiceTranscriptionRequest {
  audioUrl: string;
  language?: string;
}

export interface VoiceTranscriptionResponse {
  text: string;
  confidence: number;
  language: string;
}

class RealAPIClient {
  private client: AxiosInstance;
  private config: APIConfig;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;

  constructor(config: APIConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Lia-Chat-Assistant/1.0",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error("[API] Request error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor with retry logic
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response ${response.status} from ${response.config.url}`);
        this.retryCount = 0;
        return response;
      },
      async (error: AxiosError) => {
        if (this.shouldRetry(error) && this.retryCount < this.MAX_RETRIES) {
          this.retryCount++;
          console.warn(`[API] Retrying request (attempt ${this.retryCount}/${this.MAX_RETRIES})`);

          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, this.retryCount) * 1000));

          return this.client.request(error.config!);
        }

        console.error("[API] Request failed:", error.message);
        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx status codes
    if (!error.response) {
      return true; // Network error
    }

    const status = error.response.status;
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Send chat message and get AI response
   */
  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const response = await this.client.post<ChatResponse>("/api/chat", {
        messages,
        model: "gpt-4",
        temperature: 0.7,
      });

      return response.data;
    } catch (error) {
      throw this.handleError("Chat request failed", error);
    }
  }

  /**
   * Generate image from prompt
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await this.client.post<ImageGenerationResponse>("/api/generate-image", {
        ...request,
        model: "dall-e-3",
      });

      return response.data;
    } catch (error) {
      throw this.handleError("Image generation failed", error);
    }
  }

  /**
   * Transcribe voice to text
   */
  async transcribeVoice(request: VoiceTranscriptionRequest): Promise<VoiceTranscriptionResponse> {
    try {
      const response = await this.client.post<VoiceTranscriptionResponse>("/api/transcribe", {
        ...request,
        model: "whisper",
      });

      return response.data;
    } catch (error) {
      throw this.handleError("Voice transcription failed", error);
    }
  }

  /**
   * Synthesize text to speech
   */
  async synthesizeSpeech(text: string, language?: string): Promise<{ audioUrl: string }> {
    try {
      const response = await this.client.post<{ audioUrl: string }>("/api/synthesize", {
        text,
        language: language || "en",
        voice: "natural",
      });

      return response.data;
    } catch (error) {
      throw this.handleError("Speech synthesis failed", error);
    }
  }

  /**
   * Analyze code for bugs
   */
  async analyzeCode(code: string, language: string): Promise<{ issues: any[] }> {
    try {
      const response = await this.client.post<{ issues: any[] }>("/api/analyze-code", {
        code,
        language,
      });

      return response.data;
    } catch (error) {
      throw this.handleError("Code analysis failed", error);
    }
  }

  /**
   * Auto-fix code
   */
  async autoFixCode(code: string, language: string): Promise<{ fixed: string }> {
    try {
      const response = await this.client.post<{ fixed: string }>("/api/auto-fix-code", {
        code,
        language,
      });

      return response.data;
    } catch (error) {
      throw this.handleError("Auto-fix failed", error);
    }
  }

  /**
   * Execute code in sandbox
   */
  async executeCode(code: string, language: string): Promise<{ output: string; error?: string }> {
    try {
      const response = await this.client.post<{ output: string; error?: string }>(
        "/api/execute-code",
        {
          code,
          language,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError("Code execution failed", error);
    }
  }

  /**
   * Get expert knowledge on topic
   */
  async getExpertKnowledge(topic: string, domain: string): Promise<{ content: string }> {
    try {
      const response = await this.client.get<{ content: string }>("/api/expert-knowledge", {
        params: { topic, domain },
      });

      return response.data;
    } catch (error) {
      throw this.handleError("Failed to fetch expert knowledge", error);
    }
  }

  /**
   * Update Lia system
   */
  async updateLia(version: string): Promise<{ status: string; message: string }> {
    try {
      const response = await this.client.post<{ status: string; message: string }>(
        "/api/update-lia",
        {
          version,
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError("Update failed", error);
    }
  }

  /**
   * Get Lia status
   */
  async getLiaStatus(): Promise<{ version: string; status: string; uptime: number }> {
    try {
      const response = await this.client.get<{ version: string; status: string; uptime: number }>(
        "/api/lia-status"
      );

      return response.data;
    } catch (error) {
      throw this.handleError("Failed to get Lia status", error);
    }
  }

  private handleError(message: string, error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      console.error(`[API Error] ${message}:`, {
        status,
        data,
        message: error.message,
      });

      return new Error(`${message}: ${data?.message || error.message}`);
    }

    console.error(`[API Error] ${message}:`, error);
    return new Error(message);
  }

  /**
   * Set API base URL
   */
  setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
    this.client.defaults.baseURL = baseURL;
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  /**
   * Clear authorization token
   */
  clearAuthToken(): void {
    delete this.client.defaults.headers.common["Authorization"];
  }
}

// Initialize with default config (can be overridden)
const defaultConfig: APIConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  timeout: 30000,
  retries: 3,
};

export const realAPIClient = new RealAPIClient(defaultConfig);
