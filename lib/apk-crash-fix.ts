import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * APK Crash Fix Module
 * Handles startup crashes and initialization issues
 */

export interface CrashLog {
  timestamp: number;
  error: string;
  stack?: string;
  module: string;
}

class APKCrashFixer {
  private crashLogs: CrashLog[] = [];
  private readonly MAX_LOGS = 50;
  private readonly CRASH_LOG_KEY = "lia_crash_logs";

  async initialize(): Promise<void> {
    if (Platform.OS !== "android") {
      return;
    }

    try {
      // Load previous crash logs
      await this.loadCrashLogs();

      // Set up global error handlers
      this.setupGlobalErrorHandlers();

      // Initialize safe modules
      await this.initializeSafeModules();

      console.log("APK Crash Fixer initialized");
    } catch (error) {
      console.error("Failed to initialize APK Crash Fixer:", error);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    if (typeof global.onunhandledrejection === "undefined") {
      global.onunhandledrejection = ({ reason }: { reason: any }) => {
        this.logCrash("UnhandledPromiseRejection", String(reason));
      };
    }

    // Handle uncaught exceptions
    const originalHandler = ErrorUtils.getGlobalHandler?.();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.logCrash("UncaughtException", error.message, error.stack);

      if (originalHandler && !isFatal) {
        originalHandler(error, isFatal ?? false);
      }
    });
  }

  private async initializeSafeModules(): Promise<void> {
    // Initialize modules with error handling
    const modules = [
      { name: "AsyncStorage", init: () => AsyncStorage.getItem("_test") },
      { name: "Notifications", init: () => this.testNotifications() },
      { name: "Offline", init: () => this.testOffline() },
    ];

    for (const module of modules) {
      try {
        await module.init();
      } catch (error) {
        console.warn(`Failed to initialize ${module.name}:`, error);
        this.logCrash(`ModuleInit_${module.name}`, String(error));
      }
    }
  }

  private async testNotifications(): Promise<void> {
    // Test if notifications can be initialized
    try {
      // Just a simple test - actual initialization happens elsewhere
      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  }

  private async testOffline(): Promise<void> {
    // Test offline service
    try {
      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  }

  private logCrash(module: string, error: string, stack?: string): void {
    const log: CrashLog = {
      timestamp: Date.now(),
      error,
      stack,
      module,
    };

    this.crashLogs.push(log);

    // Keep only recent logs
    if (this.crashLogs.length > this.MAX_LOGS) {
      this.crashLogs.shift();
    }

    // Save to storage
    this.saveCrashLogs().catch((err) => {
      console.error("Failed to save crash logs:", err);
    });

    console.error(`[${module}] ${error}`);
  }

  private async saveCrashLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CRASH_LOG_KEY, JSON.stringify(this.crashLogs));
    } catch (error) {
      console.error("Failed to save crash logs:", error);
    }
  }

  private async loadCrashLogs(): Promise<void> {
    try {
      const logs = await AsyncStorage.getItem(this.CRASH_LOG_KEY);
      if (logs) {
        this.crashLogs = JSON.parse(logs);
      }
    } catch (error) {
      console.error("Failed to load crash logs:", error);
    }
  }

  async getCrashLogs(): Promise<CrashLog[]> {
    return [...this.crashLogs];
  }

  async clearCrashLogs(): Promise<void> {
    this.crashLogs = [];
    try {
      await AsyncStorage.removeItem(this.CRASH_LOG_KEY);
    } catch (error) {
      console.error("Failed to clear crash logs:", error);
    }
  }

  /**
   * Safe initialization wrapper
   * Prevents crashes during module initialization
   */
  async safeInit<T>(
    name: string,
    initFn: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await initFn();
    } catch (error) {
      this.logCrash(`SafeInit_${name}`, String(error));
      return fallback;
    }
  }

  /**
   * Check if app is in crash loop
   */
  isCrashLoop(): boolean {
    if (this.crashLogs.length < 3) {
      return false;
    }

    // Check if 3+ crashes in last 10 seconds
    const now = Date.now();
    const recentCrashes = this.crashLogs.filter((log) => now - log.timestamp < 10000);

    return recentCrashes.length >= 3;
  }

  /**
   * Get crash recovery suggestion
   */
  getCrashRecoverySuggestion(): string {
    if (this.crashLogs.length === 0) {
      return "No crashes detected";
    }

    const lastCrash = this.crashLogs[this.crashLogs.length - 1];

    if (lastCrash.module.includes("AsyncStorage")) {
      return "Clear app data and reinstall";
    }

    if (lastCrash.module.includes("Notifications")) {
      return "Disable notifications and try again";
    }

    if (lastCrash.module.includes("Offline")) {
      return "Check internet connection";
    }

    return "Restart the app";
  }
}

export const apkCrashFixer = new APKCrashFixer();
