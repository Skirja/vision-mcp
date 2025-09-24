import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VisionService } from "../services/vision-service.js";
import { AnalysisType } from "../types/vision-types.js";

export function registerAnalyzeImageTool(server: McpServer, vision: VisionService) {
    server.registerTool(
        "analyze_image",
        {
            title: "Analyze Image",
            description: "Analyze image and return structured description",
            inputSchema: {
                image_url: z.string().url().describe("Publicly accessible image URL"),
                analysis_type: z.enum(["general", "ui", "layout", "components"]).optional()
            }
        },
        async ({ image_url, analysis_type }: { image_url: string; analysis_type?: AnalysisType }) => {
            const result = await vision.analyzeImage(image_url, (analysis_type as AnalysisType) ?? "general");
            return { content: [{ type: "text", text: JSON.stringify(result) }] };
        }
    );
}
