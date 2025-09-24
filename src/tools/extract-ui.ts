import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VisionService } from "../services/vision-service.js";

export function registerExtractUiTool(server: McpServer, vision: VisionService) {
    server.registerTool(
        "extract_ui_components",
        {
            title: "Extract UI Components",
            description: "Identify UI components in the image",
            inputSchema: {
                image_url: z
                    .string()
                    .min(1)
                    .describe(
                        "Image location. Accepts: http(s) URL, file:// URL, Windows path (e.g. C:\\path\\file.png), or data: URI"
                    ),
                component_types: z.array(z.string()).optional()
            }
        },
        async ({ image_url, component_types }: { image_url: string; component_types?: string[] }) => {
            const result = await vision.extractUIComponents(image_url, component_types);
            return { content: [{ type: "text", text: JSON.stringify(result) }] };
        }
    );
}
