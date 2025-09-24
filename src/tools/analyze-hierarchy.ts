import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VisionService } from "../services/vision-service.js";

export function registerAnalyzeHierarchyTool(server: McpServer, vision: VisionService) {
    server.registerTool(
        "analyze_visual_hierarchy",
        {
            title: "Analyze Visual Hierarchy",
            description: "Analyze visual hierarchy and design principles",
            inputSchema: {
                image_url: z.string().url()
            }
        },
        async ({ image_url }: { image_url: string }) => {
            const result = await vision.analyzeVisualHierarchy(image_url);
            return { content: [{ type: "text", text: JSON.stringify(result) }] };
        }
    );
}
