export interface FavoriteImage {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  timestamp: Date;
  collectionId?: string;
  tags: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  imageCount: number;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  isPublic: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  devMode: boolean;
  notificationsEnabled: boolean;
  autoSaveToCloud: boolean;
  defaultModel: string;
}

export interface CloudSyncData {
  favorites: FavoriteImage[];
  collections: Collection[];
  chatHistory: any[];
  preferences: UserPreferences;
  lastSyncTime: Date;
}
