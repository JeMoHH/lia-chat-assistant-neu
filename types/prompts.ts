export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  template: string;
  icon: string;
  color?: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Art Styles
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    category: "Art Styles",
    description: "Futuristic neon aesthetic with dark tones",
    template: "Cyberpunk style, neon lights, futuristic, dark atmosphere, high-tech, {prompt}",
    icon: "🌃",
    color: "#FF006E",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    category: "Art Styles",
    description: "Soft, flowing watercolor painting style",
    template: "Watercolor painting, soft colors, flowing brushstrokes, artistic, {prompt}",
    icon: "🎨",
    color: "#00B4D8",
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    category: "Art Styles",
    description: "Classic oil painting technique",
    template: "Oil painting, classical style, rich colors, textured, masterpiece, {prompt}",
    icon: "🖼️",
    color: "#8B4513",
  },
  {
    id: "digital-art",
    name: "Digital Art",
    category: "Art Styles",
    description: "Modern digital illustration",
    template: "Digital art, modern illustration, vibrant colors, detailed, {prompt}",
    icon: "💻",
    color: "#7209B7",
  },
  {
    id: "anime",
    name: "Anime",
    category: "Art Styles",
    description: "Japanese anime style illustration",
    template: "Anime style, Japanese animation, expressive eyes, detailed, {prompt}",
    icon: "👾",
    color: "#FF006E",
  },
  {
    id: "pixel-art",
    name: "Pixel Art",
    category: "Art Styles",
    description: "Retro pixel art style",
    template: "Pixel art, retro style, 8-bit, blocky, nostalgic, {prompt}",
    icon: "🎮",
    color: "#FFB703",
  },
  {
    id: "sketch",
    name: "Sketch",
    category: "Art Styles",
    description: "Hand-drawn sketch style",
    template: "Pencil sketch, hand-drawn, detailed lines, artistic, {prompt}",
    icon: "✏️",
    color: "#555555",
  },
  {
    id: "3d-render",
    name: "3D Render",
    category: "Art Styles",
    description: "Professional 3D rendering",
    template: "3D render, professional, high quality, detailed, cinematic lighting, {prompt}",
    icon: "🎬",
    color: "#06FFA5",
  },

  // Photography Styles
  {
    id: "portrait",
    name: "Portrait",
    category: "Photography",
    description: "Professional portrait photography",
    template: "Professional portrait photography, studio lighting, sharp focus, beautiful, {prompt}",
    icon: "📸",
    color: "#FF006E",
  },
  {
    id: "landscape",
    name: "Landscape",
    category: "Photography",
    description: "Scenic landscape photography",
    template: "Landscape photography, scenic, natural lighting, wide angle, breathtaking, {prompt}",
    icon: "🏔️",
    color: "#00B4D8",
  },
  {
    id: "macro",
    name: "Macro",
    category: "Photography",
    description: "Macro photography with fine details",
    template: "Macro photography, extreme close-up, detailed, sharp focus, professional, {prompt}",
    icon: "🔬",
    color: "#06FFA5",
  },
  {
    id: "street-photography",
    name: "Street Photography",
    category: "Photography",
    description: "Candid street photography",
    template: "Street photography, candid moment, urban setting, natural light, artistic, {prompt}",
    icon: "🚶",
    color: "#FFB703",
  },

  // Fantasy & Sci-Fi
  {
    id: "fantasy",
    name: "Fantasy",
    category: "Fantasy & Sci-Fi",
    description: "Fantasy world with magical elements",
    template: "Fantasy art, magical world, dragons, castles, mystical, enchanted, {prompt}",
    icon: "🐉",
    color: "#9D4EDD",
  },
  {
    id: "steampunk",
    name: "Steampunk",
    category: "Fantasy & Sci-Fi",
    description: "Victorian steampunk aesthetic",
    template: "Steampunk style, Victorian era, gears, brass, mechanical, {prompt}",
    icon: "⚙️",
    color: "#CD5C5C",
  },
  {
    id: "sci-fi",
    name: "Sci-Fi",
    category: "Fantasy & Sci-Fi",
    description: "Science fiction futuristic setting",
    template: "Science fiction, futuristic, space, advanced technology, alien, {prompt}",
    icon: "🚀",
    color: "#00D9FF",
  },
  {
    id: "post-apocalyptic",
    name: "Post-Apocalyptic",
    category: "Fantasy & Sci-Fi",
    description: "Dystopian post-apocalyptic world",
    template: "Post-apocalyptic, dystopian, ruins, dark, gritty, survival, {prompt}",
    icon: "☢️",
    color: "#FF4500",
  },

  // Nature & Animals
  {
    id: "wildlife",
    name: "Wildlife",
    category: "Nature & Animals",
    description: "Wildlife in natural habitat",
    template: "Wildlife photography, animal in natural habitat, detailed, realistic, {prompt}",
    icon: "🦁",
    color: "#8B4513",
  },
  {
    id: "botanical",
    name: "Botanical",
    category: "Nature & Animals",
    description: "Detailed botanical illustration",
    template: "Botanical illustration, plants, flowers, detailed, scientific, {prompt}",
    icon: "🌿",
    color: "#228B22",
  },
  {
    id: "underwater",
    name: "Underwater",
    category: "Nature & Animals",
    description: "Underwater ocean scene",
    template: "Underwater photography, ocean, marine life, bioluminescent, magical, {prompt}",
    icon: "🌊",
    color: "#1E90FF",
  },

  // Mood & Atmosphere
  {
    id: "noir",
    name: "Film Noir",
    category: "Mood & Atmosphere",
    description: "Classic film noir style",
    template: "Film noir style, black and white, dramatic shadows, mysterious, {prompt}",
    icon: "🎭",
    color: "#000000",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    category: "Mood & Atmosphere",
    description: "Warm golden hour lighting",
    template: "Golden hour photography, warm sunlight, golden tones, romantic, {prompt}",
    icon: "🌅",
    color: "#FFD700",
  },
  {
    id: "neon-glow",
    name: "Neon Glow",
    category: "Mood & Atmosphere",
    description: "Vibrant neon glow effect",
    template: "Neon glow, vibrant colors, glowing lights, electric, modern, {prompt}",
    icon: "💡",
    color: "#00FF00",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    category: "Mood & Atmosphere",
    description: "Minimalist clean aesthetic",
    template: "Minimalist design, simple, clean, white space, elegant, {prompt}",
    icon: "⬜",
    color: "#FFFFFF",
  },

  // Cultural & Historical
  {
    id: "renaissance",
    name: "Renaissance",
    category: "Cultural & Historical",
    description: "Renaissance art period style",
    template: "Renaissance art, classical style, detailed, ornate, historical, {prompt}",
    icon: "🎨",
    color: "#DAA520",
  },
  {
    id: "art-deco",
    name: "Art Deco",
    category: "Cultural & Historical",
    description: "Art Deco geometric style",
    template: "Art Deco style, geometric patterns, luxurious, 1920s, elegant, {prompt}",
    icon: "💎",
    color: "#FFD700",
  },
  {
    id: "japanese",
    name: "Japanese Art",
    category: "Cultural & Historical",
    description: "Traditional Japanese art style",
    template: "Traditional Japanese art, ukiyo-e style, woodblock, serene, {prompt}",
    icon: "🗻",
    color: "#DC143C",
  },
  {
    id: "ancient-egypt",
    name: "Ancient Egypt",
    category: "Cultural & Historical",
    description: "Ancient Egyptian aesthetic",
    template: "Ancient Egyptian style, hieroglyphics, pyramids, golden, mystical, {prompt}",
    icon: "🏛️",
    color: "#FFD700",
  },

  // Technical & Special Effects
  {
    id: "hologram",
    name: "Hologram",
    category: "Special Effects",
    description: "Holographic effect",
    template: "Hologram effect, glowing, translucent, futuristic, digital, {prompt}",
    icon: "👁️",
    color: "#00FFFF",
  },
  {
    id: "glitch-art",
    name: "Glitch Art",
    category: "Special Effects",
    description: "Digital glitch effect",
    template: "Glitch art, digital distortion, corrupted, colorful, modern, {prompt}",
    icon: "📡",
    color: "#FF00FF",
  },
  {
    id: "mosaic",
    name: "Mosaic",
    category: "Special Effects",
    description: "Mosaic tile pattern",
    template: "Mosaic art, tile pattern, colorful, detailed, intricate, {prompt}",
    icon: "🧩",
    color: "#FF6347",
  },
];

export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
}

export function getCategories(): string[] {
  return Array.from(new Set(PROMPT_TEMPLATES.map((t) => t.category)));
}

export function applyTemplate(template: PromptTemplate, userPrompt: string): string {
  return template.template.replace("{prompt}", userPrompt);
}
