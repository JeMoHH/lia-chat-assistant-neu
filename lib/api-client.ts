import axios, { AxiosInstance, AxiosError } from "axios";
import { appConfigManager } from "./app-config";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
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
  size?: "small" | "medium" | "large";
}

export interface ImageGenerationResponse {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface VoiceTranscriptionResponse {
  text: string;
  language?: string;
  confidence?: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string = "";
  private token: string | null = null;

  constructor() {
    this.baseUrl = appConfigManager.getConfigValue("apiUrl");
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.token = null;
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  async chat(message: string, conversationId?: string): Promise<ApiResponse<ChatResponse>> {
    try {
      const response = await this.client.post<ChatResponse>("/api/chat", {
        message,
        conversationId,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ApiResponse<ImageGenerationResponse>> {
    try {
      const response = await this.client.post<ImageGenerationResponse>("/api/generate-image", request);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async transcribeAudio(audioData: Blob): Promise<ApiResponse<VoiceTranscriptionResponse>> {
    try {
      const formData = new FormData();
      formData.append("audio", audioData);

      const response = await this.client.post<VoiceTranscriptionResponse>("/api/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async synthesizeSpeech(text: string, language?: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await this.client.post(
        "/api/synthesize-speech",
        { text, language },
        {
          responseType: "blob",
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getConversationHistory(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const response = await this.client.get<ChatMessage[]>(`/api/conversations/${conversationId}/history`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createConversation(title: string): Promise<ApiResponse<{ id: string; title: string; createdAt: number }>> {
    try {
      const response = await this.client.post("/api/conversations", { title });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteConversation(conversationId: string): Promise<ApiResponse<void>> {
    try {
      await this.client.delete(`/api/conversations/${conversationId}`);

      return {
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async listConversations(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get("/api/conversations");

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      const response = await this.client.post("/api/auth/login", { email, password });

      if (response.data.token) {
        this.setToken(response.data.token);
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async register(email: string, password: string, name: string): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      const response = await this.client.post("/api/auth/register", { email, password, name });

      if (response.data.token) {
        this.setToken(response.data.token);
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      await this.client.post("/api/auth/logout");
      this.clearToken();

      return {
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get("/api/auth/me");

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProfile(updates: Record<string, any>): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.put("/api/auth/profile", updates);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get("/api/health");
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private handleError(error: any): ApiResponse<any> {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Unknown error",
        code: error.code,
      };
    }

    return {
      success: false,
      error: "Unknown error occurred",
    };
  }
}

export const apiClient = new ApiClient();
