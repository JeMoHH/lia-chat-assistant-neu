import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Android-specific initialization to prevent crashes
 */
export async function initializeAndroidCompat(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  try {
    // Initialize AsyncStorage early
    await AsyncStorage.getItem("_init_marker");

    // Set up error handlers
    setupErrorHandlers();

    // Disable yellow box warnings in production
    if (!__DEV__) {
      (console as any).disableYellowBox = true;
    }

    console.log("Android compatibility initialization complete");
  } catch (error) {
    console.error("Failed to initialize Android compatibility:", error);
  }
}

function setupErrorHandlers(): void {
  // Handle unhandled promise rejections
  if (global.onunhandledrejection === undefined) {
    global.onunhandledrejection = ({ reason }: { reason: any }) => {
      console.error("Unhandled Promise Rejection:", reason);
    };
  }

  // Handle uncaught exceptions
  const originalErrorHandler = ErrorUtils.getGlobalHandler?.();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    console.error("Global Error Handler:", error, "isFatal:", isFatal);

    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal ?? false);
    }
  });
}

/**
 * Safely initialize modules that might fail on Android
 */
export async function safeModuleInit<T>(
  initFn: () => Promise<T>,
  moduleName: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await initFn();
  } catch (error) {
    console.warn(`Failed to initialize ${moduleName}:`, error);
    return fallback;
  }
}

/**
 * Check if a native module is available
 */
export function isNativeModuleAvailable(moduleName: string): boolean {
  // For now, just return true as require is not available in all contexts
  return true;
}

/**
 * Get Android API level
 */
export function getAndroidAPILevel(): number {
  try {
    const Platform = require("react-native").Platform;
    return Platform.Version || 0;
  } catch {
    return 0;
  }
}

/**
 * Check if running on Android emulator
 */
export function isAndroidEmulator(): boolean {
  try {
    const { Platform } = require("react-native");
    return Platform.OS === "android" && Platform.Version >= 16;
  } catch {
    return false;
  }
}
