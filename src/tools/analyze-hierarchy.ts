import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VisionService } from "../services/vision-service.js";

export function registerAnalyzeHierarchyTool(server: McpServer, vision: VisionService) {
    server.registerTool(
        "analyze_visual_hierarchy",
        {
            title: "Analyze Visual Hierarchy",
            description: "STEP 2: Analyze visual hierarchy and design system foundations. Use after initial analysis to understand color systems, typography scales, spacing patterns, and visual weight distribution. Provides design tokens and CSS variables structure for consistent implementation. Essential for establishing design system before component extraction.",
            inputSchema: {
                image_url: z
                    .string()
                    .min(1)
                    .describe(
                        "Image location. Accepts: http(s) URL, file:// URL, Windows path (e.g. C:\\path\\file.png), or data: URI"
                    )
            }
        },
        async ({ image_url }: { image_url: string }) => {
            const result = await vision.analyzeVisualHierarchy(image_url);
            return { content: [{ type: "text", text: JSON.stringify(result) }] };
        }
    );
}
