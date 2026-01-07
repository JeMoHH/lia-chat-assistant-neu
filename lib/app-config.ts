import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AppConfig {
  appName: string;
  version: string;
  apiUrl: string;
  enableDebug: boolean;
  enableAnalytics: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
  maxChatHistory: number;
  autoSaveInterval: number;
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  cacheSize: number;
}

const DEFAULT_CONFIG: AppConfig = {
  appName: "Lia Chat Assistant",
  version: "1.0.0",
  apiUrl: "http://127.0.0.1:3000",
  enableDebug: false,
  enableAnalytics: false,
  theme: "auto",
  language: "en",
  maxChatHistory: 1000,
  autoSaveInterval: 30000,
  enableNotifications: true,
  enableOfflineMode: true,
  cacheSize: 100,
};

const CONFIG_STORAGE_KEY = "lia_app_config";

export class AppConfigManager {
  private config: AppConfig = { ...DEFAULT_CONFIG };

  async initialize(): Promise<void> {
    await this.loadConfig();
  }

  async loadConfig(): Promise<AppConfig> {
    try {
      const stored = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }
    return this.config;
  }

  async saveConfig(newConfig: Partial<AppConfig>): Promise<AppConfig> {
    this.config = { ...this.config, ...newConfig };
    try {
      await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error("Failed to save config:", error);
    }
    return this.config;
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  getConfigValue<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  async setConfigValue<K extends keyof AppConfig>(key: K, value: AppConfig[K]): Promise<void> {
    this.config[key] = value;
    try {
      await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error("Failed to set config value:", error);
    }
  }

  async resetToDefaults(): Promise<AppConfig> {
    this.config = { ...DEFAULT_CONFIG };
    try {
      await AsyncStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch {
      // Ignore
    }
    return this.config;
  }

  async exportConfig(): Promise<string> {
    return JSON.stringify(this.config, null, 2);
  }

  async importConfig(configJson: string): Promise<AppConfig> {
    try {
      const imported = JSON.parse(configJson) as Partial<AppConfig>;
      return await this.saveConfig(imported);
    } catch (error) {
      throw new Error("Invalid config format");
    }
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.appName || this.config.appName.length === 0) {
      errors.push("App name cannot be empty");
    }

    if (!this.config.apiUrl || this.config.apiUrl.length === 0) {
      errors.push("API URL cannot be empty");
    }

    if (this.config.maxChatHistory < 10) {
      errors.push("Max chat history must be at least 10");
    }

    if (this.config.autoSaveInterval < 5000) {
      errors.push("Auto-save interval must be at least 5 seconds");
    }

    if (this.config.cacheSize < 1) {
      errors.push("Cache size must be at least 1 MB");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getConfigDiff(other: AppConfig): Partial<AppConfig> {
    const diff: any = {};

    Object.keys(this.config).forEach((key) => {
      const k = key as keyof AppConfig;
      if (this.config[k] !== other[k]) {
        diff[k] = other[k];
      }
    });

    return diff as Partial<AppConfig>;
  }

  mergeConfig(other: Partial<AppConfig>): AppConfig {
    return { ...this.config, ...other };
  }
}

export const appConfigManager = new AppConfigManager();
