import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FavoriteImage, Collection, UserPreferences } from "@/types/favorites";

interface FavoritesState {
  favorites: FavoriteImage[];
  collections: Collection[];
  preferences: UserPreferences;
  isLoading: boolean;
}

type FavoritesAction =
  | { type: "SET_FAVORITES"; payload: FavoriteImage[] }
  | { type: "ADD_FAVORITE"; payload: FavoriteImage }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "SET_COLLECTIONS"; payload: Collection[] }
  | { type: "ADD_COLLECTION"; payload: Collection }
  | { type: "UPDATE_COLLECTION"; payload: Collection }
  | { type: "DELETE_COLLECTION"; payload: string }
  | { type: "UPDATE_PREFERENCES"; payload: Partial<UserPreferences> }
  | { type: "SET_LOADING"; payload: boolean };

const FavoritesContext = createContext<{
  state: FavoritesState;
  dispatch: React.Dispatch<FavoritesAction>;
  addFavorite: (favorite: FavoriteImage) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  createCollection: (name: string, description: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  isFavorited: (imageUrl: string) => boolean;
} | null>(null);

const FAVORITES_KEY = "@lia_favorites";
const COLLECTIONS_KEY = "@lia_collections";
const PREFERENCES_KEY = "@lia_preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "auto",
  devMode: false,
  notificationsEnabled: true,
  autoSaveToCloud: false,
  defaultModel: "stable-diffusion-xl",
};

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case "SET_FAVORITES":
      return { ...state, favorites: action.payload };
    case "ADD_FAVORITE":
      return { ...state, favorites: [action.payload, ...state.favorites] };
    case "REMOVE_FAVORITE":
      return { ...state, favorites: state.favorites.filter((f) => f.id !== action.payload) };
    case "SET_COLLECTIONS":
      return { ...state, collections: action.payload };
    case "ADD_COLLECTION":
      return { ...state, collections: [action.payload, ...state.collections] };
    case "UPDATE_COLLECTION":
      return {
        ...state,
        collections: state.collections.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "DELETE_COLLECTION":
      return {
        ...state,
        collections: state.collections.filter((c) => c.id !== action.payload),
        favorites: state.favorites.map((f) =>
          f.collectionId === action.payload ? { ...f, collectionId: undefined } : f
        ),
      };
    case "UPDATE_PREFERENCES":
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, {
    favorites: [],
    collections: [],
    preferences: DEFAULT_PREFERENCES,
    isLoading: false,
  });

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Save favorites whenever they change
  useEffect(() => {
    saveFavorites();
  }, [state.favorites]);

  // Save collections whenever they change
  useEffect(() => {
    saveCollections();
  }, [state.collections]);

  // Save preferences whenever they change
  useEffect(() => {
    savePreferences();
  }, [state.preferences]);

  const loadAllData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const [favoritesData, collectionsData, preferencesData] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(COLLECTIONS_KEY),
        AsyncStorage.getItem(PREFERENCES_KEY),
      ]);

      if (favoritesData) {
        const parsed = JSON.parse(favoritesData).map((f: any) => ({
          ...f,
          timestamp: new Date(f.timestamp),
        }));
        dispatch({ type: "SET_FAVORITES", payload: parsed });
      }

      if (collectionsData) {
        const parsed = JSON.parse(collectionsData).map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        }));
        dispatch({ type: "SET_COLLECTIONS", payload: parsed });
      }

      if (preferencesData) {
        dispatch({ type: "UPDATE_PREFERENCES", payload: JSON.parse(preferencesData) });
      }
    } catch (error) {
      console.error("Failed to load favorites data:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const saveFavorites = async () => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  const saveCollections = async () => {
    try {
      await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(state.collections));
    } catch (error) {
      console.error("Failed to save collections:", error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(state.preferences));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  const addFavorite = async (favorite: FavoriteImage) => {
    dispatch({ type: "ADD_FAVORITE", payload: favorite });
  };

  const removeFavorite = async (id: string) => {
    dispatch({ type: "REMOVE_FAVORITE", payload: id });
  };

  const createCollection = async (name: string, description: string) => {
    const collection: Collection = {
      id: Date.now().toString(),
      name,
      description,
      imageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
    };
    dispatch({ type: "ADD_COLLECTION", payload: collection });
  };

  const deleteCollection = async (id: string) => {
    dispatch({ type: "DELETE_COLLECTION", payload: id });
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    dispatch({ type: "UPDATE_PREFERENCES", payload: prefs });
  };

  const isFavorited = (imageUrl: string): boolean => {
    return state.favorites.some((f) => f.imageUrl === imageUrl);
  };

  return (
    <FavoritesContext.Provider
      value={{
        state,
        dispatch,
        addFavorite,
        removeFavorite,
        createCollection,
        deleteCollection,
        updatePreferences,
        isFavorited,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
