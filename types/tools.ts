export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  enabled: boolean;
}

export type ToolCategory = "generation" | "search" | "utility" | "analysis";

export const AVAILABLE_TOOLS: Tool[] = [
  {
    id: "image-gen",
    name: "Image Generation",
    description: "Generate images from text descriptions",
    icon: "🎨",
    category: "generation",
    enabled: true,
  },
  {
    id: "web-search",
    name: "Web Search",
    description: "Search the internet for information",
    icon: "🔍",
    category: "search",
    enabled: true,
  },
  {
    id: "calculator",
    name: "Calculator",
    description: "Perform mathematical calculations",
    icon: "🔢",
    category: "utility",
    enabled: true,
  },
  {
    id: "code-exec",
    name: "Code Execution",
    description: "Run Python code and scripts",
    icon: "💻",
    category: "utility",
    enabled: true,
  },
  {
    id: "text-analysis",
    name: "Text Analysis",
    description: "Analyze and summarize text content",
    icon: "📝",
    category: "analysis",
    enabled: true,
  },
  {
    id: "translation",
    name: "Translation",
    description: "Translate text between languages",
    icon: "🌐",
    category: "utility",
    enabled: true,
  },
  {
    id: "weather",
    name: "Weather",
    description: "Get current weather information",
    icon: "🌤️",
    category: "search",
    enabled: true,
  },
  {
    id: "file-convert",
    name: "File Converter",
    description: "Convert files between formats",
    icon: "📄",
    category: "utility",
    enabled: true,
  },
];
