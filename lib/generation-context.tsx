import React, { createContext, useContext, useReducer } from "react";
import type { GenerationResult, Text2ImgParams, Img2ImgParams, Img2VideoParams } from "@/types/generation";

interface GenerationState {
  results: GenerationResult[];
  isGenerating: boolean;
  currentTask: string | null;
}

type GenerationAction =
  | { type: "ADD_RESULT"; payload: GenerationResult }
  | { type: "UPDATE_RESULT"; payload: GenerationResult }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "SET_CURRENT_TASK"; payload: string | null }
  | { type: "CLEAR_RESULTS" };

const GenerationContext = createContext<{
  state: GenerationState;
  dispatch: React.Dispatch<GenerationAction>;
  generateText2Img: (params: Text2ImgParams) => Promise<GenerationResult | null>;
  generateImg2Img: (params: Img2ImgParams) => Promise<GenerationResult | null>;
  generateImg2Video: (params: Img2VideoParams) => Promise<GenerationResult | null>;
} | null>(null);

function generationReducer(state: GenerationState, action: GenerationAction): GenerationState {
  switch (action.type) {
    case "ADD_RESULT":
      return { ...state, results: [action.payload, ...state.results] };
    case "UPDATE_RESULT":
      return {
        ...state,
        results: state.results.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload };
    case "SET_CURRENT_TASK":
      return { ...state, currentTask: action.payload };
    case "CLEAR_RESULTS":
      return { ...state, results: [] };
    default:
      return state;
  }
}

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(generationReducer, {
    results: [],
    isGenerating: false,
    currentTask: null,
  });

  const generateText2Img = async (params: Text2ImgParams): Promise<GenerationResult | null> => {
    try {
      dispatch({ type: "SET_GENERATING", payload: true });
      dispatch({ type: "SET_CURRENT_TASK", payload: "text2img" });

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:3000";
      const response = await fetch(`${apiUrl}/api/generation/text2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error("Generation failed");

      const result: GenerationResult = await response.json();
      dispatch({ type: "ADD_RESULT", payload: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Text2Img generation error:", errorMessage);
      return null;
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
      dispatch({ type: "SET_CURRENT_TASK", payload: null });
    }
  };

  const generateImg2Img = async (params: Img2ImgParams): Promise<GenerationResult | null> => {
    try {
      dispatch({ type: "SET_GENERATING", payload: true });
      dispatch({ type: "SET_CURRENT_TASK", payload: "img2img" });

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:3000";
      const response = await fetch(`${apiUrl}/api/generation/img2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error("Generation failed");

      const result: GenerationResult = await response.json();
      dispatch({ type: "ADD_RESULT", payload: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Img2Img generation error:", errorMessage);
      return null;
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
      dispatch({ type: "SET_CURRENT_TASK", payload: null });
    }
  };

  const generateImg2Video = async (params: Img2VideoParams): Promise<GenerationResult | null> => {
    try {
      dispatch({ type: "SET_GENERATING", payload: true });
      dispatch({ type: "SET_CURRENT_TASK", payload: "img2video" });

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:3000";
      const response = await fetch(`${apiUrl}/api/generation/img2video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error("Generation failed");

      const result: GenerationResult = await response.json();
      dispatch({ type: "ADD_RESULT", payload: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Img2Video generation error:", errorMessage);
      return null;
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
      dispatch({ type: "SET_CURRENT_TASK", payload: null });
    }
  };

  return (
    <GenerationContext.Provider
      value={{
        state,
        dispatch,
        generateText2Img,
        generateImg2Img,
        generateImg2Video,
      }}
    >
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error("useGeneration must be used within GenerationProvider");
  }
  return context;
}
