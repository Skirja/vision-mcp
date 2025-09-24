import { z } from "zod";
export function registerAnalyzeHierarchyTool(server, vision) {
    server.registerTool("analyze_visual_hierarchy", {
        title: "Analyze Visual Hierarchy",
        description: "Analyze visual hierarchy and design principles",
        inputSchema: {
            image_url: z
                .string()
                .min(1)
                .describe("Image location. Accepts: http(s) URL, file:// URL, Windows path (e.g. C:\\path\\file.png), or data: URI")
        }
    }, async ({ image_url }) => {
        const result = await vision.analyzeVisualHierarchy(image_url);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    });
}
