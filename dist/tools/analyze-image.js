import { z } from "zod";
export function registerAnalyzeImageTool(server, vision) {
    server.registerTool("analyze_image", {
        title: "Analyze Image",
        description: "STEP 1: Analyze image for comprehensive UI/UX understanding. Use this first for general analysis to identify image type, components, layout structure, and design patterns. Supports analysis_type: 'general' (default), 'ui', 'layout', or 'components'. This is your starting point for any image analysis workflow.",
        inputSchema: {
            image_url: z
                .string()
                .min(1)
                .describe("Image location. Accepts: http(s) URL, file:// URL, Windows path (e.g. C:\\path\\file.png), or data: URI"),
            analysis_type: z.enum(["general", "ui", "layout", "components"]).optional()
        }
    }, async ({ image_url, analysis_type }) => {
        const result = await vision.analyzeImage(image_url, analysis_type ?? "general");
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    });
}
