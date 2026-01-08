import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MemoryStats {
  usedMemory: number;
  totalMemory: number;
  nativeMemory: number;
  jsHeapSize: number;
}

export class MemoryOptimizer {
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  async initialize(): Promise<void> {
    try {
      // Start periodic cleanup
      this.startPeriodicCleanup();

      // Initial cleanup
      await this.cleanup();

      console.log("Memory optimizer initialized");
    } catch (error) {
      console.error("Failed to initialize memory optimizer:", error);
    }
  }

  private startPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup().catch((error) => {
        console.error("Periodic cleanup failed:", error);
      });
    }, this.CLEANUP_INTERVAL);
  }

  async cleanup(): Promise<void> {
    try {
      // Clean up old data
      await this.cleanupOldData();

      // Optimize storage
      await this.optimizeStorage();

      // Clear caches
      this.clearMemoryCaches();

      console.log("Memory cleanup completed");
    } catch (error) {
      console.error("Memory cleanup failed:", error);
    }
  }

  private async cleanupOldData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();

      // Remove old conversation data (older than 30 days)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      for (const key of keys) {
        if (key.startsWith("lia_conv_memory_")) {
          try {
            const data = await AsyncStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              if (parsed.updatedAt && parsed.updatedAt < thirtyDaysAgo) {
                await AsyncStorage.removeItem(key);
              }
            }
          } catch {
            // Skip invalid data
          }
        }
      }
    } catch (error) {
      console.error("Failed to cleanup old data:", error);
    }
  }

  private async optimizeStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      // Calculate total storage size
      for (const key of keys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            totalSize += data.length;
          }
        } catch {
          // Skip
        }
      }

      // If storage is too large, remove oldest items
      if (totalSize > this.MAX_STORAGE_SIZE) {
        await this.removeOldestItems(keys, totalSize);
      }
    } catch (error) {
      console.error("Failed to optimize storage:", error);
    }
  }

  private async removeOldestItems(keys: readonly string[], currentSize: number): Promise<void> {
    const itemsWithTime: Array<{ key: string; time: number }> = [];

    for (const key of keys) {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data && key.startsWith("lia_")) {
          const parsed = JSON.parse(data);
          itemsWithTime.push({
            key,
            time: parsed.updatedAt || parsed.timestamp || 0,
          });
        }
      } catch {
        // Skip
      }
    }

    // Sort by time (oldest first)
    itemsWithTime.sort((a, b) => a.time - b.time);

    // Remove oldest items until size is acceptable
    let newSize = currentSize;
    for (const item of itemsWithTime) {
      if (newSize <= this.MAX_STORAGE_SIZE * 0.8) {
        break;
      }

      try {
        const data = await AsyncStorage.getItem(item.key);
        if (data) {
          newSize -= data.length;
          await AsyncStorage.removeItem(item.key);
        }
      } catch {
        // Skip
      }
    }
  }

  private clearMemoryCaches(): void {
    // Clear image cache if available
    try {
      const ImageCache = require("react-native").ImageCache;
      if (ImageCache && ImageCache.clearMemoryCache) {
        ImageCache.clearMemoryCache();
      }
    } catch {
      // Image cache not available
    }
  }

  getMemoryStats(): MemoryStats {
    let jsHeapSize = 0;

    try {
      if (global.gc) {
        global.gc();
      }

      if (performance && (performance as any).memory) {
        jsHeapSize = (performance as any).memory.usedJSHeapSize;
      }
    } catch {
      // Memory stats not available
    }

    return {
      usedMemory: 0,
      totalMemory: 0,
      nativeMemory: 0,
      jsHeapSize,
    };
  }

  async getStorageStats(): Promise<{
    usedSpace: number;
    itemCount: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let usedSpace = 0;

      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          usedSpace += data.length;
        }
      }

      return {
        usedSpace,
        itemCount: keys.length,
      };
    } catch (error) {
      console.error("Failed to get storage stats:", error);
      return { usedSpace: 0, itemCount: 0 };
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      this.clearMemoryCaches();
      console.log("All data cleared");
    } catch (error) {
      console.error("Failed to clear all data:", error);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export const memoryOptimizer = new MemoryOptimizer();
