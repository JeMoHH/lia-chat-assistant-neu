export type GenerationModel = 
  | "stable-diffusion-xl"
  | "stable-diffusion-3"
  | "flux-pro"
  | "midjourney-v6"
  | "dall-e-3"
  | "realistic-vision";

export type GenerationTask = "text2img" | "img2img" | "img2video";

export interface Text2ImgParams {
  prompt: string;
  model: GenerationModel;
  width?: number;
  height?: number;
  steps?: number;
  guidance_scale?: number;
  negative_prompt?: string;
}

export interface Img2ImgParams {
  image_url: string;
  prompt: string;
  model: GenerationModel;
  strength?: number;
  steps?: number;
  guidance_scale?: number;
}

export interface Img2VideoParams {
  image_url: string;
  model: "runway-gen3" | "pika-1.0" | "svd";
  motion_bucket_id?: number;
  duration?: number;
}

export interface GenerationResult {
  id: string;
  task: GenerationTask;
  model: GenerationModel;
  status: "pending" | "processing" | "completed" | "failed";
  result_url?: string;
  error?: string;
  created_at: Date;
  completed_at?: Date;
}

export const TEXT2IMG_MODELS: Record<GenerationModel, string> = {
  "stable-diffusion-xl": "Stable Diffusion XL - Schnell & hochwertig",
  "stable-diffusion-3": "Stable Diffusion 3 - Beste Qualität",
  "flux-pro": "Flux Pro - Ultra-realistisch",
  "midjourney-v6": "Midjourney v6 - Künstlerisch",
  "dall-e-3": "DALL-E 3 - OpenAI",
  "realistic-vision": "Realistic Vision - Fotorealistisch",
};

export const IMG2IMG_MODELS: Record<GenerationModel, string> = {
  "stable-diffusion-xl": "SDXL - Schnelle Transformation",
  "stable-diffusion-3": "SD3 - Präzise Änderungen",
  "flux-pro": "Flux - Realistische Anpassungen",
  "midjourney-v6": "Midjourney - Künstlerische Umwandlung",
  "dall-e-3": "DALL-E 3 - Intelligente Bearbeitung",
  "realistic-vision": "Realistic Vision - Fotorealistisch",
};

export const IMG2VIDEO_MODELS = {
  "runway-gen3": "Runway Gen-3 - 4K Video",
  "pika-1.0": "Pika 1.0 - Schnell & flüssig",
  "svd": "Stable Video Diffusion - Hochwertig",
};
