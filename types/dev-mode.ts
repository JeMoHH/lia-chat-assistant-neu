export interface DevModePrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  icon: string;
  difficulty: "easy" | "medium" | "hard";
}

export const DEV_MODE_PROMPTS: DevModePrompt[] = [
  // Testing Prompts
  {
    id: "test-basic",
    name: "Basic Test",
    description: "Simple test image generation",
    prompt: "A red cube on a white background, 3D render, professional lighting",
    category: "Testing",
    icon: "🧪",
    difficulty: "easy",
  },
  {
    id: "test-complex",
    name: "Complex Test",
    description: "Complex multi-element composition",
    prompt: "A steampunk airship flying over a Victorian city with clockwork mechanisms visible, detailed, intricate, fantasy art",
    category: "Testing",
    icon: "🧪",
    difficulty: "hard",
  },
  {
    id: "test-style-transfer",
    name: "Style Transfer Test",
    description: "Test style transfer capabilities",
    prompt: "A modern office building rendered in oil painting style, impressionist, vibrant colors",
    category: "Testing",
    icon: "🎨",
    difficulty: "medium",
  },

  // Performance Tests
  {
    id: "perf-speed",
    name: "Speed Test",
    description: "Quick generation for performance testing",
    prompt: "A simple geometric pattern, minimal colors",
    category: "Performance",
    icon: "⚡",
    difficulty: "easy",
  },
  {
    id: "perf-quality",
    name: "Quality Test",
    description: "Maximum quality test",
    prompt: "A photorealistic portrait of a person with intricate details, professional photography, studio lighting, 8k resolution",
    category: "Performance",
    icon: "✨",
    difficulty: "hard",
  },

  // Edge Cases
  {
    id: "edge-empty",
    name: "Empty Prompt",
    description: "Test empty prompt handling",
    prompt: "",
    category: "Edge Cases",
    icon: "⚠️",
    difficulty: "easy",
  },
  {
    id: "edge-long",
    name: "Very Long Prompt",
    description: "Test handling of extremely long prompts",
    prompt: "A highly detailed, photorealistic, ultra high resolution, 8k, cinematic, professional photography, award-winning, masterpiece, intricate details, complex composition, multiple elements, rich colors, dramatic lighting, volumetric lighting, ray tracing, global illumination, physically based rendering, perfect composition, rule of thirds, golden ratio, symmetrical, asymmetrical, balanced, dynamic, energetic, peaceful, serene, chaotic, organized, wild, tame, natural, artificial, organic, mechanical, biological, technological, futuristic, retro, vintage, modern, classical, renaissance, baroque, art deco, minimalist, maximalist, abstract, realistic, surreal, dreamlike, nightmarish, beautiful, ugly, grotesque, elegant, simple, complex, detailed, minimalist, maximalist, colorful, monochromatic, vibrant, muted, saturated, desaturated",
    category: "Edge Cases",
    icon: "⚠️",
    difficulty: "hard",
  },
  {
    id: "edge-special-chars",
    name: "Special Characters",
    description: "Test special characters in prompts",
    prompt: "A scene with symbols: @#$%^&*()_+-=[]{}|;:',.<>?/~ and emojis 🎨🎭🎪",
    category: "Edge Cases",
    icon: "⚠️",
    difficulty: "medium",
  },

  // Stress Tests
  {
    id: "stress-batch",
    name: "Batch Generation",
    description: "Generate multiple images rapidly",
    prompt: "A beautiful landscape with mountains and water",
    category: "Stress Test",
    icon: "💪",
    difficulty: "hard",
  },
  {
    id: "stress-memory",
    name: "Memory Test",
    description: "Test memory usage with large images",
    prompt: "A massive detailed scene with thousands of elements, ultra high resolution",
    category: "Stress Test",
    icon: "💾",
    difficulty: "hard",
  },

  // Creative Tests
  {
    id: "creative-abstract",
    name: "Abstract Art",
    description: "Generate abstract artwork",
    prompt: "Abstract art, geometric shapes, vibrant colors, modern, digital art, 3D render",
    category: "Creative",
    icon: "🎨",
    difficulty: "medium",
  },
  {
    id: "creative-surreal",
    name: "Surreal Dreamscape",
    description: "Generate surreal dream-like imagery",
    prompt: "Surreal dreamscape, floating islands, impossible geometry, magical, ethereal, glowing lights, fantasy art",
    category: "Creative",
    icon: "🌙",
    difficulty: "hard",
  },
  {
    id: "creative-animation",
    name: "Animation Frame",
    description: "Generate animation-ready frame",
    prompt: "Animation frame, character design, expressive pose, dynamic, colorful, cartoon style",
    category: "Creative",
    icon: "🎬",
    difficulty: "medium",
  },

  // Model-Specific Tests
  {
    id: "model-stable-diffusion",
    name: "Stable Diffusion Test",
    description: "Test Stable Diffusion specific features",
    prompt: "A painting in the style of Van Gogh, starry night, swirling patterns, vibrant blues and yellows",
    category: "Model Tests",
    icon: "🤖",
    difficulty: "medium",
  },
  {
    id: "model-dall-e",
    name: "DALL-E Style",
    description: "Test DALL-E style generation",
    prompt: "A whimsical illustration of a robot having tea with a cat, watercolor style, storybook illustration",
    category: "Model Tests",
    icon: "🤖",
    difficulty: "medium",
  },

  // Debug Prompts
  {
    id: "debug-colors",
    name: "Color Debug",
    description: "Debug color rendering",
    prompt: "A color palette with all primary and secondary colors clearly separated and labeled",
    category: "Debug",
    icon: "🐛",
    difficulty: "easy",
  },
  {
    id: "debug-text",
    name: "Text Rendering",
    description: "Debug text rendering in images",
    prompt: "A sign with clear text that reads 'HELLO WORLD', professional design",
    category: "Debug",
    icon: "🐛",
    difficulty: "medium",
  },
  {
    id: "debug-faces",
    name: "Face Generation",
    description: "Debug face generation quality",
    prompt: "A portrait of a person with clear facial features, professional photography, studio lighting",
    category: "Debug",
    icon: "🐛",
    difficulty: "hard",
  },
];

export function getDevModePromptsByCategory(category: string): DevModePrompt[] {
  return DEV_MODE_PROMPTS.filter((p) => p.category === category);
}

export function getDevModeCategories(): string[] {
  return Array.from(new Set(DEV_MODE_PROMPTS.map((p) => p.category)));
}

export function getDevModePromptById(id: string): DevModePrompt | undefined {
  return DEV_MODE_PROMPTS.find((p) => p.id === id);
}
