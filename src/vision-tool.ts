import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FileHandler } from "./file-handler.js";
import { VisionClient } from "./vision-client.js";
import { envSchema, visionToolSchema, VisionError } from "./types.js";

/**
 * Register vision tool with MCP server
 */
export function registerVisionTool(server: McpServer): void {
  // Validate environment
  let env;
  try {
    env = envSchema.parse(process.env);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Invalid environment configuration: ${errorMessage}`);
    throw new Error(`Configuration error: ${errorMessage}`);
  }

  // Create vision client
  const visionClient = new VisionClient(env);

  // Register the tool
  server.registerTool(
    "vision",
    {
      title: "Vision Analysis",
      description:
        'Analyze images using a vision model. Provide a prompt and image paths. This tool serves as "eyes" for models without vision capabilities, enabling them to understand and analyze images.',
      inputSchema: visionToolSchema,
    },
    async ({ prompt, image_paths }) => {
      try {
        // Validate inputs
        if (!prompt || prompt.trim().length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "Error: Prompt cannot be empty. Please provide a clear question or instruction for the vision model.",
              },
            ],
            isError: true,
          };
        }

        if (!image_paths || image_paths.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "Error: At least one image path must be provided.",
              },
            ],
            isError: true,
          };
        }

        console.error(
          `Processing vision request: prompt length=${prompt.length}, image count=${image_paths.length}`,
        );

        // Validate image paths
        FileHandler.validateImagePaths(image_paths);

        // Convert all images to base64
        const base64Images = await Promise.all(
          image_paths.map(async (imagePath, index) => {
            console.error(
              `Processing image ${index + 1}/${image_paths.length}: ${imagePath}`,
            );
            return FileHandler.imageToBase64(imagePath);
          }),
        );

        console.error(
          `All images processed, sending to vision model: ${env.VISION_MODEL_NAME}`,
        );

        // Get analysis from vision model
        const analysis = await visionClient.analyzeImages(prompt, base64Images);

        console.error(
          `Vision analysis completed, response length: ${analysis.length}`,
        );

        return {
          content: [
            {
              type: "text",
              text: analysis,
            },
          ],
        };
      } catch (error) {
        let errorMessage = "Unknown error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        console.error(`Vision tool error: ${errorMessage}`);

        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
