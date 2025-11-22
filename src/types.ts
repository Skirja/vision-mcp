import { z } from 'zod';

// Environment variables schema
export const envSchema = z.object({
  VISION_API_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
  VISION_API_KEY: z.string().min(1),
  VISION_MODEL_NAME: z.string().default("gpt-4o"),
  VISION_MAX_TOKENS: z.string().transform(Number).default("32000")
});

// Tool input schema
export const visionToolSchema = z.object({
  prompt: z.string().describe("Query or instruction for the vision model"),
  image_paths: z.array(z.string()).describe("Paths to images to analyze")
});

// Vision API response
export interface VisionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Export type for environment
export type EnvConfig = z.infer<typeof envSchema>;

// Error type for better error handling
export interface VisionError extends Error {
  code?: string;
  statusCode?: number;
}

// Image processing options
export interface ImageProcessingOptions {
  maxImageSize: number; // in bytes
  supportedFormats: string[];
}
