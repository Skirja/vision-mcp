import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VisionService } from "../services/vision-service.js";
import { FrameworkType } from "../types/vision-types.js";

export function registerGenerateLayoutTool(server: McpServer, vision: VisionService) {
    server.registerTool(
        "generate_layout_description",
        {
            title: "Generate Layout Description",
            description: "Generate layout description for coding",
            inputSchema: {
                image_url: z.string().url(),
                framework: z.enum(["react", "vue", "html", "tailwind"])
            }
        },
        async ({ image_url, framework }: { image_url: string; framework: FrameworkType }) => {
            const result = await vision.generateLayoutDescription(image_url, framework as FrameworkType);
            return { content: [{ type: "text", text: JSON.stringify(result) }] };
        }
    );
}
