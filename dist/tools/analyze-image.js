import { z } from "zod";
export function registerAnalyzeImageTool(server, vision) {
    server.registerTool("analyze_image", {
        title: "Analyze Image",
        description: "Analyze image and return structured description",
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
