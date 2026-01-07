import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const ADMIN_PASSWORD = "LiafeelFree";
const ADMIN_SESSION_KEY = "lia_admin_session";
const ADMIN_TOKEN_KEY = "lia_admin_token";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
  isValid: boolean;
}

export class AdminAuth {
  private currentSession: AdminSession | null = null;

  async authenticate(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    if (password !== ADMIN_PASSWORD) {
      return {
        success: false,
        error: "Invalid password",
      };
    }

    const token = this.generateToken();
    const now = Date.now();

    const session: AdminSession = {
      token,
      createdAt: now,
      expiresAt: now + SESSION_TIMEOUT,
      isValid: true,
    };

    this.currentSession = session;

    try {
      await SecureStore.setItemAsync(ADMIN_TOKEN_KEY, token);
      await AsyncStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify({
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
        })
      );
    } catch {
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    }

    return {
      success: true,
      token,
    };
  }

  async verifyToken(token: string): Promise<boolean> {
    if (!this.currentSession) {
      // Try to restore session
      await this.restoreSession();
    }

    if (!this.currentSession) {
      return false;
    }

    if (this.currentSession.token !== token) {
      return false;
    }

    if (Date.now() > this.currentSession.expiresAt) {
      await this.logout();
      return false;
    }

    return true;
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.currentSession) {
      await this.restoreSession();
    }

    if (!this.currentSession) {
      return false;
    }

    if (Date.now() > this.currentSession.expiresAt) {
      await this.logout();
      return false;
    }

    return true;
  }

  async restoreSession(): Promise<AdminSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData) as AdminSession;

      if (Date.now() > session.expiresAt) {
        await this.logout();
        return null;
      }

      this.currentSession = session;
      return session;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    this.currentSession = null;
    try {
      await SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY);
    } catch {
      // Ignore
    }
    await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
  }

  getCurrentSession(): AdminSession | null {
    return this.currentSession;
  }

  getSessionTimeRemaining(): number {
    if (!this.currentSession) {
      return 0;
    }

    const remaining = this.currentSession.expiresAt - Date.now();
    return Math.max(0, remaining);
  }

  extendSession(): void {
    if (this.currentSession) {
      this.currentSession.expiresAt = Date.now() + SESSION_TIMEOUT;
    }
  }

  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (oldPassword !== ADMIN_PASSWORD) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // In a real app, you would hash and store the new password
    // For this demo, we'll just return success
    return {
      success: true,
    };
  }

  async resetPassword(): Promise<string> {
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).substring(2, 15);
    return tempPassword;
  }

  async getSessionInfo(): Promise<{
    isAuthenticated: boolean;
    createdAt?: number;
    expiresAt?: number;
    timeRemaining?: number;
  }> {
    const isAuth = await this.isAuthenticated();

    if (!isAuth) {
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      createdAt: this.currentSession?.createdAt,
      expiresAt: this.currentSession?.expiresAt,
      timeRemaining: this.getSessionTimeRemaining(),
    };
  }
}

export const adminAuth = new AdminAuth();
