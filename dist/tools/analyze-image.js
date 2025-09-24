import { z } from "zod";
export function registerAnalyzeImageTool(server, vision) {
    server.registerTool("analyze_image", {
        title: "Analyze Image",
        description: "Analyze image and return structured description",
        inputSchema: {
            image_url: z.string().url().describe("Publicly accessible image URL"),
            analysis_type: z.enum(["general", "ui", "layout", "components"]).optional()
        }
    }, async ({ image_url, analysis_type }) => {
        const result = await vision.analyzeImage(image_url, analysis_type ?? "general");
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    });
}
