import { useEffect, useState } from "react";

export interface OfflineState {
  isOnline: boolean;
  isConnected: boolean;
  type: string | null;
}

let offlineListeners: ((state: OfflineState) => void)[] = [];
let currentState: OfflineState = {
  isOnline: true,
  isConnected: true,
  type: "unknown",
};

export function initializeOfflineService() {
  // Use browser API for web, assume online for native
  if (typeof window !== "undefined") {
    const handleOnline = () => {
      const newState: OfflineState = {
        isOnline: true,
        isConnected: true,
        type: "online",
      };
      currentState = newState;
      notifyListeners(newState);
    };

    const handleOffline = () => {
      const newState: OfflineState = {
        isOnline: false,
        isConnected: false,
        type: "offline",
      };
      currentState = newState;
      notifyListeners(newState);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }

  return () => {};
}

function notifyListeners(state: OfflineState) {
  offlineListeners.forEach((listener) => listener(state));
}

export function subscribeToOfflineState(callback: (state: OfflineState) => void) {
  offlineListeners.push(callback);
  return () => {
    offlineListeners = offlineListeners.filter((l) => l !== callback);
  };
}

export function useOfflineState(): OfflineState {
  const [state, setState] = useState<OfflineState>(currentState);

  useEffect(() => {
    const unsubscribe = subscribeToOfflineState(setState);
    return unsubscribe;
  }, []);

  return state;
}

export function getOfflineState(): OfflineState {
  return currentState;
}

export function isOffline(): boolean {
  return !currentState.isOnline;
}

export function isOnline(): boolean {
  return currentState.isOnline;
}
