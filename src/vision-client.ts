import OpenAI from "openai";
import { EnvConfig, VisionResponse } from "./types.js";

// Define proper types for OpenAI message content
type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export class VisionClient {
  private client: OpenAI;
  private modelName: string;
  private maxTokens: number;

  constructor(config: EnvConfig) {
    this.client = new OpenAI({
      baseURL: config.VISION_API_BASE_URL,
      apiKey: config.VISION_API_KEY,
    });

    this.modelName = config.VISION_MODEL_NAME;
    this.maxTokens = config.VISION_MAX_TOKENS;
  }

  /**
   * Send images and prompt to vision model
   */
  async analyzeImages(
    prompt: string,
    imageBase64Array: string[],
  ): Promise<string> {
    try {
      // Create content array with text and images
      const content: ChatContentPart[] = [
        { type: "text", text: prompt },
        ...imageBase64Array.map((base64) => ({
          type: "image_url" as const,
          image_url: { url: base64 },
        })),
      ];

      // Make API request
      const response = (await this.client.chat.completions.create({
        model: this.modelName,
        messages: [{ role: "user" as const, content }],
        max_tokens: this.maxTokens,
      })) as VisionResponse;

      // Return the assistant's response
      return (
        response.choices[0]?.message?.content ||
        "No response received from vision model"
      );
    } catch (error) {
      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Add additional context for common API errors
        if (error.message.includes("401")) {
          errorMessage =
            "Authentication failed. Please check your VISION_API_KEY.";
        } else if (error.message.includes("404")) {
          errorMessage =
            "Model not found. Please check your VISION_MODEL_NAME.";
        } else if (error.message.includes("429")) {
          errorMessage = "Rate limit exceeded. Please try again later.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      throw new Error(`Vision API error: ${errorMessage}`);
    }
  }
}
