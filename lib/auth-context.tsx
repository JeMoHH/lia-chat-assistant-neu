import React, { createContext, useReducer, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "./api-client";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: number;
  preferences?: Record<string, any>;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_AUTHENTICATED"; payload: { user: User; token: string } }
  | { type: "SET_UNAUTHENTICATED" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "UPDATE_USER"; payload: User };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_AUTHENTICATED":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        isLoading: false,
      };
    case "SET_UNAUTHENTICATED":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on app load
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      let token: string | null = null;

      // Try to get token from storage (AsyncStorage for better compatibility)
      try {
        token = await AsyncStorage.getItem("auth_token");
      } catch (error) {
        console.error("Failed to get auth token:", error);
      }

      if (!token) {
        dispatch({ type: "SET_UNAUTHENTICATED" });
        return;
      }

      apiClient.setToken(token);

      // Verify token with backend
      const response = await apiClient.getCurrentUser();

      if (response.success && response.data) {
        dispatch({
          type: "SET_AUTHENTICATED",
          payload: {
            user: response.data,
            token,
          },
        });
      } else {
        dispatch({ type: "SET_UNAUTHENTICATED" });
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      dispatch({ type: "SET_UNAUTHENTICATED" });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await apiClient.login(email, password);

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Store token in AsyncStorage
        try {
          await AsyncStorage.setItem("auth_token", token);
        } catch (error) {
          console.error("Failed to store auth token:", error);
        }

        apiClient.setToken(token);

        dispatch({
          type: "SET_AUTHENTICATED",
          payload: { user, token },
        });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: response.error || "Login failed",
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Login failed",
      });
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await apiClient.register(email, password, name);

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Store token in AsyncStorage
        try {
          await AsyncStorage.setItem("auth_token", token);
        } catch (error) {
          console.error("Failed to store auth token:", error);
        }

        apiClient.setToken(token);

        dispatch({
          type: "SET_AUTHENTICATED",
          payload: { user, token },
        });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: response.error || "Registration failed",
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Registration failed",
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      await apiClient.logout();

      // Clear stored token
      try {
        await AsyncStorage.removeItem("auth_token");
      } catch (error) {
        console.error("Failed to clear auth token:", error);
      }

      apiClient.clearToken();

      dispatch({ type: "SET_UNAUTHENTICATED" });
    } catch (error) {
      console.error("Logout error:", error);
      dispatch({ type: "SET_UNAUTHENTICATED" });
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(updates);

      if (response.success && response.data) {
        dispatch({
          type: "UPDATE_USER",
          payload: response.data,
        });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: response.error || "Profile update failed",
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Profile update failed",
      });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
