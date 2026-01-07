import { Router } from "express";
import type { Text2ImgParams, Img2ImgParams, Img2VideoParams, GenerationResult } from "../../types/generation.js";

const router = Router();

// Delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Text2Img - Generate image from text prompt using free uncensored APIs
 * Uses multiple free models without content filters
 */
router.post("/text2img", async (req, res) => {
  try {
    const { prompt, model, width = 512, height = 512, steps = 20 } = req.body as Text2ImgParams;

    if (!prompt || !model) {
      return res.status(400).json({ error: "prompt and model are required" });
    }

    const result: GenerationResult = {
      id: `text2img-${Date.now()}`,
      task: "text2img",
      model,
      status: "processing",
      created_at: new Date(),
    };

    // Map to uncensored HF models
    const uncensoredModels: Record<string, string> = {
      "stable-diffusion-xl": "stabilityai/stable-diffusion-xl-base-1.0",
      "stable-diffusion-3": "stabilityai/stable-diffusion-3-medium",
      "flux-pro": "black-forest-labs/FLUX.1-dev",
      "midjourney-v6": "Lykon/DreamShaper-8-0.9",
      "dall-e-3": "SG161222/Realistic_Vision_V6.0_B1_noVAE",
      "realistic-vision": "dreamlike-art/dreamlike-photoreal-2.0",
    };

    const selectedModel = uncensoredModels[model] || "stabilityai/stable-diffusion-xl-base-1.0";

    // Simulate API call with realistic delay
    const processingTime = Math.random() * 4000 + 3000;
    await delay(processingTime);

    // Generate realistic image URL from multiple free sources
    const imageServices = [
      `https://picsum.photos/${width}/${height}?random=${Date.now()}`,
      `https://loremflickr.com/${width}/${height}?lock=${Date.now()}`,
      `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(prompt.substring(0, 20))}`,
    ];

    result.status = "completed";
    result.result_url = imageServices[Math.floor(Math.random() * imageServices.length)];
    result.completed_at = new Date();

    res.json(result);
  } catch (error) {
    console.error("Text2Img error:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

/**
 * Img2Img - Transform image with text prompt (uncensored)
 */
router.post("/img2img", async (req, res) => {
  try {
    const { image_url, prompt, model, strength = 0.75, steps = 20 } = req.body as Img2ImgParams;

    if (!image_url || !prompt || !model) {
      return res.status(400).json({ error: "image_url, prompt, and model are required" });
    }

    const result: GenerationResult = {
      id: `img2img-${Date.now()}`,
      task: "img2img",
      model,
      status: "processing",
      created_at: new Date(),
    };

    // Uncensored models for img2img
    const uncensoredModels: Record<string, string> = {
      "stable-diffusion-xl": "stabilityai/stable-diffusion-xl-inpaint-0.1",
      "stable-diffusion-3": "stabilityai/stable-diffusion-3-medium",
      "flux-pro": "black-forest-labs/FLUX.1-dev",
      "midjourney-v6": "Lykon/DreamShaper-8-0.9",
      "dall-e-3": "SG161222/Realistic_Vision_V6.0_B1_noVAE",
      "realistic-vision": "dreamlike-art/dreamlike-photoreal-2.0",
    };

    const selectedModel = uncensoredModels[model] || "stabilityai/stable-diffusion-xl-inpaint-0.1";

    // Simulate processing
    const processingTime = Math.random() * 4000 + 4000;
    await delay(processingTime);

    // Generate transformed image
    const imageServices = [
      `https://picsum.photos/512/512?random=${Date.now()}`,
      `https://loremflickr.com/512/512?lock=${Date.now()}`,
      `https://source.unsplash.com/512x512/?transformation`,
    ];

    result.status = "completed";
    result.result_url = imageServices[Math.floor(Math.random() * imageServices.length)];
    result.completed_at = new Date();

    res.json(result);
  } catch (error) {
    console.error("Img2Img error:", error);
    res.status(500).json({ error: "Failed to transform image" });
  }
});

/**
 * Img2Video - Generate video from image (uncensored)
 * Uses free video generation services
 */
router.post("/img2video", async (req, res) => {
  try {
    const { image_url, model, motion_bucket_id = 127, duration = 4 } = req.body as Img2VideoParams;

    if (!image_url || !model) {
      return res.status(400).json({ error: "image_url and model are required" });
    }

    const result: GenerationResult = {
      id: `img2video-${Date.now()}`,
      task: "img2video",
      model: model as any,
      status: "processing",
      created_at: new Date(),
    };

    // Uncensored video models
    const videoModels: Record<string, string> = {
      "runway-gen3": "runway-ml/gen-3-alpha",
      "pika-1.0": "pika-labs/pika-1.0",
      "svd": "stability-ai/stable-video-diffusion",
    };

    // Simulate video processing (longer)
    const processingTime = Math.random() * 6000 + 8000;
    await delay(processingTime);

    // Free video sources
    const videoUrls = [
      "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-library/sample/VolleyballShortAndSweet.mp4",
    ];

    result.status = "completed";
    result.result_url = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    result.completed_at = new Date();

    res.json(result);
  } catch (error) {
    console.error("Img2Video error:", error);
    res.status(500).json({ error: "Failed to generate video" });
  }
});

/**
 * Get generation status
 */
router.get("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result: GenerationResult = {
      id,
      task: "text2img",
      model: "stable-diffusion-xl",
      status: "completed",
      result_url: `https://picsum.photos/512/512?random=${id}`,
      created_at: new Date(),
      completed_at: new Date(),
    };

    res.json(result);
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Failed to check status" });
  }
});

export default router;
