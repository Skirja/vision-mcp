import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerVisionTool } from "./vision-tool.js";
import { envSchema } from "./types.js";

/**
 * Main entry point for Vision MCP Server
 */
async function main() {
  // Validate environment configuration
  try {
    envSchema.parse(process.env);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Invalid environment configuration: ${errorMessage}`);
    console.error(
      "Required environment variables: VISION_API_KEY",
    );
    console.error(
      "Optional environment variables: VISION_API_BASE_URL, VISION_MODEL_NAME, VISION_MAX_TOKENS",
    );
    process.exit(1);
  }

  // Create MCP server
  const server = new McpServer({
    name: "vision-mcp",
    version: "1.0.0",
  });

  // Register vision tool
  registerVisionTool(server);

  // Create stdio transport and connect
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Vision MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
