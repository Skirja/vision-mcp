import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VisionService } from "../services/vision-service.js";
import { FrameworkType } from "../types/vision-types.js";

export function registerGenerateLayoutTool(server: McpServer, vision: VisionService) {
    server.registerTool(
        "generate_layout_description",
        {
            title: "Generate Layout Description",
            description: "STEP 4: Generate framework-specific layout implementation. Use this as the final step to convert analysis into code-ready structure. Specify framework (react, vue, html, tailwind) for targeted implementation. Returns component hierarchy, layout methods (flexbox/grid), responsive behavior, and spacing system optimized for your chosen framework.",
            inputSchema: {
                image_url: z
                    .string()
                    .min(1)
                    .describe(
                        "Image location. Accepts: http(s) URL, file:// URL, Windows path (e.g. C:\\path\\file.png), or data: URI"
                    ),
                framework: z.enum(["react", "vue", "html", "tailwind"]).describe("Target output framework")
            }
        },
        async ({ image_url, framework }: { image_url: string; framework: FrameworkType }) => {
            const result = await vision.generateLayoutDescription(image_url, framework as FrameworkType);
            return { content: [{ type: "text", text: JSON.stringify(result) }] };
        }
    );
}
